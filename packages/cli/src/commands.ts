import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, posix, relative, resolve, sep } from "node:path";
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
import { DEFAULT_REGISTRY, Registry, type PageSummary, type RegistryItem } from "./registry";
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

/**
 * Registry content is untrusted: a tampered or buggy registry must never make us write outside the
 * project (`../../.ssh/authorized_keys`, `/etc/...`). Checked on the planned path and again on write.
 */
function assertInsideProject(item: string, dest: string) {
  const norm = posix.normalize(dest.replaceAll("\\", "/"));
  if (isAbsolute(dest) || posix.isAbsolute(norm) || norm === ".." || norm.startsWith("../")) {
    throw new CliError(`Registry item "${item}" wants to write ${dest}, which is outside the project. Nothing was written.`);
  }
}

function plan(item: RegistryItem, config: JuncoConfig): PlannedFile[] {
  return (item.files ?? []).map((file) => {
    if (file.content === undefined) throw new CliError(`Registry item "${item.name}" has no content for ${file.path}`);
    for (const raw of [file.path, file.target]) {
      if (raw && (isAbsolute(raw) || posix.isAbsolute(raw.replaceAll("\\", "/")))) {
        throw new CliError(`Registry item "${item.name}" wants to write ${raw}, which is outside the project. Nothing was written.`);
      }
    }
    const dest = destination(file, config);
    assertInsideProject(item.name, dest);
    return { dest, content: rewriteImports(file.content, dest, config) };
  });
}

function writeFile(io: Io, rel: string, content: string) {
  const root = resolve(io.cwd);
  const abs = resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + sep)) throw new CliError(`Refusing to write ${rel}: it's outside the project.`);
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
  // Plan everything first, so a bad item fails the whole add before anything is written.
  const planned = items.map((item) => ({ item, files: plan(item, config) }));
  for (const { item, files: plannedFiles } of planned) {
    const record = config.installed[item.name];
    const files: Record<string, string> = { ...record?.files };
    for (const { dest, content } of plannedFiles) {
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

/* add page ---------------------------------------------------------------------------- */

export interface AddPageOptions {
  variant?: string;
  overwrite?: boolean;
  source?: boolean;
}

const pascal = (name: string) =>
  name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

/** The page index is registry content, so it's checked before any of it lands in code. */
function assertSafePage(page: PageSummary) {
  const ok =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.name) &&
    /^[A-Z][A-Za-z0-9]*$/.test(page.component) &&
    /^@junco\/blocks(?:\/[a-z]+)?$/.test(page.importFrom) &&
    page.variants.length > 0 &&
    page.variants.every((v) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) &&
    (page.sourceEntry === undefined || /^(?:[a-z0-9-]+\/)*[a-z0-9-]+$/.test(page.sourceEntry)) &&
    (page.sourceFiles === undefined || page.sourceFiles.every((file) => /^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.tsx?$/.test(file)));
  if (!ok) throw new CliError(`The registry's entry for page "${page.name}" doesn't look right. Nothing was written.`);
}

export function pageSource(page: PageSummary, variant: string, source = false): string {
  const prop = page.variants.length > 1 ? ` variant="${variant}"` : "";
  const variants = page.variants.length > 1 ? ` Variants: ${page.variants.join(", ")}.` : "";
  const from = source ? `../junco/blocks/${page.sourceEntry}` : page.importFrom;
  return `import { ${page.component} } from "${from}";

/**
 * ${page.title}, from Junco. Pass your data as props; anything you leave out shows realistic fake
 * data.${variants}${page.docs ? `\n * Props, slots and examples: ${page.docs}` : ""}
 */
export function ${pascal(page.name)}() {
  return <${page.component}${prop} />;
}
`;
}

/**
 * Tailwind only generates classes it sees, so the stylesheet needs `@source` lines for the
 * installed packages' built files. Returns the new CSS, or undefined when nothing was missing.
 */
export function withSources(css: string, cssFile: string, packages: string[]): string | undefined {
  const missing = packages.filter((p) => !css.includes(`${p}/dist`)).sort();
  if (!missing.length) return undefined;
  const lines = missing.map((p) => `@source "${toPosix(relative(dirname(cssFile), join("node_modules", p, "dist")))}";`);
  const block = `\n/* Tailwind needs to see the classes Junco's components and blocks use. */\n${lines.join("\n")}\n`;
  const imports = [...css.matchAll(/^@import[^\n]*\n?/gm)];
  const last = imports.at(-1);
  if (!last) return `${block.trimStart()}\n${css}`;
  const at = last.index + last[0].length;
  return `${css.slice(0, at)}${css.slice(0, at).endsWith("\n") ? "" : "\n"}${block}${css.slice(at)}`;
}

export async function addPage(io: Io, name: string | undefined, options: AddPageOptions = {}) {
  const config = requireConfig(io);
  const { pages, dependencies } = await registryFor(io, config).pages();
  const names = pages.map((p) => p.name).join(", ");
  if (!name) throw new CliError(`Name a page: junco add page dashboard\nPages: ${names}`);
  const page = pages.find((p) => p.name === name || p.slug === name);
  if (!page) throw new CliError(`Unknown page "${name}".\nPages: ${names}`);
  assertSafePage(page);
  const variant = options.variant ?? page.variants[0]!;
  if (!page.variants.includes(variant)) {
    throw new CliError(`${page.title} has no "${variant}" variant. Pick one of: ${page.variants.join(", ")}`);
  }
  const selectedDependencies = options.source
    ? dependencies
    : dependencies.filter((d) => d.startsWith("@junco/blocks@") || d.startsWith("@junco/react@"));
  const deps = selectedDependencies.filter((d) => /^[a-z0-9@/.-]+(?:@[\^~]?\d+\.\d+\.\d+)?$/.test(d)).sort();

  const dest = `${config.paths.components}/pages/${page.name}.tsx`;
  assertInsideProject(page.name, dest);
  const content = pageSource(page, variant, options.source);
  const planned: PlannedFile[] = [{ dest, content }];
  if (options.source) {
    if (!page.sourceEntry || !page.sourceFiles?.length) throw new CliError("This registry does not include page source files. Update the registry and try again.");
    const sourceRoot = `${config.paths.components}/junco/blocks`;
    const registry = registryFor(io, config);
    for (const file of page.sourceFiles) {
      if (!/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.tsx?$/.test(file)) throw new CliError("The registry's source file list doesn't look right. Nothing was written.");
      const fileDest = `${sourceRoot}/${file}`;
      assertInsideProject(page.name, fileDest);
      planned.push({ dest: fileDest, content: await registry.pageSource(file) });
    }
  }

  for (const file of planned) {
    const local = readLocal(io, file.dest);
    if (local !== undefined && local !== file.content && !options.overwrite) {
      throw new CliError(`${file.dest} already exists. Use --overwrite to replace it.`);
    }
  }
  for (const file of planned) {
    if (readLocal(io, file.dest) !== file.content) {
      writeFile(io, file.dest, file.content);
      io.out(`  + ${file.dest}`);
    }
  }

  const cssFile = config.css.file;
  const css = readLocal(io, cssFile);
  const pkgNames = options.source ? ["@junco/react", "@junco/motion"] : deps.map((d) => d.replace(/(.)@.*$/, "$1"));
  let nextCss = css === undefined ? undefined : withSources(css, cssFile, pkgNames);
  if (options.source && css !== undefined) {
    const sourcePath = toPosix(relative(dirname(cssFile), join(config.paths.components, "junco/blocks")));
    if (!(nextCss ?? css).includes(`@source "${sourcePath}";`)) {
      nextCss = `${(nextCss ?? css).trimEnd()}\n@source "${sourcePath}";\n`;
    }
  }
  if (nextCss !== undefined) {
    writeFile(io, cssFile, nextCss);
    io.out(`  ~ ${cssFile} (Tailwind now scans ${pkgNames.join(" and ")}${options.source ? " and the copied source" : ""})`);
  }

  install(io, deps);
  const from = config.aliases ? `${config.aliases.components}/pages/${page.name}` : dest.replace(/\.tsx$/, "");
  const which = page.variants.length > 1 ? ` (${variant} variant)` : "";
  io.out(`Added ${page.title}${options.source ? " with source" : ""}${which}. Use it: import { ${pascal(page.name)} } from "${from}"`);
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

/* create ------------------------------------------------------------------------------- */

export interface CreateOptions {
  template?: string;
  /** Print the templates instead of creating anything. */
  list?: boolean;
}

/** Files that don't count when checking that the target folder is empty. */
const IGNORABLE = new Set([".git", ".DS_Store", "Thumbs.db"]);

/** The package manager that ran us (npx, pnpm dlx, yarn dlx, bunx), else npm. */
export function invokingPackageManager(userAgent = process.env.npm_config_user_agent ?? ""): PackageManager {
  const name = userAgent.split("/")[0];
  return name === "pnpm" || name === "yarn" || name === "bun" ? name : "npm";
}

/** A valid npm package name from a folder name: "My App" -> "my-app". */
export function packageNameFor(dir: string): string {
  const name = basename(resolve(dir))
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "-")
    .replace(/^[._-]+|-+$/g, "");
  return name || "my-app";
}

/** Copies an app template (SaaS, Admin, ...) from the registry into a new folder. */
export async function create(io: Io, dir: string | undefined, options: CreateOptions = {}) {
  const registry = registryFor(io);
  if (options.list) {
    const templates = await registry.templates();
    const width = Math.max(...templates.map((t) => t.name.length));
    for (const t of templates) io.out(`${t.name.padEnd(width)}  ${t.description ?? t.title ?? ""}`);
    return;
  }
  if (!dir) throw new CliError("Name the folder to create: junco create my-app --template saas");

  let name = options.template;
  if (!name) {
    const templates = await registry.templates();
    const names = templates.map((t) => t.name);
    if (!io.interactive) throw new CliError(`Pick a template with --template: ${names.join(", ")}`);
    name = await ask(io, "Which template?", names, names.includes("saas") ? "saas" : names[0]!);
  }

  const target = resolve(io.cwd, dir);
  if (existsSync(target) && readdirSync(target).some((f) => !IGNORABLE.has(f))) {
    throw new CliError(`${dir} already exists and isn't empty. Pick a new folder name.`);
  }

  const template = await registry.template(name);
  // Check every path before writing anything, so a bad template leaves nothing half-written.
  for (const file of template.files) assertInsideProject(`templates/${name}`, file.path);

  const into: Io = { ...io, cwd: target };
  mkdirSync(target, { recursive: true });
  for (const file of template.files) {
    let content = file.content;
    if (file.path === "package.json") {
      const pkg = JSON.parse(content);
      pkg.name = packageNameFor(dir);
      content = JSON.stringify(pkg, null, 2) + "\n";
    }
    writeFile(into, file.path, content);
  }
  io.out(`Created ${dir} from the ${template.title ?? name} template (${template.files.length} files).`);

  const pm = invokingPackageManager();
  const installCmd = [pm, "install"];
  let installed = false;
  if (io.install) {
    io.out(`Installing dependencies with ${pm}`);
    const res = spawnSync(installCmd[0]!, installCmd.slice(1), { cwd: target, stdio: "inherit", shell: process.platform === "win32" });
    installed = res.status === 0;
    if (!installed) io.err(`${installCmd.join(" ")} failed. Run it yourself in ${dir}.`);
  }
  const run = pm === "npm" ? "npm run" : pm;
  io.out("");
  io.out("Next:");
  const folder = relative(io.cwd, target) || ".";
  io.out(`  cd ${/[\s"'$`\\]/.test(folder) ? JSON.stringify(folder) : folder}`);
  if (!installed) io.out(`  ${installCmd.join(" ")}`);
  io.out(`  ${run} dev`);
}

/* list / eject ------------------------------------------------------------------------- */

export async function list(io: Io, options: { installed?: boolean } = {}) {
  const config = readConfig(io.cwd);
  const registry = registryFor(io, config);
  const index = await registry.index();
  const rows = index.items.filter((i) => !THEME_TYPES.has(i.type) && i.name !== CSS_ITEM && (!options.installed || config?.installed[i.name]));
  const width = Math.max(...rows.map((r) => r.name.length), 4);
  for (const item of rows) {
    const record = config?.installed[item.name];
    const status = record ? (record.hash === item.meta?.hash ? " [installed]" : " [update available]") : "";
    io.out(`${item.name.padEnd(width)}  ${item.type.replace("registry:", "").padEnd(5)}  ${item.description ?? ""}${status}`);
  }
  if (options.installed) return;
  // Older registries have no page index; components still list fine.
  const pages = await registry.pages().then((p) => p.pages, () => []);
  if (!pages.length) return;
  io.out("\nPages (junco add page <name> [--variant <v>]):");
  const pw = Math.max(...pages.map((p) => p.name.length));
  for (const p of pages) io.out(`${p.name.padEnd(pw)}  ${p.variants.join(", ")}`);
}

export function eject(io: Io) {
  io.out(
    "junco eject isn't built yet. For now, `junco add <name>` gives you the same source as the installed package; switch the import from \"@junco/react\" to your local copy.",
  );
}
