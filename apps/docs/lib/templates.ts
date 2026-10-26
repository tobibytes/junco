import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "./site";

/**
 * App templates live in the repo's templates/<name>/ folders, each with a template.json.
 * scripts/prebuild.mjs builds each one into public/demos/templates/<name>/ for the live demo.
 * Read at build time (static export).
 */
export interface Template {
  name: string;
  title: string;
  description: string;
  pages: string[];
  source: string;
  /** Path of the live demo when it was built, else undefined. */
  demo?: string;
}

const TEMPLATES_DIR = join(process.cwd(), "..", "..", "templates");
const PUBLIC_DIR = join(process.cwd(), "public");

/** Featured order first; anything else follows alphabetically. */
const ORDER = ["saas", "admin"];

export function getTemplates(): Template[] {
  if (!existsSync(TEMPLATES_DIR)) return [];
  const list: Template[] = [];
  for (const dir of readdirSync(TEMPLATES_DIR)) {
    const file = join(TEMPLATES_DIR, dir, "template.json");
    if (!existsSync(file)) continue;
    const meta = JSON.parse(readFileSync(file, "utf8")) as Omit<Template, "source" | "demo">;
    list.push({
      ...meta,
      source: `${site.github}/tree/main/templates/${dir}`,
      demo: existsSync(join(PUBLIC_DIR, "demos", "templates", meta.name, "index.html")) ? `/demos/templates/${meta.name}/` : undefined,
    });
  }
  const rank = (name: string) => (ORDER.includes(name) ? ORDER.indexOf(name) : ORDER.length);
  return list.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

export function getTemplate(name: string): Template | undefined {
  return getTemplates().find((t) => t.name === name);
}

/** The command that starts a new app from a template. */
export function createCommand(name: string) {
  return `npx @junco/cli create my-app --template ${name}`;
}
