import * as React from "react";
import { cn } from "junco";
import { useInView, type InViewOptions } from "./lib/use-in-view";
import { useMergedRef, type CSSVars } from "./lib/utils";

export interface RevealProps extends React.HTMLAttributes<HTMLElement>, InViewOptions {
  /** Element to render. Default "div". */
  as?: React.ElementType;
  /** Delay before it starts, in ms. */
  delay?: number;
  /** Reveal each direct child one after another (by the --stagger token) instead of all at once. */
  stagger?: boolean;
  /** How far it rises, in px. Default 16. */
  distance?: number;
}

/**
 * Fades and rises its content in when it scrolls into view. With motion off it simply shows.
 *
 *   <Reveal stagger className="grid gap-4 sm:grid-cols-3">{cards}</Reveal>
 */
export const Reveal = React.forwardRef<HTMLElement, RevealProps>(
  (
    { as: Comp = "div", delay = 0, stagger = false, distance, once, threshold, rootMargin, className, style, children, ...props },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLElement>(null);
    const inView = useInView(ref, { once, threshold, rootMargin });
    const vars: CSSVars = { ...style, "--reveal-delay": `${delay}ms` };
    if (distance !== undefined) vars["--reveal-distance"] = `${distance}px`;

    const content = stagger
      ? React.Children.map(children, (child, i) => {
          if (!React.isValidElement<{ className?: string; style?: React.CSSProperties }>(child)) return child;
          return React.cloneElement(child, {
            className: cn(child.props.className, "reveal-item"),
            style: { ...child.props.style, "--reveal-index": i } as CSSVars,
          });
        })
      : children;

    return (
      <Comp
        ref={useMergedRef(ref, forwardedRef)}
        className={cn("reveal", className)}
        data-state={inView ? "visible" : "hidden"}
        data-stagger={stagger || undefined}
        style={vars}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
Reveal.displayName = "Reveal";
