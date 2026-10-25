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

export function tokenize(code: string, lang: Lang): Token[] {
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
