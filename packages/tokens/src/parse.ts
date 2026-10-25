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
  for (const part of body.split(";")) {
    const decl = part.trim();
    if (!decl.startsWith("--")) continue;
    const colon = decl.indexOf(":");
    if (colon === -1) continue;
    const name = decl.slice(2, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!name || !value || !/^[\w-]+$/.test(name)) continue;
    out[name] = value.split(/\s+/).join(" ");
  }
  return out;
}

/**
 * Reads the top-level `:root` (light) and dark-mode rules out of tokens.css.
 * Names come back without the leading `--`.
 *
 * A small linear scanner rather than regexes: this is a public export, so it may see arbitrary
 * CSS, and the obvious regexes backtrack quadratically on hostile input.
 */
export function parseTokens(css: string): ParsedTokens {
  const clean = stripComments(css);
  const light: TokenMap = {};
  const dark: TokenMap = {};
  let preludeStart = 0;
  let i = 0;
  while (i < clean.length) {
    const ch = clean[i];
    if (ch === ";" || ch === "}") {
      // end of a top-level statement (e.g. @import ...;) or a stray brace
      preludeStart = i + 1;
      i++;
      continue;
    }
    if (ch !== "{") {
      i++;
      continue;
    }
    const prelude = clean.slice(preludeStart, i).trim();
    // Find the matching close brace, skipping anything nested (e.g. rules inside @media).
    let depth = 1;
    let j = i + 1;
    let nested = false;
    while (j < clean.length && depth > 0) {
      if (clean[j] === "{") {
        depth++;
        nested = true;
      } else if (clean[j] === "}") depth--;
      j++;
    }
    // Top-level plain rules only; at-rules like @media are skipped.
    if (!prelude.startsWith("@") && !nested) {
      const body = clean.slice(i + 1, j - 1);
      const selectors = prelude.split(",").map((sel) => sel.trim());
      if (selectors[0] === ":root") Object.assign(light, declarations(body));
      else if (selectors.includes(".dark")) Object.assign(dark, declarations(body));
    }
    preludeStart = j;
    i = j;
  }
  return { light, dark };
}
