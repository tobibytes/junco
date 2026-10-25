import { basename, dirname, extname, join, relative } from "node:path";
import type { JuncoConfig } from "./config";
import { toPosix } from "./fs-utils";
import type { RegistryFile } from "./registry";

/** Where a registry file lands in the project (project-relative, posix). */
export function destination(file: RegistryFile, config: JuncoConfig): string {
  switch (file.type) {
    case "registry:ui":
      return toPosix(join(config.paths.ui, basename(file.path)));
    case "registry:lib": {
      const nested = /(?:^|\/)lib\/(.+)$/.exec(file.path)?.[1];
      return toPosix(join(config.paths.lib, nested ?? basename(file.path)));
    }
    case "registry:block":
    case "registry:page":
    case "registry:component": {
      const rel = file.target?.replace(/^components\//, "") ?? basename(file.path);
      return toPosix(join(config.paths.components, rel));
    }
    default:
      // registry:file and friends: target is relative to the folder that holds components/
      return toPosix(join(dirname(config.paths.components), file.target ?? basename(file.path)));
  }
}

type PathKey = keyof JuncoConfig["paths"];
type AliasKey = keyof NonNullable<JuncoConfig["aliases"]>;

const RULES: Array<{ re: RegExp; path: PathKey; alias: AliasKey; fixed?: string }> = [
  { re: /^@\/components\/ui\/(.+)$/, path: "ui", alias: "ui" },
  { re: /^@\/lib\/utils$/, path: "lib", alias: "utils", fixed: "utils" },
  { re: /^@\/lib\/(.+)$/, path: "lib", alias: "lib" },
  { re: /^@\/components\/(.+)$/, path: "components", alias: "components" },
];

/** Rewrites registry aliases to the project's aliases, or to relative imports when it has none. */
export function rewriteImports(content: string, dest: string, config: JuncoConfig): string {
  if (![".ts", ".tsx", ".js", ".jsx", ".mts"].includes(extname(dest))) return content;
  return content.replace(/(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(["'])(@\/[^"']+)\2/g, (whole, head: string, q: string, spec: string) => {
    for (const rule of RULES) {
      const m = rule.re.exec(spec);
      if (!m) continue;
      if (config.aliases) {
        const alias = config.aliases[rule.alias];
        return `${head}${q}${rule.fixed ? alias : `${alias}/${m[1]}`}${q}`;
      }
      const target = toPosix(join(config.paths[rule.path], rule.fixed ?? m[1]!));
      let rel = toPosix(relative(dirname(dest), target));
      if (!rel.startsWith(".")) rel = `./${rel}`;
      return `${head}${q}${rel}${q}`;
    }
    return whole;
  });
}
