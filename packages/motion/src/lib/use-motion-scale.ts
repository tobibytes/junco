import * as React from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const ATTR_SCALE: Record<string, number> = { off: 0, subtle: 0.6, full: 1 };

/**
 * Reads the motion scale that applies to `el` (or <html>): 1 full, 0.6 subtle, 0 off.
 * Uses the computed `--motion-scale` token when styles are loaded, otherwise falls back to
 * `prefers-reduced-motion` and the nearest `data-motion` attribute.
 */
export function readMotionScale(el?: Element | null): number {
  if (typeof window === "undefined") return 1;
  const target = el ?? document.documentElement;
  const raw = getComputedStyle(target).getPropertyValue("--motion-scale").trim();
  const value = parseFloat(raw);
  if (raw && Number.isFinite(value)) return Math.min(1, Math.max(0, value));
  if (window.matchMedia?.(REDUCED).matches) return 0;
  const attr = target.closest("[data-motion]")?.getAttribute("data-motion");
  return attr ? (ATTR_SCALE[attr] ?? 1) : 1;
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia?.(REDUCED);
  mq?.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion", "class", "style", "data-theme"],
  });
  return () => {
    mq?.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/**
 * The current motion scale, updated live when `data-motion` or the OS setting changes.
 * Pass a ref to read the scale an element actually inherits (for a `data-motion` on a subtree).
 * Renders as 1 on the server; the CSS-driven effects still show the right state before hydration.
 */
export function useMotionScale(ref?: React.RefObject<Element | null>): number {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const update = () => setScale(readMotionScale(ref?.current));
    update();
    return subscribe(update);
  }, [ref]);
  return scale;
}

/** True when motion is fully off (data-motion="off" or prefers-reduced-motion). */
export function useReducedMotion(ref?: React.RefObject<Element | null>): boolean {
  return useMotionScale(ref) === 0;
}
