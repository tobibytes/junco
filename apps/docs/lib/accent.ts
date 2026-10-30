import * as React from "react";
import { contrastRatio, tokens } from "@junco/tokens";

/**
 * Builds a --primary pair (light + dark) from a hue, picking the lightness that still
 * clears 4.5:1 against its text and the page. This is the "one color in, accessible
 * theme out" idea from the plan, done in the browser.
 */

const MIN = 4.5;
const fmt = (l: number, c: number, h: number) => `oklch(${l.toFixed(2)} ${c.toFixed(3)} ${Math.round(h)})`;

export interface Accent {
  hue: number;
  chroma: number;
  light: { primary: string; foreground: string; ring?: string };
  dark: { primary: string; foreground: string; ring?: string };
  checks: { label: string; mode: "light" | "dark"; ratio: number }[];
}

export function makeAccent(hue: number, chroma: number): Accent {
  const lightBg = tokens.light.background!;
  const lightSurface = tokens.light.surface!;
  const darkBg = tokens.dark.background!;
  const darkSurface = tokens.dark.surface!;

  const lightFg = "oklch(0.99 0 0)";
  let lightL = 0.3;
  for (let l = 0.75; l >= 0.3; l -= 0.01) {
    const p = fmt(l, chroma, hue);
    if (contrastRatio(lightFg, p) >= MIN + 0.05 && contrastRatio(p, lightBg) >= MIN + 0.05) {
      lightL = l;
      break;
    }
  }

  const darkFg = fmt(0.15, Math.min(chroma, 0.03), hue);
  let darkL = 0.9;
  for (let l = 0.55; l <= 0.9; l += 0.01) {
    const p = fmt(l, chroma, hue);
    if (contrastRatio(p, darkFg) >= MIN + 0.05 && contrastRatio(p, darkBg) >= MIN + 0.05 && contrastRatio(p, darkSurface) >= MIN + 0.05) {
      darkL = l;
      break;
    }
  }

  const light = { primary: fmt(lightL, chroma, hue), foreground: lightFg };
  const dark = { primary: fmt(darkL, chroma * 0.9, hue), foreground: darkFg };
  return withChecks(hue, chroma, light, dark);
}

/** Junco's default: ink, straight from the tokens (near-black in light, near-white in dark). */
export const inkAccent: Accent = withChecks(
  260,
  0,
  { primary: tokens.light.primary!, foreground: tokens.light["primary-foreground"]!, ring: tokens.light.ring! },
  { primary: tokens.dark.primary!, foreground: tokens.dark["primary-foreground"]!, ring: tokens.dark.ring! },
);

function withChecks(hue: number, chroma: number, light: Accent["light"], dark: Accent["dark"]): Accent {
  const lightBg = tokens.light.background!;
  const lightSurface = tokens.light.surface!;
  const darkBg = tokens.dark.background!;
  const darkSurface = tokens.dark.surface!;
  return {
    hue,
    chroma,
    light,
    dark,
    checks: [
      { label: "Text on primary", mode: "light", ratio: contrastRatio(light.foreground, light.primary) },
      { label: "Primary on page", mode: "light", ratio: contrastRatio(light.primary, lightBg) },
      { label: "Primary on surface", mode: "light", ratio: contrastRatio(light.primary, lightSurface) },
      { label: "Text on primary", mode: "dark", ratio: contrastRatio(dark.foreground, dark.primary) },
      { label: "Primary on page", mode: "dark", ratio: contrastRatio(dark.primary, darkBg) },
      { label: "Primary on surface", mode: "dark", ratio: contrastRatio(dark.primary, darkSurface) },
    ],
  };
}

export function accentCss(a: Accent): string {
  return `:root {
  --primary: ${a.light.primary};
  --primary-foreground: ${a.light.foreground};
  --ring: ${a.light.ring ?? a.light.primary};
}

.dark,
[data-theme="dark"] {
  --primary: ${a.dark.primary};
  --primary-foreground: ${a.dark.foreground};
  --ring: ${a.dark.ring ?? a.dark.primary};
}`;
}

const STYLE_ID = "junco-accent-preview";

/** Applies an accent to the whole page by injecting a style tag. Pass null to reset. */
export function applyAccent(a: Accent | null) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!a) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = accentCss(a).replace(/\n/g, "");
}

/** `isDefault` is the token default (ink); picking it removes the preview instead of generating a color. */
export const presets = [
  { name: "Ink", hue: 260, chroma: 0, isDefault: true },
  { name: "Blue", hue: 260, chroma: 0.2 },
  { name: "Indigo", hue: 275, chroma: 0.19 },
  { name: "Violet", hue: 300, chroma: 0.2 },
  { name: "Rose", hue: 10, chroma: 0.19 },
  { name: "Orange", hue: 45, chroma: 0.17 },
  { name: "Green", hue: 150, chroma: 0.15 },
  { name: "Teal", hue: 185, chroma: 0.12 },
  { name: "Graphite", hue: 260, chroma: 0.0 },
] as const satisfies ReadonlyArray<{ name: string; hue: number; chroma: number; isDefault?: boolean }>;

/** The accent the visitor is previewing, shared by every picker on the page. */
export interface SiteAccent {
  hue: number;
  chroma: number;
  touched: boolean;
}

// Untouched, the site shows the token default (ink); the sliders start from blue so dragging gives a color.
const DEFAULT_ACCENT: SiteAccent = { hue: 260, chroma: 0.2, touched: false };
let siteAccent = DEFAULT_ACCENT;
const listeners = new Set<() => void>();

export function setSiteAccent(next: { hue: number; chroma: number } | null) {
  siteAccent = next ? { ...next, touched: true } : DEFAULT_ACCENT;
  applyAccent(next ? makeAccent(next.hue, next.chroma) : null);
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSiteAccent(): SiteAccent {
  return React.useSyncExternalStore(subscribe, () => siteAccent, () => DEFAULT_ACCENT);
}
