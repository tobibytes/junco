import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { createInterface } from "node:readline/promises";
import {
  CONFIG_FILE,
  TAILWIND_IMPORT,
  defaultConfig,
  detectCssFile,
  detectFramework,
  detectPackageManager,
  readConfig,
  writeConfig,
  type CssMode,
  type JuncoConfig,
  type PackageManager,
} from "./config";
import { unifiedDiff } from "./diff";
import { readPackageJson, sha, toPosix } from "./fs-utils";
import { DEFAULT_REGISTRY, Registry, type RegistryItem } from "./registry";
import { destination, rewriteImports } from "./transform";

export interface Io {
  cwd: string;
  out: (line: string) => void;
  err: (line: string) => void;
  /** Run the package manager. Off in tests. */
  install: boolean;
  /** Interactive prompts allowed. */
  interactive: boolean;
  /** --registry flag, already merged with JUNCO_REGISTRY. */
  registry?: string;
}

export class CliError extends Error {}

const THEME_TYPES = new Set(["registry:theme", "registry:style"]);
const CSS_ITEM = "junco-css";

function requireConfig(io: Io): JuncoConfig {
  const config = readConfig(io.cwd);
  if (!config) throw new CliError(`No ${CONFIG_FILE} here. Run \`junco init\` first.`);
  return config;
}

function registryFor(io: Io, config?: JuncoConfig) {
  return new Registry(io.registry ?? config?.registry ?? DEFAULT_REGISTRY, io.cwd);
}

/* Package installs ---------------------------------------------------------------- */

function missingDeps(cwd: string, deps: string[]): string[] {
  const pkg = readPackageJson(cwd);
  const have = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const name = (spec: string) => (spec.startsWith("@") ? `@${spec.slice(1).split("@")[0]}` : spec.split("@")[0]!);
  return [...new Set(deps)].filter((d) => !(name(d) in have));
}

export function installCommand(pm: PackageManager, deps: string[]): string[] {
  return pm === "npm" ? ["npm", "install", ...deps] : [pm, "add", ...deps];
}

function install(io: Io, deps: string[]) {
  const missing = missingDeps(io.cwd, deps);
  if (!missing.length) return;
  const cmd = installCommand(detectPackageManager(io.cwd), missing);
  if (!io.install) {
    io.out(`Skipped installing dependencies. Run: ${cmd.join(" ")}`);
    return;
  }
  io.out(`Installing ${missing.join(", ")}`);
  const res = spawnSync(cmd[0]!, cmd.slice(1), { cwd: io.cwd, stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) throw new CliError(`${cmd.join(" ")} failed. Install the packages above by hand, then rerun.`);
}

/* Writing files --------------------------------------------------------------------- */

interface PlannedFile {
  dest: string;
  content: string;
}

function plan(item: RegistryItem, config: JuncoConfig): PlannedFile[] {
  return (item.files ?? []).map((file) => {
    if (file.content === undefined) throw new CliError(`Registry item "${item.name}" has no content for ${file.path}`);
    const dest = destination(file, config);
    return { dest, content: rewriteImports(file.content, dest, config) };
  });
}

function writeFile(io: Io, rel: string, content: string) {
  const abs = join(io.cwd, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
}

const readLocal = (io: Io, rel: string) => (existsSync(join(io.cwd, rel)) ? readFileSync(join(io.cwd, rel), "utf8") : undefined);

/* add --------------------------------------------------------------------------------- */

export interface AddOptions {
  overwrite?: boolean;
}

export async function add(io: Io, names: string[], options: AddOptions = {}) {
  if (!names.length) throw new CliError("Name at least one component: junco add button dialog");
  const config = requireConfig(io);
  const registry = registryFor(io, config);
  const items = (await registry.resolveTree(names)).filter((item) => !THEME_TYPES.has(item.type) && item.name !== CSS_ITEM);

  const deps: string[] = [];
  const written: string[] = [];
  const skipped: string[] = [];
  for (const item of items) {
    const record = config.installed[item.name];
    const files: Record<string, string> = { ...record?.files };
    for (const { dest, content } of plan(item, config)) {
      const local = readLocal(io, dest);
      const untouched = local !== undefined && record?.files[dest] === sha(local);
      if (local !== undefined && local !== content && !untouched && !options.overwrite) {
        skipped.push(dest);
        continue;
      }
      if (local !== content) {
        writeFile(io, dest, content);
        written.push(dest);
      }
      files[dest] = sha(content);
    }
    config.installed[item.name] = { hash: item.meta?.hash ?? sha(JSON.stringify(item.files)), files };
    deps.push(...(item.dependencies ?? []));
  }
  writeConfig(io.cwd, config);

  for (const f of written) io.out(`  + ${f}`);
  if (!written.length) io.out("Nothing new to write.");
  for (const f of skipped) io.err(`  ! ${f} exists and was changed by you. Kept it. Use --overwrite, or \`junco diff\` / \`junco update\`.`);
  install(io, deps);
  const asked = names.join(", ");
  io.out(`Added ${asked}${items.length > names.length ? ` (with ${items.length - names.length} dependencies)` : ""}.`);
}

/* init ---------------------------------------------------------------------------------- */

export interface InitOptions {
  css?: CssMode;
  cssFile?: string;
  force?: boolean;
  yes?: boolean;
}

async function ask(io: Io, question: string, choices: string[], fallback: string): Promise<string> {
  if (!io.interactive) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`${question} (${choices.join("/")}) [${fallback}] `)).trim();
    return choices.includes(answer) ? answer : fallback;
  } finally {
    rl.close();
  }
}

export async function init(io: Io, options: InitOptions = {}) {
  const existing = readConfig(io.cwd);
  if (existing && !options.force) {
    io.out(`${CONFIG_FILE} already exists. Use --force to start over, or \`junco add <name>\`.`);
    return;
  }
  if (!existsSync(join(io.cwd, "package.json"))) throw new CliError("No package.json here. Run junco init from your app's root folder.");

  const framework = detectFramework(io.cwd);
  const detected = detectCssFile(io.cwd, framework);
  const cssFile = options.cssFile ?? detected.file;
  if (!cssFile) {
    throw new CliError(
      "Couldn't find your global CSS file. Set up Tailwind CSS v4 first (https://tailwindcss.com/docs/installation), or pass --css-file src/index.css.",
    );
  }
  const cssPath = join(io.cwd, cssFile);
  const css = existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "";
  if (!TAILWIND_IMPORT.test(css)) {
    throw new CliError(`${cssFile} doesn't import Tailwind. Junco needs Tailwind CSS v4: add @import "tailwindcss"; to it first.`);
  }

  const mode: CssMode =
    options.css ??
    ((options.yes
      ? "package"
      : await ask(io, "Theme from the @junco/tailwind package, or inline the CSS into your project?", ["package", "inline"], "package")) as CssMode);

  const config = defaultConfig(io.cwd, { registry: io.registry, cssFile: toPosix(cssFile), cssMode: mode });
  const registry = registryFor(io, config);

  let importLine: string;
  const deps: string[] = [];
  if (mode === "inline") {
    const item = await registry.item(CSS_ITEM);
    const [file] = plan(item, config);
    if (!file) throw new CliError("The registry's junco-css item is empty.");
    writeFile(io, file.dest, file.content);
    io.out(`  + ${file.dest}`);
    let rel = toPosix(relative(dirname(cssFile), file.dest));
    if (!rel.startsWith(".")) rel = `./${rel}`;
    importLine = `@import "${rel}";`;
    config.installed[CSS_ITEM] = { hash: item.meta?.hash ?? "", files: { [file.dest]: sha(file.content) } };
  } else {
    importLine = `@import "@junco/tailwind";`;
    deps.push("@junco/tailwind");
  }

  if (!css.includes(importLine)) {
    const next = css.replace(TAILWIND_IMPORT, (m) => `${m.endsWith(";") ? m : `${m};`}\n${importLine}`);
    writeFileSync(cssPath, next);
    io.out(`  ~ ${cssFile} (added ${importLine})`);
  }

  writeConfig(io.cwd, config);
  io.out(`  + ${CONFIG_FILE}`);
  if (!config.aliases) io.out("No @/* path alias found in tsconfig, so components will use relative imports.");
  install(io, deps);
  await add(io, ["utils"]);
  io.out(`Junco is set up for ${framework}. Next: junco add button`);
}

/* diff / update ------------------------------------------------------------------------ */

async function upstreamFiles(io: Io, config: JuncoConfig, name: string) {
  const item = await registryFor(io, config).item(name);
  return { item, files: plan(item, config) };
}

export async function diff(io: Io, names: string[]) {
  const config = requireConfig(io);
  const targets = names.length ? names : Object.keys(config.installed).filter((n) => n !== CSS_ITEM);
  if (!targets.length) {
    io.out("Nothing installed yet.");
    return;
  }
  let changes = 0;
  for (const name of targets) {
    const { item, files } = await upstreamFiles(io, config, name);
    const record = config.installed[name];
    if (!names.length) {
      // summary mode: which installed items have upstream updates
      if (record && record.hash !== item.meta?.hash) {
        io.out(`${name}: update available`);
        changes++;
      }
      continue;
    }
    for (const { dest, content } of files) {
      const local = readLocal(io, dest);
      const patch = unifiedDiff(local ?? "", content, local === undefined ? "/dev/null" : `local/${dest}`, `upstream/${dest}`);
      if (patch) {
        io.out(patch);
        changes++;
      }
    }
  }
  if (!changes) io.out(names.length ? "No differences." : "Everything is up to date.");
}

export interface UpdateOptions {
  force?: boolean;
  /** You merged a .junco-upstream file by hand: record the upstream version as the new base. */
  resolved?: boolean;
  all?: boolean;
}

export async function update(io: Io, names: string[], options: UpdateOptions = {}) {
  const config = requireConfig(io);
  const targets = options.all || !names.length ? Object.keys(config.installed).filter((n) => n !== CSS_ITEM) : names;
  const deps: string[] = [];
  let conflicts = 0;
  for (const name of targets) {
    const record = config.installed[name];
    if (!record) {
      io.err(`${name} isn't installed. Use \`junco add ${name}\`.`);
      continue;
    }
    const { item, files } = await upstreamFiles(io, config, name);
    const hash = item.meta?.hash ?? "";
    const next: Record<string, string> = {};
    let changed = false;
    let itemConflict = false;
    for (const { dest, content } of files) {
      const local = readLocal(io, dest);
      const sidecar = `${dest}.junco-upstream`;
      if (options.resolved) {
        next[dest] = sha(local ?? content);
        continue;
      }
      if (local === content) {
        next[dest] = sha(content);
        continue;
      }
      const untouched = local === undefined || record.files[dest] === sha(local);
      if (untouched || options.force) {
        writeFile(io, dest, content);
        io.out(`  ~ ${dest}`);
        next[dest] = sha(content);
        changed = true;
      } else {
        writeFile(io, sidecar, content);
        io.err(`  ! ${dest} has local changes. Upstream version written to ${sidecar}.`);
        next[dest] = record.files[dest] ?? "";
        itemConflict = true;
      }
    }
    if (itemConflict) {
      conflicts++;
      continue; // keep the old base hash until resolved
    }
    config.installed[name] = { hash, files: next };
    deps.push(...(item.dependencies ?? []));
    if (options.resolved) io.out(`${name}: marked as merged with upstream ${hash}.`);
    else io.out(changed ? `${name}: updated.` : `${name}: up to date.`);
  }
  writeConfig(io.cwd, config);
  install(io, deps);
  if (conflicts) {
    io.err(
      `\n${conflicts} component(s) need a manual merge. Compare each file with its .junco-upstream copy, keep what you want, delete the .junco-upstream file, then run \`junco update <name> --resolved\`. Or \`junco update <name> --force\` to take upstream and drop your changes.`,
    );
    throw new CliError("Update finished with conflicts.");
  }
}

/* list / eject ------------------------------------------------------------------------- */

export async function list(io: Io, options: { installed?: boolean } = {}) {
  const config = readConfig(io.cwd);
  const index = await registryFor(io, config).index();
  const rows = index.items.filter((i) => !THEME_TYPES.has(i.type) && i.name !== CSS_ITEM && (!options.installed || config?.installed[i.name]));
  const width = Math.max(...rows.map((r) => r.name.length), 4);
  for (const item of rows) {
    const record = config?.installed[item.name];
    const status = record ? (record.hash === item.meta?.hash ? " [installed]" : " [update available]") : "";
    io.out(`${item.name.padEnd(width)}  ${item.type.replace("registry:", "").padEnd(5)}  ${item.description ?? ""}${status}`);
  }
}

export function eject(io: Io) {
  io.out(
    "junco eject isn't built yet. For now, `junco add <name>` gives you the same source as the installed package; switch the import from \"junco\" to your local copy.",
  );
}
