import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildRegistry } from "../../../scripts/build-registry.ts";
import { run } from "../src/cli";

/** Builds the real registry once into a temp folder. */
export function buildTestRegistry(): string {
  const outDir = mkdtempSync(join(tmpdir(), "junco-registry-"));
  buildRegistry({ outDir, quiet: true });
  return join(outDir, "r");
}

export function makeProject(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "junco-app-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

export const viteProject = (withAlias = true) =>
  makeProject({
    "package.json": JSON.stringify({ name: "app", dependencies: { react: "^19.0.0" }, devDependencies: { vite: "^7.0.0" } }),
    "tsconfig.json": JSON.stringify({ files: [], references: [{ path: "./tsconfig.app.json" }] }),
    "tsconfig.app.json": withAlias
      ? `{
  // Vite templates use comments and trailing commas
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
  },
  "include": ["src"]
}`
      : `{ "compilerOptions": {}, "include": ["src"] }`,
    "src/index.css": `@import "tailwindcss";\n\nbody { margin: 0; }\n`,
    "src/main.tsx": "export {};\n",
  });

export const read = (dir: string, path: string) => readFileSync(join(dir, path), "utf8");

export async function junco(cwd: string, registry: string, ...args: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await run(args, {
    cwd,
    registry,
    install: false,
    interactive: false,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
  });
  return { code, out: out.join("\n"), err: err.join("\n") };
}
