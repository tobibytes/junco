/**
 * Builds the Junco registry: shadcn-compatible JSON for every component, lib file and the theme,
 * plus llms.txt / llms-full.txt.
 *
 *   node scripts/build-registry.ts [--out apps/docs/public] [--base-url https://junco.dev/r]
 *
 * Components are discovered from packages/react/src/{components,theme}, blocks and pages from
 * registry/{blocks,pages}/<name>/. Nothing is listed by hand.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { parseTokens } from "../packages/tokens/src/parse.ts";
import { parseCss, serializeCss, toCssObject, type CssNode, type CssObject } from "./lib/css.ts";
import {
  exportDocs,
  exportNames,
  firstDoc,
  interfaceProps,
  tvVariants,
  type PropDoc,
  type VariantInfo,
} from "./lib/source.ts";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REACT_SRC = join(ROOT, "packages/react/src");
const SITE = "https://junco.dev";
const THEME_ITEM = "junco-theme";
const CSS_ITEM = "junco-css";

export type ItemType = "registry:ui" | "registry:lib" | "registry:block" | "registry:page" | "registry:theme" | "registry:file";

export interface RegistryFile {
  path: string;
  type: ItemType;
  content?: string;
  target?: string;
}

export interface RegistryItem {
  $schema?: string;
  name: string;
  type: ItemType;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
  cssVars?: { theme?: Record<string, string>; light?: Record<string, string>; dark?: Record<string, string> };
  css?: CssObject;
  docs?: string;
  categories?: string[];
  meta: {
    hash: string;
    source?: string;
    exports?: string[];
    props?: Record<string, { extends?: string; props: PropDoc[] }>;
    variants?: VariantInfo;
    usage?: string;
    docsUrl?: string;
  };
}

interface SourceFile {
  abs: string;
  /** registry item name */
  item: string;
  type: ItemType;
  /** where shadcn puts it, as an import alias without extension, e.g. "@/components/ui/button" */
  alias: string;
  /** file path inside the registry item */
  registryPath: string;
  target?: string;
}

const pascal = (name: string) => name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase());
const title = (name: string) => name.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ");

function listFiles(dir: string, exts = [".ts", ".tsx"]): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile() && exts.includes(extname(d.name)) && !d.name.endsWith(".test.tsx") && !d.name.endsWith(".d.ts"))
    .map((d) => join(dir, d.name))
    .sort();
}

/** Maps `export * as XPrimitive from "mod"` / `export { Slot } from "mod"` in lib/primitives.ts. */
function readPrimitives(): Map<string, { module: string; namespace: boolean }> {
  const map = new Map<string, { module: string; namespace: boolean }>();
  const file = join(REACT_SRC, "lib/primitives.ts");
  if (!existsSync(file)) return map;
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/export\s+\*\s+as\s+(\w+)\s+from\s+["']([^"']+)["']/g)) map.set(m[1]!, { module: m[2]!, namespace: true });
  for (const m of src.matchAll(/export\s*\{([^}]+)\}\s*from\s+["']([^"']+)["']/g)) {
    for (const name of m[1]!.split(",").map((s) => s.trim()).filter(Boolean)) map.set(name, { module: m[2]!, namespace: false });
  }
  return map;
}

function discoverSources(): SourceFile[] {
  const files: SourceFile[] = [];
  for (const abs of listFiles(join(REACT_SRC, "components"))) {
    const name = basename(abs, extname(abs));
    files.push({ abs, item: name, type: "registry:ui", alias: `@/components/ui/${name}`, registryPath: `registry/junco/ui/${basename(abs)}` });
  }
  for (const abs of listFiles(join(REACT_SRC, "theme"))) {
    const name = basename(abs, extname(abs));
    files.push({ abs, item: name, type: "registry:ui", alias: `@/components/ui/${name}`, registryPath: `registry/junco/ui/${basename(abs)}` });
  }
  for (const abs of listFiles(join(REACT_SRC, "lib"))) {
    const name = basename(abs, extname(abs));
    if (name === "primitives") continue; // inlined into each component as direct imports
    if (name === "cn") {
      files.push({ abs, item: "utils", type: "registry:lib", alias: "@/lib/utils", registryPath: "registry/junco/lib/utils.ts", target: undefined });
      continue;
    }
    files.push({
      abs,
      item: name,
      type: "registry:lib",
      alias: `@/lib/junco/${name}`,
      registryPath: `registry/junco/lib/junco/${basename(abs)}`,
    });
  }
  return files;
}

const IMPORT_RE = /^(import\s+(?:type\s+)?)([^;]*?)(\s+from\s+)["']([^"']+)["'];?[ \t]*$/gm;
const EXPORT_FROM_RE = /^(export\s+(?:type\s+)?)([^;=]*?)(\s+from\s+)["']([^"']+)["'];?[ \t]*$/gm;

function packageName(spec: string): string {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
}

interface Transformed {
  content: string;
  npm: Set<string>;
  registry: Set<string>;
}

function transform(file: SourceFile, byAbs: Map<string, SourceFile>, primitives: ReturnType<typeof readPrimitives>): Transformed {
  const npm = new Set<string>();
  const registry = new Set<string>();
  const src = readFileSync(file.abs, "utf8");

  const rewrite = (whole: string, head: string, what: string, from: string, spec: string) => {
    if (!spec.startsWith(".")) {
      const pkg = packageName(spec);
      if (pkg !== "react" && pkg !== "react-dom") npm.add(pkg);
      return whole;
    }
    const target = resolveRelative(file.abs, spec);
    if (target && basename(target, extname(target)) === "primitives" && dirname(target) === join(REACT_SRC, "lib")) {
      // `import { XPrimitive, Slot } from "../lib/primitives"` -> direct imports
      const names = what.replace(/[{}]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
      return names
        .map((name) => {
          const p = primitives.get(name);
          if (!p) throw new Error(`${file.abs}: ${name} is not exported from lib/primitives.ts`);
          npm.add(packageName(p.module));
          return p.namespace ? `import * as ${name} from "${p.module}";` : `import { ${name} } from "${p.module}";`;
        })
        .join("\n");
    }
    const dep = target ? byAbs.get(target) : undefined;
    if (!dep) throw new Error(`${file.abs}: cannot resolve "${spec}" to a registry file`);
    if (dep.item !== file.item) registry.add(dep.item);
    return `${head}${what}${from}"${dep.alias}";`;
  };

  const content = src.replace(IMPORT_RE, rewrite).replace(EXPORT_FROM_RE, rewrite);
  return { content, npm, registry };
}

function resolveRelative(from: string, spec: string): string | undefined {
  const base = resolve(dirname(from), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(candidate) && extname(candidate)) return candidate;
  }
  return undefined;
}

function hashItem(item: Pick<RegistryItem, "files" | "cssVars" | "css" | "dependencies" | "registryDependencies">): string {
  const h = createHash("sha256");
  h.update(JSON.stringify([item.files?.map((f) => [f.path, f.content]), item.cssVars, item.css, item.dependencies, item.registryDependencies]));
  return h.digest("hex").slice(0, 16);
}

function npmVersions(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "packages/react/package.json"), "utf8"));
  return { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies };
}

function sourceMeta(src: string, item: string) {
  const docs = exportDocs(src);
  const main = pascal(item);
  const exports = exportNames(src);
  const props: NonNullable<RegistryItem["meta"]["props"]> = {};
  for (const name of exports.filter((e) => e.endsWith("Props"))) {
    const p = interfaceProps(src, name);
    if (p) props[name.replace(/Props$/, "")] = p;
  }
  const mainDoc = docs.get(main) ?? [...docs.entries()].find(([k]) => k.toLowerCase() === main.toLowerCase())?.[1];
  const usage = [...docs.values()].map((d) => d.usage).find(Boolean);
  return { exports, props, variants: tvVariants(src), description: mainDoc?.description, usage };
}

/* Theme ------------------------------------------------------------------- */

function readThemeSources() {
  const tokensCss = readFileSync(join(ROOT, "packages/tokens/src/tokens.css"), "utf8");
  const twIndex = readFileSync(join(ROOT, "packages/tailwind/src/index.css"), "utf8");
  const twComponentsPath = join(ROOT, "packages/tailwind/src/components.css");
  const twComponents = existsSync(twComponentsPath) ? readFileSync(twComponentsPath, "utf8") : "";
  return { tokensCss, twIndex, twComponents };
}

function buildThemeItem(): RegistryItem {
  const { tokensCss, twIndex, twComponents } = readThemeSources();
  const tokens = parseTokens(tokensCss);

  const css: CssObject = {};
  const theme: Record<string, string> = {};
  const addNodes = (nodes: CssNode[]) => {
    for (const node of nodes) {
      if (node.kind !== "block") continue;
      if (node.prelude.startsWith("@theme")) {
        for (const child of node.children) {
          if (child.kind === "decl" && child.prop.startsWith("--")) theme[child.prop.slice(2)] = child.value;
          else if (child.kind === "block") css[child.prelude] = toCssObject(child.children);
        }
      } else if (node.prelude === ":root" || node.prelude === ".dark, [data-theme=\"dark\"]") {
        // carried by cssVars
      } else {
        const existing = css[node.prelude];
        const obj = toCssObject(node.children);
        css[node.prelude] = typeof existing === "object" ? { ...existing, ...obj } : obj;
      }
    }
  };
  addNodes(parseCss(tokensCss));
  addNodes(parseCss(twIndex));
  addNodes(parseCss(twComponents));

  const item: RegistryItem = {
    name: THEME_ITEM,
    type: "registry:theme",
    title: "Junco theme",
    description: "Junco tokens (light and dark), the Tailwind v4 theme mapping, motion utilities and semantic classes.",
    cssVars: { theme, light: tokens.light, dark: tokens.dark },
    css,
    meta: { hash: "" },
  };
  item.meta.hash = hashItem(item);
  return item;
}

/** Everything in one plain CSS file, for apps that don't install @junco/tailwind. */
export function bundledCss(): string {
  const { tokensCss, twIndex, twComponents } = readThemeSources();
  const nodes = parseCss(twIndex).flatMap((node): CssNode[] => {
    if (node.kind === "statement" && node.text.includes("@junco/tokens")) return parseCss(tokensCss);
    if (node.kind === "statement" && node.text.includes("./components.css")) return parseCss(twComponents);
    return [node];
  });
  return `/* Junco theme, generated from @junco/tokens and @junco/tailwind. Import after "tailwindcss". */\n${serializeCss(nodes)}\n`;
}

function buildCssItem(): RegistryItem {
  const item: RegistryItem = {
    name: CSS_ITEM,
    type: "registry:file",
    title: "Junco CSS",
    description: "The whole Junco theme as one CSS file (tokens, Tailwind mapping, semantic classes). Used by `junco init --css inline`.",
    files: [{ path: "registry/junco/styles/junco.css", type: "registry:file", target: "styles/junco.css", content: bundledCss() }],
    meta: { hash: "" },
  };
  item.meta.hash = hashItem(item);
  return item;
}

/* Blocks and pages ----------------------------------------------------------- */

function discoverCollections(byAbs: Map<string, SourceFile>): SourceFile[][] {
  const groups: SourceFile[][] = [];
  for (const [folder, type] of [
    ["blocks", "registry:block"],
    ["pages", "registry:page"],
  ] as const) {
    const dir = join(ROOT, "registry", folder);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const files = listFiles(join(dir, entry.name)).map((abs) => ({
        abs,
        item: entry.name,
        type,
        alias: `@/components/${folder}/${entry.name}/${basename(abs, extname(abs))}`,
        registryPath: `registry/junco/${folder}/${entry.name}/${basename(abs)}`,
        target: `components/${folder}/${entry.name}/${basename(abs)}`,
      }));
      for (const f of files) byAbs.set(f.abs, f);
      if (files.length) groups.push(files);
    }
  }
  return groups;
}

/* Build ---------------------------------------------------------------------------- */

export interface BuildOptions {
  /** Directory that receives r/ and llms*.txt. */
  outDir?: string;
  /** Public URL of the r/ folder, used for registryDependencies. */
  baseUrl?: string;
  quiet?: boolean;
}

export interface BuildResult {
  items: RegistryItem[];
  outDir: string;
}

export function buildRegistry({ outDir = join(ROOT, "apps/docs/public"), baseUrl = `${SITE}/r`, quiet = false }: BuildOptions = {}): BuildResult {
  const sources = discoverSources();
  const byAbs = new Map(sources.map((s) => [s.abs, s]));
  const collections = discoverCollections(byAbs);
  const primitives = readPrimitives();
  const versions = npmVersions();
  const url = (name: string) => `${baseUrl.replace(/\/$/, "")}/${name}.json`;

  const groups: SourceFile[][] = [...sources.map((s) => [s]), ...collections];
  const items: RegistryItem[] = [buildThemeItem(), buildCssItem()];

  for (const group of groups) {
    const first = group[0]!;
    const npm = new Set<string>();
    const deps = new Set<string>();
    const files: RegistryFile[] = [];
    let description: string | undefined;
    let meta: ReturnType<typeof sourceMeta> | undefined;
    for (const file of group) {
      const t = transform(file, byAbs, primitives);
      t.npm.forEach((d) => npm.add(d));
      t.registry.forEach((d) => deps.add(d));
      files.push({ path: file.registryPath, type: file.type, content: t.content, ...(file.target ? { target: file.target } : {}) });
      const src = readFileSync(file.abs, "utf8");
      if (!meta) {
        meta = sourceMeta(src, first.item);
        description = meta.description ?? (first.type === "registry:lib" ? firstDoc(src)?.description : undefined);
      }
    }
    // UI depends on the theme so `shadcn add` brings the tokens along.
    if (first.type !== "registry:lib") deps.add(THEME_ITEM);
    const isComponent = first.type === "registry:ui";
    const item: RegistryItem = {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: first.item,
      type: first.type,
      title: title(first.item),
      description: description || title(first.item),
      dependencies: [...npm].sort().map((p) => (versions[p] ? `${p}@${versions[p]}` : p)),
      registryDependencies: [...deps].sort().map(url),
      files,
      // shadcn prints this after installing the item
      docs: isComponent ? `Docs and examples: ${SITE}/docs/components/${first.item}` : undefined,
      meta: {
        hash: "",
        source: relative(ROOT, first.abs),
        exports: meta?.exports,
        props: meta && Object.keys(meta.props).length ? meta.props : undefined,
        variants: meta?.variants,
        usage: meta?.usage,
        docsUrl: isComponent ? `${SITE}/docs/components/${first.item}` : undefined,
      },
    };
    if (!item.dependencies!.length) delete item.dependencies;
    if (!item.registryDependencies!.length) delete item.registryDependencies;
    item.meta.hash = hashItem(item);
    items.push(item);
  }

  const names = new Set<string>();
  for (const item of items) {
    if (names.has(item.name)) throw new Error(`Duplicate registry item name: ${item.name}`);
    names.add(item.name);
  }

  const rDir = join(outDir, "r");
  rmSync(rDir, { recursive: true, force: true });
  mkdirSync(rDir, { recursive: true });
  for (const item of items) {
    writeFileSync(join(rDir, `${item.name}.json`), JSON.stringify({ $schema: "https://ui.shadcn.com/schema/registry-item.json", ...item }, null, 2) + "\n");
  }
  const index = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "junco",
    homepage: SITE,
    // the index lists items; their full CSS and file contents live in <name>.json
    items: items.map(({ $schema: _s, files, css: _css, cssVars: _vars, ...rest }) => ({
      ...rest,
      ...(files ? { files: files.map(({ content: _c, ...f }) => f) } : {}),
    })),
  };
  writeFileSync(join(rDir, "registry.json"), JSON.stringify(index, null, 2) + "\n");
  const schemaSrc = join(ROOT, "registry/schema/junco.json");
  if (existsSync(schemaSrc)) {
    mkdirSync(join(outDir, "schema"), { recursive: true });
    writeFileSync(join(outDir, "schema/junco.json"), readFileSync(schemaSrc));
  }
  writeFileSync(join(outDir, "llms.txt"), llmsTxt(items));
  writeFileSync(join(outDir, "llms-full.txt"), llmsFullTxt(items));

  if (!quiet) {
    const counts = items.reduce<Record<string, number>>((acc, i) => ((acc[i.type] = (acc[i.type] ?? 0) + 1), acc), {});
    console.log(`registry: ${items.length} items (${Object.entries(counts).map(([t, n]) => `${n} ${t.replace("registry:", "")}`).join(", ")}) -> ${relative(process.cwd(), rDir) || rDir}`);
  }
  return { items, outDir };
}

/* llms.txt ---------------------------------------------------------------------- */

const OVERVIEW = `Junco is a free, open source (MIT) design system for React and Tailwind CSS v4: tokens, components, blocks, pages, motion and 3D. It can be used four ways, all reading the same tokens:

1. Semantic classes (like daisyUI): class="btn btn-primary". Pure CSS. Setup: @import "tailwindcss"; @import "@junco/tailwind";
2. Utilities (like Tailwind): bg-surface text-muted-foreground rounded-card. Same setup.
3. Copy-in components (like shadcn/ui): npx @junco/cli add button (or npx shadcn@latest add ${SITE}/r/button.json).
4. Installed components (like HeroUI): npm i junco, then import { Button } from "junco". Add @source "../node_modules/junco/dist"; to your CSS.

Tokens follow shadcn/ui names (--background, --foreground, --primary, --muted-foreground, --border, --ring, ...) plus Junco additions (--surface, --success, --warning, --success-text, --warning-text, --destructive-text, motion tokens). Dark mode: .dark or [data-theme="dark"] on <html>. Motion: data-motion="full|subtle|off", and prefers-reduced-motion always turns motion off.`;

function llmsTxt(items: RegistryItem[]): string {
  const ui = items.filter((i) => i.type === "registry:ui");
  const blocks = items.filter((i) => i.type === "registry:block" || i.type === "registry:page");
  const lines = [
    "# Junco",
    "",
    `> ${OVERVIEW.split("\n")[0]}`,
    "",
    OVERVIEW.split("\n").slice(2).join("\n"),
    "",
    "## Components",
    "",
    ...ui.map((i) => `- [${i.title}](${i.meta.docsUrl ?? `${SITE}/r/${i.name}.json`}): ${i.description}`),
  ];
  if (blocks.length) lines.push("", "## Blocks and pages", "", ...blocks.map((i) => `- [${i.title}](${SITE}/r/${i.name}.json): ${i.description}`));
  lines.push(
    "",
    "## Optional",
    "",
    `- [Full component reference](${SITE}/llms-full.txt): props, variants and usage for every component`,
    `- [Registry index](${SITE}/r/registry.json): shadcn-compatible registry`,
    "",
  );
  return lines.join("\n");
}

function llmsFullTxt(items: RegistryItem[]): string {
  const out = ["# Junco: full reference", "", OVERVIEW, ""];
  for (const item of items.filter((i) => i.type === "registry:ui" || i.type === "registry:block" || i.type === "registry:page")) {
    out.push(`## ${item.title}`, "", item.description, "");
    out.push("Install:", "", "```bash", `npx @junco/cli add ${item.name}`, `npx shadcn@latest add ${SITE}/r/${item.name}.json`, "```", "");
    if (item.meta.exports?.length) out.push(`Exports: ${item.meta.exports.join(", ")}`, "");
    if (item.meta.variants) {
      out.push("Variants:", "");
      for (const [name, options] of Object.entries(item.meta.variants.variants)) {
        const def = item.meta.variants.defaultVariants[name];
        out.push(`- ${name}: ${options.join(" | ")}${def ? ` (default ${def})` : ""}`);
      }
      out.push("");
    }
    for (const [component, info] of Object.entries(item.meta.props ?? {})) {
      out.push(`Props of ${component}${info.extends ? ` (also accepts ${info.extends})` : ""}:`, "");
      for (const p of info.props) out.push(`- ${p.name}${p.optional ? "?" : ""}: ${p.type}${p.description ? `. ${p.description}` : ""}`);
      out.push("");
    }
    if (item.meta.usage) out.push("Usage:", "", "```tsx", item.meta.usage, "```", "");
  }
  return out.join("\n");
}

/* CLI entry ------------------------------------------------------------------------------ */

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: { out: { type: "string" }, "base-url": { type: "string" }, quiet: { type: "boolean" } },
  });
  buildRegistry({
    outDir: values.out ? resolve(values.out) : undefined,
    baseUrl: values["base-url"] ?? process.env.JUNCO_REGISTRY_URL,
    quiet: values.quiet,
  });
}
