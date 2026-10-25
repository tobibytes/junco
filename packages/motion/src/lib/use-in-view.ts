import * as React from "react";

export interface InViewOptions {
  /** Stop watching after the first time it comes into view. Default true. */
  once?: boolean;
  /** How much must be visible, 0..1. Default 0.15. */
  threshold?: number;
  rootMargin?: string;
}

/** True once the element is on screen. Without IntersectionObserver it is always true. */
export function useInView<T extends Element>(
  ref: React.RefObject<T | null>,
  { once = true, threshold = 0.15, rootMargin = "0px 0px -10% 0px" }: InViewOptions = {},
): boolean {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, once, threshold, rootMargin]);
  return inView;
}
