import * as React from "react";

let webgl: boolean | undefined;

/** True when the browser can create a WebGL context. Cached after the first call. */
export function hasWebGL(): boolean {
  if (webgl !== undefined) return webgl;
  if (typeof window === "undefined" || typeof WebGLRenderingContext === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    webgl = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

/** Test hook: forget the cached WebGL answer. */
export function resetWebGLCache() {
  webgl = undefined;
}

/** Data saver on: treat as low power and skip 3D. */
export function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}

export type MotionLevel = "full" | "subtle" | "off";

const SCALE: Record<MotionLevel, number> = { full: 1, subtle: 0.6, off: 0 };

/** Reads Junco's motion setting: `prefers-reduced-motion` always wins, then the nearest `data-motion`. */
export function readMotion(el?: Element | null): MotionLevel {
  if (typeof window === "undefined") return "full";
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return "off";
  const host = (el ?? document.documentElement).closest("[data-motion]");
  const value = host?.getAttribute("data-motion");
  return value === "off" || value === "subtle" ? value : "full";
}

/** Live motion level and its speed multiplier (1, 0.6 or 0). */
export function useMotion(ref?: React.RefObject<Element | null>): { level: MotionLevel; scale: number } {
  const [level, setLevel] = React.useState<MotionLevel>(() => readMotion(ref?.current));

  React.useEffect(() => {
    const read = () => setLevel(readMotion(ref?.current));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-motion"] });
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    mq?.addEventListener("change", read);
    return () => {
      observer.disconnect();
      mq?.removeEventListener("change", read);
    };
  }, [ref]);

  return { level, scale: SCALE[level] };
}

/** Whether an element is on (or near) the screen. Defaults to true where IntersectionObserver is missing. */
export function useInView(ref: React.RefObject<Element | null>, rootMargin = "200px"): boolean {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

/** Runs only on the client after mount, so server HTML and first client render match. */
export function useIsClient(): boolean {
  const [client, setClient] = React.useState(false);
  React.useEffect(() => setClient(true), []);
  return client;
}
