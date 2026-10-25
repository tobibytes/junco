import * as React from "react";
import { cn } from "@junco/react";
import { useMotionScale } from "./lib/use-motion-scale";
import { useMergedRef, type CSSVars } from "./lib/utils";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Scroll direction. Default "left". */
  direction?: "left" | "right" | "up" | "down";
  /** Seconds for one full loop at full motion. Slower with subtle motion. */
  duration?: number;
  /** Gap between items, any CSS length. Default 3rem. */
  gap?: string;
  /** How many copies of the content make up the loop. Default 2 (raise it for short content). */
  repeat?: number;
  /** Fade the edges. Default true. */
  fade?: boolean;
  classNames?: { root?: string; track?: string };
}

/**
 * An endless scrolling row (logos, testimonials). Pauses on hover and keyboard focus.
 * Copies are hidden from assistive tech and can't be tabbed into. With motion off it becomes a
 * still, wrapped row showing each item once.
 */
export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    { direction = "left", duration, gap, repeat = 2, fade = true, className, classNames, style, children, ...props },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const scale = useMotionScale(ref);
    const isStatic = scale === 0;
    const vertical = direction === "up" || direction === "down";
    const vars: CSSVars = { ...style };
    if (duration) vars["--marquee-duration"] = `${duration}s`;
    if (gap) vars["--marquee-gap"] = gap;
    if (!fade) vars.maskImage = "none";

    return (
      <div
        ref={useMergedRef(ref, forwardedRef)}
        className={cn(
          "marquee",
          vertical && "marquee-vertical",
          (direction === "right" || direction === "down") && "marquee-reverse",
          classNames?.root,
          className,
        )}
        data-static={isStatic || undefined}
        style={vars}
        {...props}
      >
        {Array.from({ length: isStatic ? 1 : Math.max(2, repeat) }, (_, i) => (
          <div
            key={i}
            className={cn("marquee-track", classNames?.track)}
            aria-hidden={i > 0 || undefined}
            inert={i > 0 || undefined}
          >
            {children}
          </div>
        ))}
      </div>
    );
  },
);
Marquee.displayName = "Marquee";
