import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tokens } from "@junco/tokens";
import { NotFoundError, SITE, type Registry, type RegistryItem } from "./registry";

/** Item types an agent browses as "components" vs "blocks". Theme/css/lib items are plumbing. */
const COMPONENT_TYPES = new Set(["registry:ui"]);
const BLOCK_TYPES = new Set(["registry:block", "registry:page"]);

export interface ItemSummary {
  name: string;
  title: string;
  type: string;
  description: string;
}

const summary = (i: RegistryItem): ItemSummary => ({
  name: i.name,
  title: i.title ?? i.name,
  type: i.type.replace("registry:", ""),
  description: i.description ?? "",
});

export async function listComponents(registry: Registry): Promise<ItemSummary[]> {
  return (await registry.index()).items.filter((i) => COMPONENT_TYPES.has(i.type)).map(summary);
}

export async function listBlocks(registry: Registry, kind: "block" | "page" | "all" = "all"): Promise<ItemSummary[]> {
  return (await registry.index()).items
    .filter((i) => BLOCK_TYPES.has(i.type) && (kind === "all" || i.type === `registry:${kind}`))
    .map(summary);
}

/** Lower is better: 0 means no match. */
function score(item: RegistryItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const name = item.name.toLowerCase();
  const title = (item.title ?? "").toLowerCase();
  const text = `${item.description ?? ""} ${(item.meta?.exports ?? []).join(" ")}`.toLowerCase();
  let s = 0;
  if (name === q || title === q) s += 100;
  else if (name.startsWith(q)) s += 60;
  else if (name.includes(q) || title.includes(q)) s += 40;
  for (const word of q.split(/\s+/).filter((w) => w.length > 1)) {
    if (name.includes(word)) s += 15;
    if (text.includes(word)) s += 8;
  }
  // subsequence match for typos like "chkbox"
  let k = 0;
  for (const ch of name) if (ch === q[k]) k++;
  if (k === q.length && q.length >= 3) s += 12;
  return s;
}

export async function search(registry: Registry, query: string, limit = 10): Promise<Array<ItemSummary & { score: number }>> {
  const { items } = await registry.index();
  return items
    .filter((i) => COMPONENT_TYPES.has(i.type) || BLOCK_TYPES.has(i.type))
    .map((i) => ({ ...summary(i), score: score(i, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

const SEMANTIC_ALIASES: Record<string, string> = { button: "btn" };

/** Semantic (pure CSS) classes that belong to an item, read from the theme's components layer. */
async function semanticClasses(registry: Registry, name: string): Promise<string[]> {
  let theme: RegistryItem;
  try {
    theme = await registry.item("junco-theme");
  } catch {
    return [];
  }
  const layer = (theme.css?.["@layer components"] ?? {}) as Record<string, unknown>;
  const base = SEMANTIC_ALIASES[name] ?? name.replace(/-group$/, "");
  const classes = new Set<string>();
  for (const selector of Object.keys(layer)) {
    for (const m of selector.matchAll(/\.([a-z][\w-]*)/g)) {
      if (m[1] === base || m[1]!.startsWith(`${base}-`)) classes.add(m[1]!);
    }
  }
  return [...classes].sort((a, b) => (a === base ? -1 : b === base ? 1 : a.localeCompare(b)));
}

export async function getComponent(registry: Registry, name: string, options: { includeSource?: boolean } = {}): Promise<string> {
  let item: RegistryItem;
  try {
    item = await registry.item(name);
  } catch (err) {
    if (err instanceof NotFoundError) {
      const near = (await search(registry, name, 3)).map((r) => r.name);
      throw new Error(`No component called "${name}".${near.length ? ` Did you mean: ${near.join(", ")}?` : ""}`);
    }
    throw err;
  }
  const meta = item.meta ?? {};
  const exports = (meta.exports ?? []).filter((e) => /^[A-Z]/.test(e) && !e.endsWith("Props"));
  const classes = await semanticClasses(registry, item.name);
  const out: string[] = [`# ${item.title ?? item.name}`, "", item.description ?? "", ""];

  out.push("## Use it", "");
  if (classes.length) {
    out.push(
      "1. Semantic classes (pure CSS, any framework):",
      "",
      "```html",
      `<!-- needs: @import "tailwindcss"; @import "@junco/tailwind"; -->`,
      `classes: ${classes.map((c) => `.${c}`).join(" ")}`,
      "```",
      "",
    );
  } else {
    out.push("1. Semantic classes: none for this component (it needs JavaScript behavior).", "");
  }
  out.push(
    "2. Utilities: style anything with token classes like bg-surface, text-muted-foreground, border-border, rounded-card.",
    "",
    "3. Copy the source into your project (you own it, `junco update` keeps it current):",
    "",
    "```bash",
    `npx @junco/cli add ${item.name}`,
    `# or with shadcn: npx shadcn@latest add ${SITE}/r/${item.name}.json`,
    "```",
    "",
  );
  if (item.type === "registry:ui" && exports.length) {
    out.push("4. Installed package:", "", "```tsx", `import { ${exports.join(", ")} } from "@junco/react";`, "```", "");
  }

  if (meta.variants && Object.keys(meta.variants.variants).length) {
    out.push("## Variants", "");
    for (const [v, opts] of Object.entries(meta.variants.variants)) {
      const def = meta.variants.defaultVariants[v];
      out.push(`- ${v}: ${opts.join(" | ")}${def ? ` (default: ${def})` : ""}`);
    }
    out.push("");
  }
  for (const [component, info] of Object.entries(meta.props ?? {})) {
    out.push(`## ${component} props`, "");
    if (info.extends) out.push(`Also accepts: ${info.extends}`, "");
    for (const p of info.props) out.push(`- \`${p.name}${p.optional ? "?" : ""}: ${p.type}\`${p.description ? ` ${p.description}` : ""}`);
    out.push("");
  }
  if (meta.usage) out.push("## Example", "", "```tsx", meta.usage, "```", "");
  if (item.dependencies?.length) out.push(`npm dependencies: ${item.dependencies.join(", ")}`, "");
  if (item.registryDependencies?.length) {
    out.push(`Registry dependencies: ${item.registryDependencies.map((d) => d.split("/").pop()!.replace(/\.json$/, "")).join(", ")}`, "");
  }
  if (meta.docsUrl) out.push(`Docs: ${meta.docsUrl}`, "");
  if (options.includeSource !== false) {
    for (const file of item.files ?? []) {
      if (!file.content) continue;
      out.push(`## Source: ${file.path.split("/").pop()}`, "", "```tsx", file.content.trimEnd(), "```", "");
    }
  }
  return out.join("\n");
}

export type TokenFormat = "summary" | "css" | "json";

export async function getTokens(format: TokenFormat = "summary", filter?: string): Promise<string> {
  const require = createRequire(import.meta.url);
  if (format === "css") return readFile(require.resolve("@junco/tokens/tokens.css"), "utf8");
  if (format === "json") return readFile(require.resolve("@junco/tokens/tokens.json"), "utf8");
  // match on name boundaries: "ring" finds --ring but not --ease-spring
  const f = filter?.replace(/^--/, "").toLowerCase();
  const match = (name: string) => !f || name.startsWith(f) || name.includes(`-${f}`);
  const lines = ["Junco tokens. Light values on :root; dark values on .dark / [data-theme=\"dark\"]. Use them as var(--name) or via Tailwind classes (bg-<name>, text-<name>, border-<name>).", ""];
  for (const [name, value] of Object.entries(tokens.light)) {
    if (!match(name)) continue;
    const dark = tokens.dark[name];
    lines.push(`--${name}: ${value}${dark && dark !== value ? `  (dark: ${dark})` : ""}`);
  }
  if (lines.length === 2) lines.push(`No tokens match "${filter}".`);
  return lines.join("\n");
}

export type Framework = "next" | "vite" | "remix" | "astro" | "html";

export function getInstallInstructions(framework: Framework = "vite"): string {
  const cssFile = { next: "app/globals.css", vite: "src/index.css", remix: "app/tailwind.css", astro: "src/styles/global.css", html: "input.css" }[framework];
  const tailwind = {
    next: "npm i tailwindcss @tailwindcss/postcss  (Next.js App Router; see https://tailwindcss.com/docs/installation/framework-guides/nextjs)",
    vite: "npm i tailwindcss @tailwindcss/vite, then add tailwindcss() to the plugins in vite.config.ts",
    remix: "npm i tailwindcss @tailwindcss/vite, then add tailwindcss() to the plugins in vite.config.ts",
    astro: "npm i tailwindcss @tailwindcss/vite, then add tailwindcss() to vite.plugins in astro.config.mjs",
    html: "npm i tailwindcss @tailwindcss/cli",
  }[framework];
  const out = [
    `# Junco with ${framework}`,
    "",
    "Junco needs Tailwind CSS v4.",
    "",
    `1. Tailwind: ${tailwind}`,
    `2. Theme: npm i @junco/tailwind, then in ${cssFile}:`,
    "",
    "```css",
    '@import "tailwindcss";',
    '@import "@junco/tailwind";',
    "```",
    "",
    "That alone gives you semantic classes (btn, card, badge, input, ...) and token utilities (bg-surface, text-muted-foreground, rounded-card, ...).",
    "",
  ];
  if (framework === "html") {
    out.push("3. Build: npx @tailwindcss/cli -i input.css -o junco.css, and link junco.css. Toggle dark mode with class=\"dark\" on <html>.");
    return out.join("\n");
  }
  out.push(
    "3. Components, pick one or mix:",
    "",
    "   a. Copy-in (you own the source): npx @junco/cli init, then npx @junco/cli add button dialog",
    `   b. Installed package: npm i @junco/react, add @source "../node_modules/@junco/react/dist"; to ${cssFile} (path relative to the CSS file), then import { Button } from "@junco/react".`,
    "",
    "4. Dark mode and motion: wrap the app in <ThemeProvider> from @junco/react (or the copied theme-provider). It sets .dark, data-theme and data-motion on <html>.",
  );
  if (framework === "next") {
    out.push(
      "   In app/layout.tsx put <script dangerouslySetInnerHTML={{ __html: themeScript() }} /> in <head> and add suppressHydrationWarning to <html> so there is no flash of the wrong theme.",
    );
  }
  return out.join("\n");
}
