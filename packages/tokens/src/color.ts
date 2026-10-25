/**
 * Small color helpers for checking contrast. Handles the formats Junco tokens use:
 * oklch(L C H [/ A]) and hex. Out-of-gamut colors are clamped to sRGB.
 */

export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

/** Linear-light sRGB channels, each 0..1. */
export type LinearRgb = [number, number, number];

const OKLCH_RE = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?))?\s*\)$/i;

function num(value: string): number {
  return value.endsWith("%") ? parseFloat(value) / 100 : parseFloat(value);
}

export function parseOklch(value: string): Oklch | null {
  const m = OKLCH_RE.exec(value.trim());
  if (!m) return null;
  return { l: num(m[1]!), c: num(m[2]!), h: num(m[3]!), alpha: m[4] ? num(m[4]) : 1 };
}

export function oklchToLinearRgb({ l, c, h }: Oklch): LinearRgb {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const L = l_ ** 3;
  const M = m_ ** 3;
  const S = s_ ** 3;

  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [
    clamp(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
    clamp(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
    clamp(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
  ];
}

function hexToLinearRgb(value: string): LinearRgb | null {
  const m = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const hex = m[1]!.length === 3 ? [...m[1]!].map((ch) => ch + ch).join("") : m[1]!;
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return [0, 2, 4].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255)) as LinearRgb;
}

export function toLinearRgb(value: string): LinearRgb {
  const oklch = parseOklch(value);
  if (oklch) return oklchToLinearRgb(oklch);
  const hex = hexToLinearRgb(value);
  if (hex) return hex;
  throw new Error(`Unsupported color: ${value}`);
}

/** WCAG 2 relative luminance. */
export function luminance(value: string): number {
  const [r, g, b] = toLinearRgb(value);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two opaque colors, 1..21. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
