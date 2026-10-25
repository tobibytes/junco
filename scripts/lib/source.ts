/**
 * Tiny source readers for the registry build: JSDoc, props interfaces and tailwind-variants
 * configs. Regex plus a brace matcher that skips strings and comments; good enough for Junco's
 * own consistently formatted source, not a general TS parser.
 */

export interface PropDoc {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

export interface Doc {
  /** Prose lines of the JSDoc. */
  description: string;
  /** Indented code lines from the JSDoc, dedented. */
  usage?: string;
}

/** Index just past the bracket that closes the one at `open`. Skips strings, templates and comments. */
export function matchBrace(src: string, open: number): number {
  const pairs: Record<string, string> = { "{": "}", "(": ")", "[": "]" };
  const stack: string[] = [];
  for (let i = open; i < src.length; i++) {
    const ch = src[i]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(src, i);
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      if (i === -1) return src.length;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i) + 1;
      continue;
    }
    if (pairs[ch]) stack.push(pairs[ch]!);
    else if (ch === stack[stack.length - 1]) {
      stack.pop();
      if (stack.length === 0) return i + 1;
    }
  }
  throw new Error("Unbalanced brackets");
}

function skipString(src: string, start: number): number {
  const quote = src[start];
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (src[i] === quote) return i;
  }
  return src.length;
}

/** Splits the inside of `{ ... }` (without the braces) into top-level entries on `,` or `;`. */
export function topLevelEntries(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(body, i);
      continue;
    }
    if (ch === "/" && body[i + 1] === "*") {
      i = body.indexOf("*/", i) + 1;
      continue;
    }
    if (ch === "/" && body[i + 1] === "/") {
      i = body.indexOf("\n", i);
      if (i === -1) break;
      continue;
    }
    if ("{([".includes(ch)) depth++;
    else if ("})]".includes(ch)) depth--;
    else if (depth === 0 && (ch === "," || ch === ";")) {
      out.push(body.slice(start, i));
      start = i + 1;
    }
  }
  out.push(body.slice(start));
  return out.map((e) => e.trim()).filter(Boolean);
}

function stripLeadingComments(entry: string): { comment?: string; rest: string } {
  let rest = entry.trim();
  let comment: string | undefined;
  for (;;) {
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/");
      comment = rest.slice(0, end + 2);
      rest = rest.slice(end + 2).trim();
    } else if (rest.startsWith("//")) {
      const end = rest.indexOf("\n");
      rest = end === -1 ? "" : rest.slice(end + 1).trim();
    } else break;
  }
  return { comment, rest };
}

export function parseDoc(raw: string): Doc {
  const lines = raw
    .replace(/^\/\*\*|\*\/$/g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\* ?/, ""));
  const prose: string[] = [];
  const code: string[] = [];
  for (const line of lines) {
    if (/^ {2,}\S/.test(line)) code.push(line);
    else if (line.trim()) prose.push(line.trim());
  }
  const indent = Math.min(...code.map((l) => /^ */.exec(l)![0].length));
  return {
    description: prose.join(" ").replace(/\s+/g, " ").replace(/:$/, ".").trim(),
    usage: code.length ? code.map((l) => l.slice(indent)).join("\n") : undefined,
  };
}

/** JSDoc blocks keyed by the name they document (`export const|function|interface|type Name`). */
export function exportDocs(src: string): Map<string, Doc> {
  const docs = new Map<string, Doc>();
  for (const m of src.matchAll(/(\/\*\*(?:(?!\*\/)[\s\S])*\*\/)\s*\n\s*export\s+(?:const|function|interface|type|class)\s+(\w+)/g)) {
    docs.set(m[2]!, parseDoc(m[1]!));
  }
  return docs;
}

export function exportNames(src: string): string[] {
  const names = new Set<string>();
  for (const m of src.matchAll(/^export\s+(?:const|function|interface|type|class)\s+(\w+)/gm)) names.add(m[1]!);
  for (const m of src.matchAll(/^export\s*\{([^}]+)\}/gm)) {
    for (const part of m[1]!.split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop()?.replace(/^type\s+/, "");
      if (name) names.add(name);
    }
  }
  return [...names];
}

export function firstDoc(src: string): Doc | undefined {
  const m = /\/\*\*(?:(?!\*\/)[\s\S])*\*\//.exec(src);
  return m ? parseDoc(m[0]) : undefined;
}

/** Members of `export interface <name>`, plus its `extends` clause. */
export function interfaceProps(src: string, name: string): { extends?: string; props: PropDoc[] } | undefined {
  const head = new RegExp(`export\\s+interface\\s+${name}\\b([^{]*)\\{`).exec(src);
  if (!head) return undefined;
  const open = head.index + head[0].length - 1;
  const body = src.slice(open + 1, matchBrace(src, open) - 1);
  const ext = head[1]!.replace(/\s+/g, " ").trim().replace(/^extends\s+/, "");
  const props: PropDoc[] = [];
  for (const entry of topLevelEntries(body)) {
    const { comment, rest } = stripLeadingComments(entry);
    const m = /^("?[\w-]+"?)(\?)?\s*:\s*([\s\S]+)$/.exec(rest);
    if (!m) continue;
    props.push({
      name: m[1]!.replace(/"/g, ""),
      optional: Boolean(m[2]),
      type: m[3]!.replace(/\s+/g, " ").trim(),
      description: comment ? parseDoc(comment).description || undefined : undefined,
    });
  }
  return { extends: ext || undefined, props };
}

export interface VariantInfo {
  /** variant name -> option names */
  variants: Record<string, string[]>;
  defaultVariants: Record<string, string>;
}

function objectKeys(objText: string): Array<{ key: string; value: string }> {
  const inner = objText.trim().replace(/^\{/, "").replace(/\}$/, "");
  return topLevelEntries(inner).flatMap((entry) => {
    const { rest } = stripLeadingComments(entry);
    const m = /^("[^"]*"|'[^']*'|[\w$]+)\s*:\s*([\s\S]*)$/.exec(rest);
    return m ? [{ key: m[1]!.replace(/^["']|["']$/g, ""), value: m[2]!.trim() }] : [];
  });
}

/** Variant names and options from every `tv({ ... })` call in a file, merged. */
export function tvVariants(src: string): VariantInfo | undefined {
  const info: VariantInfo = { variants: {}, defaultVariants: {} };
  let found = false;
  for (const m of src.matchAll(/\btv\(\s*\{/g)) {
    const open = m.index! + m[0].length - 1;
    const obj = src.slice(open, matchBrace(src, open));
    for (const { key, value } of objectKeys(obj)) {
      if (key === "variants" && value.startsWith("{")) {
        found = true;
        for (const v of objectKeys(value)) {
          info.variants[v.key] = v.value.startsWith("{") ? objectKeys(v.value).map((o) => o.key) : [];
        }
      }
      if (key === "defaultVariants" && value.startsWith("{")) {
        for (const d of objectKeys(value)) info.defaultVariants[d.key] = d.value.replace(/^["']|["']$/g, "");
      }
    }
  }
  return found ? info : undefined;
}
