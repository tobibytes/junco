import * as React from "react";
import { cn } from "@junco/react";
import { useInView } from "./lib/use-in-view";
import { readMotionScale } from "./lib/use-motion-scale";
import { useMergedRef, visuallyHidden } from "./lib/utils";

export interface NumberTickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  value: number;
  /** Where counting starts. Default 0. */
  from?: number;
  /** Full-motion duration in ms. Scaled by the motion switch; instant with motion off. Default 1400. */
  duration?: number;
  /** Delay after coming into view, in ms. */
  delay?: number;
  /** Formatting. A function, or Intl.NumberFormat options. Default: grouped integer or the value's decimals. */
  format?: ((value: number) => string) | Intl.NumberFormatOptions;
  locale?: string;
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

function decimalsOf(n: number) {
  const s = String(n);
  return s.includes(".") ? s.split(".")[1]!.length : 0;
}

/**
 * Counts up to `value` when it scrolls into view. Uses tabular figures so the width doesn't jump.
 * Screen readers always get the final value, never the in-between numbers.
 *
 *   <NumberTicker value={12840} /> <NumberTicker value={99.9} format={{ style: "percent" }} />
 */
export const NumberTicker = React.forwardRef<HTMLSpanElement, NumberTickerProps>(
  ({ value, from = 0, duration = 1400, delay = 0, format, locale = "en-US", className, ...props }, forwardedRef) => {
    const ref = React.useRef<HTMLSpanElement>(null);
    const inView = useInView(ref);
    const fmt = React.useMemo(() => {
      if (typeof format === "function") return format;
      const d = decimalsOf(value);
      const nf = new Intl.NumberFormat(locale, format ?? { minimumFractionDigits: d, maximumFractionDigits: d });
      return (n: number) => nf.format(n);
    }, [format, locale, value]);
    // Server and first paint show the final value; the count starts once it's on screen.
    const [display, setDisplay] = React.useState(value);
    const started = React.useRef(false);

    React.useLayoutEffect(() => {
      if (!started.current && readMotionScale(ref.current) > 0) setDisplay(from);
    }, [from]);

    React.useEffect(() => {
      if (!inView) return;
      const scale = readMotionScale(ref.current);
      const total = duration * scale;
      if (total <= 0) {
        setDisplay(value);
        return;
      }
      started.current = true;
      const startValue = from;
      let raf = 0;
      let startTime = 0;
      const timer = window.setTimeout(() => {
        const tick = (now: number) => {
          startTime ||= now;
          const t = Math.min(1, (now - startTime) / total);
          setDisplay(startValue + (value - startValue) * easeOutExpo(t));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, delay * scale);
      return () => {
        window.clearTimeout(timer);
        cancelAnimationFrame(raf);
      };
    }, [inView, value, from, duration, delay]);

    return (
      <span ref={useMergedRef(ref, forwardedRef)} className={cn("tabular-nums", className)} style={{ fontVariantNumeric: "tabular-nums" }} {...props}>
        <span aria-hidden>{fmt(display)}</span>
        <span style={visuallyHidden}>{fmt(value)}</span>
      </span>
    );
  },
);
NumberTicker.displayName = "NumberTicker";
