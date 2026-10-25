import * as React from "react";
import { toLinearRgb } from "@junco/tokens";

/** A theme color resolved for WebGL. `rgb` is linear-light sRGB, which is three.js's working space. */
export interface ThemeColor {
  /** The raw CSS value, e.g. "oklch(0.55 0.2 260)". */
  css: string;
  /** Linear sRGB, each 0..1. Pass to `color.setRGB(r, g, b)` (three's default working space). */
  rgb: [number, number, number];
}

const FALLBACK: [number, number, number] = [0.5, 0.5, 0.5];

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

let probe: CanvasRenderingContext2D | null | undefined;

/** Any CSS color the browser understands, via a 1px canvas. Used when the token parser can't read it. */
function viaCanvas(css: string): [number, number, number] | null {
  if (typeof document === "undefined" || typeof CanvasRenderingContext2D === "undefined") return null;
  if (probe === undefined) {
    try {
      probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    } catch {
      probe = null;
    }
  }
  if (!probe) return null;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [srgbToLinear(r! / 255), srgbToLinear(g! / 255), srgbToLinear(b! / 255)];
}

/** Turns a CSS color string into linear sRGB. Handles oklch and hex directly, anything else via canvas. */
export function parseCssColor(css: string): [number, number, number] {
  const value = css.trim();
  if (!value) return FALLBACK;
  try {
    return toLinearRgb(value);
  } catch {
    return viaCanvas(value) ?? FALLBACK;
  }
}

/** Reads CSS custom properties (e.g. "--primary") from an element, defaulting to <html>. */
export function readThemeColors<N extends string>(names: readonly N[], el?: Element | null): Record<N, ThemeColor> {
  const out = {} as Record<N, ThemeColor>;
  const target = el ?? (typeof document !== "undefined" ? document.documentElement : null);
  const style = target ? getComputedStyle(target) : null;
  for (const name of names) {
    const css = style?.getPropertyValue(name).trim() ?? "";
    out[name] = { css, rgb: parseCssColor(css) };
  }
  return out;
}

/**
 * Calls `onChange` whenever the theme might have changed: class, data-theme or style on <html>
 * (how ThemeProvider and most theme switchers work), or the OS color scheme.
 */
export function subscribeToTheme(onChange: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  mq?.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    mq?.removeEventListener("change", onChange);
  };
}

/**
 * Live theme colors for a scene. Re-reads when the theme changes, so dark mode relights the scene.
 * Pass `ref` to read from a scoped theme container instead of <html>.
 */
export function useThemeColors<N extends string>(
  names: readonly N[],
  ref?: React.RefObject<Element | null>,
): Record<N, ThemeColor> {
  const key = names.join("|");
  const [colors, setColors] = React.useState(() => readThemeColors(names, ref?.current));

  React.useEffect(() => {
    const list = key.split("|") as N[];
    const read = () => {
      const next = readThemeColors(list, ref?.current);
      setColors((prev) => (list.every((n) => prev[n]?.css === next[n].css) ? prev : next));
    };
    read();
    return subscribeToTheme(read);
  }, [key, ref]);

  return colors;
}
