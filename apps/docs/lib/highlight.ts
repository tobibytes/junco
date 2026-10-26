/**
 * A tiny syntax highlighter for the snippets on this site (TSX, HTML, CSS, shell).
 * Runs the same on the server and in the browser, so live playground code can be
 * highlighted without shipping a full grammar engine.
 */

export type Lang = "tsx" | "html" | "css" | "bash";
export type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "tag"
  | "attr"
  | "number"
  | "type"
  | "prop"
  | "command"
  | "plain";

export interface Token {
  type: TokenType;
  text: string;
}

const STRING = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\x60(?:[^\x60\\]|\\.)*\x60`;

const grammars: Record<Lang, [TokenType, string][]> = {
  tsx: [
    ["comment", String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`],
    ["string", STRING],
    ["tag", String.raw`(?<=<\/?)[A-Za-z][\w.]*`],
    ["attr", String.raw`\b[a-zA-Z_][\w-]*(?==)`],
    [
      "keyword",
      String.raw`\b(?:import|from|export|const|let|var|function|return|default|if|else|type|interface|extends|new|await|async|true|false|null|undefined|as)\b`,
    ],
    ["number", String.raw`\b\d+(?:\.\d+)?\b`],
    ["type", String.raw`\b[A-Z][A-Za-z0-9]*\b`],
  ],
  html: [
    ["comment", String.raw`<!--[\s\S]*?-->`],
    ["string", STRING],
    ["tag", String.raw`(?<=<\/?)[A-Za-z][\w-]*`],
    ["attr", String.raw`\b[a-zA-Z_:][\w:.-]*(?==)`],
  ],
  css: [
    ["comment", String.raw`\/\*[\s\S]*?\*\/`],
    ["string", STRING],
    ["keyword", String.raw`@[\w-]+`],
    ["prop", String.raw`--[\w-]+|\b[a-z-]+(?=\s*:)`],
    ["number", String.raw`\b\d+(?:\.\d+)?(?:px|rem|em|ms|s|%)?`],
  ],
  bash: [
    ["comment", String.raw`#[^\n]*`],
    ["string", STRING],
    ["command", String.raw`(?<=^|\n)\s*(?:npx|pnpm|npm|yarn|bunx|bun|cd|git)\b`],
    ["attr", String.raw`(?<=\s)--?[\w-]+`],
  ],
};

const compiled = new Map<Lang, RegExp>();

function regexFor(lang: Lang): RegExp {
  let re = compiled.get(lang);
  if (!re) {
    re = new RegExp(grammars[lang].map(([, src], i) => `(?<g${i}>${src})`).join("|"), "g");
    compiled.set(lang, re);
  }
  return re;
}

/**
 * The text between JSX tags (`<p>Don't delete this</p>`), as [start, end] ranges. It's prose,
 * so it shouldn't pick up keyword, type or string colors (the apostrophe in "Don't" would
 * otherwise open a string). A small scanner, since a regex can't tell `<p>` from `a < b`.
 */
export function jsxTextRanges(code: string): [number, number][] {
  const ranges: [number, number][] = [];
  // Each frame is code (top level, or a `{...}` inside JSX, counting braces) or a tag's children.
  const stack: ({ kind: "code"; depth: number } | { kind: "children" })[] = [{ kind: "code", depth: 0 }];
  const skipQuoted = (i: number) => {
    const q = code[i];
    for (i++; i < code.length && code[i] !== q; i++) if (code[i] === "\\") i++;
    return i + 1;
  };
  // From a `<`, past the tag's closing `>`. Returns where the tag ends and whether it opens children.
  const readTag = (i: number): { end: number; opens: boolean; closes: boolean } => {
    const closes = code[i + 1] === "/";
    let depth = 0;
    for (i++; i < code.length; i++) {
      const c = code[i];
      if (c === '"' || c === "'" || c === "`") i = skipQuoted(i) - 1;
      else if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) {
        const selfClosing = code.slice(0, i).trimEnd().endsWith("/");
        return { end: i + 1, opens: !closes && !selfClosing, closes };
      }
    }
    return { end: code.length, opens: false, closes };
  };
  // A `<` starts JSX when a letter or `>` follows and it isn't a generic (`useState<string>`) or a comparison.
  const startsJsx = (i: number) => {
    if (!/[A-Za-z>/]/.test(code[i + 1] ?? "")) return false;
    const before = code.slice(0, i).trimEnd();
    return before === "" || /[(,=?:{}[\]!&|>;]$|\breturn$/.test(before);
  };

  const indexOrEnd = (s: string, from: number) => {
    const at = code.indexOf(s, from);
    return at === -1 ? code.length : at;
  };

  let i = 0;
  while (i < code.length) {
    const top = stack[stack.length - 1]!;
    const c = code[i];
    if (top.kind === "children") {
      if (c === "<") {
        const tag = readTag(i);
        if (tag.closes) stack.pop();
        else if (tag.opens) stack.push({ kind: "children" });
        i = tag.end;
      } else if (c === "{") {
        stack.push({ kind: "code", depth: 1 });
        i++;
      } else {
        const start = i;
        while (i < code.length && code[i] !== "<" && code[i] !== "{") i++;
        ranges.push([start, i]);
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") i = skipQuoted(i);
    else if (c === "/" && code[i + 1] === "/") i = indexOrEnd("\n", i);
    else if (c === "/" && code[i + 1] === "*") i = indexOrEnd("*/", i) + 2;
    else if (c === "{") (top.depth++, i++);
    else if (c === "}") {
      top.depth--;
      i++;
      if (top.depth === 0 && stack.length > 1) stack.pop();
    } else if (c === "<" && startsJsx(i)) {
      const tag = readTag(i);
      if (tag.opens) stack.push({ kind: "children" });
      i = tag.end;
    } else i++;
  }
  return ranges;
}

function tokenizeCode(code: string, lang: Lang): Token[] {
  const re = regexFor(lang);
  const types = grammars[lang].map(([t]) => t);
  const out: Token[] = [];
  let last = 0;
  re.lastIndex = 0;
  for (const m of code.matchAll(re)) {
    if (m[0] === "") continue;
    const index = m.index ?? 0;
    if (index > last) out.push({ type: "plain", text: code.slice(last, index) });
    const groups = m.groups ?? {};
    const i = types.findIndex((_, n) => groups[`g${n}`] !== undefined);
    out.push({ type: types[i] ?? "plain", text: m[0] });
    last = index + m[0].length;
  }
  if (last < code.length) out.push({ type: "plain", text: code.slice(last) });
  return out;
}

export function tokenize(code: string, lang: Lang): Token[] {
  if (lang !== "tsx") return tokenizeCode(code, lang);
  const out: Token[] = [];
  let last = 0;
  for (const [start, end] of jsxTextRanges(code)) {
    if (start > last) out.push(...tokenizeCode(code.slice(last, start), lang));
    out.push({ type: "plain", text: code.slice(start, end) });
    last = end;
  }
  if (last < code.length) out.push(...tokenizeCode(code.slice(last), lang));
  return out;
}
