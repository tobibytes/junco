import * as React from "react";
import { cn } from "@junco/react";
import { useInView, type InViewOptions } from "./lib/use-in-view";
import { useMergedRef, visuallyHidden, type CSSVars } from "./lib/utils";

export interface TextRevealProps extends Omit<React.HTMLAttributes<HTMLElement>, "children">, InViewOptions {
  /** The text. Plain string so it can be split; screen readers get it whole. */
  children: string;
  /** Element to render, e.g. "h1". Default "span". */
  as?: React.ElementType;
  /** Split into words (default) or characters. */
  by?: "word" | "char";
  /** Delay before the first piece, in ms. */
  delay?: number;
}

/**
 * Reveals text a word (or character) at a time when it scrolls into view.
 * Assistive tech reads the full text once; the animated pieces are hidden from it.
 *
 *   <TextReveal as="h1" className="text-5xl font-semibold">Ship the whole product</TextReveal>
 */
export const TextReveal = React.forwardRef<HTMLElement, TextRevealProps>(
  ({ as: Comp = "span", by = "word", delay = 0, once, threshold, rootMargin, className, style, children, ...props }, forwardedRef) => {
    const ref = React.useRef<HTMLElement>(null);
    const inView = useInView(ref, { once, threshold, rootMargin });
    const pieces = by === "word" ? children.split(/(\s+)/) : Array.from(children);
    let index = 0;

    return (
      <Comp
        ref={useMergedRef(ref, forwardedRef)}
        className={cn("text-reveal", className)}
        data-state={inView ? "visible" : "hidden"}
        style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSVars}
        {...props}
      >
        <span style={visuallyHidden}>{children}</span>
        <span aria-hidden>
          {pieces.map((piece, i) =>
            /^\s+$/.test(piece) ? (
              piece
            ) : (
              <span key={i} className="text-reveal-word" style={{ "--i": index++ } as CSSVars}>
                {piece}
              </span>
            ),
          )}
        </span>
      </Comp>
    );
  },
);
TextReveal.displayName = "TextReveal";
