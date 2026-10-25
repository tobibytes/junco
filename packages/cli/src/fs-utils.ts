import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const sha = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 16);

/** JSON with comments and trailing commas (tsconfig files). */
export function parseJsonc<T = unknown>(text: string): T {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === '"') {
      const start = i;
      for (i++; i < text.length && text[i] !== '"'; i++) if (text[i] === "\\") i++;
      out += text.slice(start, i + 1);
    } else if (ch === "/" && text[i + 1] === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      out += "\n";
    } else if (ch === "/" && text[i + 1] === "*") {
      i = text.indexOf("*/", i + 2) + 1;
    } else out += ch;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1")) as T;
}

export function readJsonIfExists<T>(file: string): T | undefined {
  if (!existsSync(file)) return undefined;
  return parseJsonc<T>(readFileSync(file, "utf8"));
}

export interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function readPackageJson(cwd: string): PackageJson | undefined {
  return readJsonIfExists<PackageJson>(join(cwd, "package.json"));
}

export const toPosix = (p: string) => p.split("\\").join("/");
