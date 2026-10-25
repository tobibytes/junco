export type TokenMap = Record<string, string>;

export interface ParsedTokens {
  /** Tokens on :root (light mode, plus every non-color token). */
  light: TokenMap;
  /** Tokens that change in dark mode (.dark / [data-theme="dark"]). */
  dark: TokenMap;
}

/** Removes /* comments *\/ in one linear pass (a lazy regex goes quadratic on unclosed comments). */
function stripComments(css: string) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const start = css.indexOf("/*", i);
    if (start === -1) return out + css.slice(i);
    out += css.slice(i, start);
    const end = css.indexOf("*/", start + 2);
    if (end === -1) return out; // unclosed comment runs to the end, as in CSS
    i = end + 2;
  }
  return out;
}

function declarations(body: string): TokenMap {
  const out: TokenMap = {};
  for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]!] = m[2]!.trim().replace(/\s+/g, " ");
  }
  return out;
}

/**
 * Reads the top-level `:root` (light) and dark-mode rules out of tokens.css.
 * Names come back without the leading `--`.
 */
export function parseTokens(css: string): ParsedTokens {
  const clean = stripComments(css);
  const light: TokenMap = {};
  const dark: TokenMap = {};
  // Top-level rules only: the selector must follow the start of the file or a closing brace,
  // so rules nested in @media are skipped.
  for (const m of clean.matchAll(/(?<=^|\})\s*([^{}@]+?)\s*\{([^{}]*)\}/g)) {
    const selectors = m[1]!.split(",").map((s) => s.trim());
    if (selectors[0] === ":root") Object.assign(light, declarations(m[2]!));
    else if (selectors.includes(".dark")) Object.assign(dark, declarations(m[2]!));
  }
  return { light, dark };
}
