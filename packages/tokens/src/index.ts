import type { ParsedTokens } from "./parse.ts";

declare const __JUNCO_TOKENS__: ParsedTokens;

/**
 * Every token from tokens.css, keyed by name without the leading `--`.
 * `light` holds all tokens; `dark` holds only the ones that change in dark mode.
 */
export const tokens: ParsedTokens = __JUNCO_TOKENS__;

export { contrastRatio, luminance, parseOklch, toLinearRgb, type Oklch } from "./color.ts";
export { parseTokens, type ParsedTokens, type TokenMap } from "./parse.ts";
export { controlPairs, MIN_CONTROL_CONTRAST, MIN_TEXT_CONTRAST, textPairs } from "./pairs.ts";
