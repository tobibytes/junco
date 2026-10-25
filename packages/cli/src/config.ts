import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { readJsonIfExists, readPackageJson, toPosix } from "./fs-utils";
import { DEFAULT_REGISTRY } from "./registry";

export const CONFIG_FILE = "junco.json";

export type Framework = "next" | "vite" | "react";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type CssMode = "package" | "inline";

export interface InstalledItem {
  /** Registry item hash when it was installed or last updated. */
  hash: string;
  /** Project-relative path -> hash of the content Junco wrote there. */
  files: Record<string, string>;
}

export interface JuncoConfig {
  $schema?: string;
  registry: string;
  framework: Framework;
  css: { file: string; mode: CssMode };
  /** Import aliases (like "@/components/ui"). null: write relative imports instead. */
  aliases: { components: string; ui: string; lib: string; utils: string } | null;
  /** Project-relative folders the aliases point at. */
  paths: { components: string; ui: string; lib: string };
  installed: Record<string, InstalledItem>;
}

export function readConfig(cwd: string): JuncoConfig | undefined {
  const file = join(cwd, CONFIG_FILE);
  if (!existsSync(file)) return undefined;
  const config = JSON.parse(readFileSync(file, "utf8")) as JuncoConfig;
  config.installed ??= {};
  return config;
}

export function writeConfig(cwd: string, config: JuncoConfig) {
  writeFileSync(join(cwd, CONFIG_FILE), JSON.stringify(config, null, 2) + "\n");
}

export function detectFramework(cwd: string): Framework {
  const pkg = readPackageJson(cwd);
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  if (deps.next) return "next";
  if (deps.vite) return "vite";
  return "react";
}

export function detectPackageManager(cwd: string): PackageManager {
  let dir = cwd;
  for (;;) {
    if (existsSync(join(dir, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(join(dir, "bun.lockb")) || existsSync(join(dir, "bun.lock"))) return "bun";
    if (existsSync(join(dir, "yarn.lock"))) return "yarn";
    if (existsSync(join(dir, "package-lock.json"))) return "npm";
    const parent = dirname(dir);
    if (parent === dir) return "npm";
    dir = parent;
  }
}

const CSS_CANDIDATES: Record<Framework, string[]> = {
  next: ["app/globals.css", "src/app/globals.css", "styles/globals.css", "src/styles/globals.css"],
  vite: ["src/index.css", "src/main.css", "src/styles.css", "src/App.css", "src/styles/globals.css"],
  react: ["src/index.css", "src/styles.css", "src/main.css", "src/App.css", "src/styles/globals.css", "app/globals.css"],
};

export const TAILWIND_IMPORT = /@import\s+["']tailwindcss["'][^;\n]*;?/;

/** The app's global stylesheet: the first candidate that imports Tailwind, else the first that exists. */
export function detectCssFile(cwd: string, framework: Framework): { file?: string; hasTailwind: boolean } {
  const candidates = [...new Set([...CSS_CANDIDATES[framework], ...CSS_CANDIDATES.react, ...CSS_CANDIDATES.next])];
  const existing = candidates.filter((c) => existsSync(join(cwd, c)));
  const withTailwind = existing.find((c) => TAILWIND_IMPORT.test(readFileSync(join(cwd, c), "utf8")));
  return { file: withTailwind ?? existing[0], hasTailwind: Boolean(withTailwind) };
}

interface TsConfig {
  compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
  references?: Array<{ path: string }>;
}

/** Folder that `@/*` points at, from tsconfig.json or the tsconfig files it references (Vite templates). */
export function detectAliasRoot(cwd: string): string | undefined {
  const queue = ["tsconfig.json", "jsconfig.json"];
  const seen = new Set<string>();
  while (queue.length) {
    const name = queue.shift()!;
    if (seen.has(name)) continue;
    seen.add(name);
    const config = readJsonIfExists<TsConfig>(join(cwd, name));
    if (!config) continue;
    const target = config.compilerOptions?.paths?.["@/*"]?.[0];
    if (target) {
      const base = config.compilerOptions?.baseUrl ?? ".";
      return toPosix(normalize(join(dirname(name), base, target.replace(/\/?\*$/, "")))).replace(/\/$/, "") || ".";
    }
    for (const ref of config.references ?? []) {
      const p = ref.path.endsWith(".json") ? ref.path : join(ref.path, "tsconfig.json");
      queue.push(toPosix(normalize(join(dirname(name), p))));
    }
  }
  return undefined;
}

export function defaultConfig(cwd: string, options: { registry?: string; cssFile: string; cssMode: CssMode }): JuncoConfig {
  const aliasRoot = detectAliasRoot(cwd);
  const srcRoot = aliasRoot ?? (existsSync(join(cwd, "src")) ? "src" : ".");
  const at = (p: string) => toPosix(normalize(join(srcRoot, p)));
  return {
    $schema: "https://junco.madebytobi.com/schema/junco.json",
    registry: options.registry ?? DEFAULT_REGISTRY,
    framework: detectFramework(cwd),
    css: { file: options.cssFile, mode: options.cssMode },
    aliases:
      aliasRoot !== undefined ? { components: "@/components", ui: "@/components/ui", lib: "@/lib", utils: "@/lib/utils" } : null,
    paths: { components: at("components"), ui: at("components/ui"), lib: at("lib") },
    installed: {},
  };
}
