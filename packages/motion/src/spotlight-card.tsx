import * as React from "react";
import { cn } from "@junco/react";
import { useMergedRef } from "./lib/utils";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  /** Diameter of the glow, any CSS length. Default 22rem. */
  size?: string;
}

/**
 * A card with a soft light that follows the pointer and lights up its border nearby.
 * Looks like a Junco card (border, card background, 8px radius); pass className to change it.
 * The light is a hover effect, so it stays with motion off; only its fade is skipped.
 */
export const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ as: Comp = "div", size, className, style, onPointerMove, onPointerLeave, ...props }, forwardedRef) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const frame = React.useRef(0);

    const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(e);
      const el = ref.current;
      if (!el || e.pointerType === "touch") return;
      const { clientX, clientY } = e;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--spotlight-x", `${clientX - r.left}px`);
        el.style.setProperty("--spotlight-y", `${clientY - r.top}px`);
        el.dataset.active = "";
      });
    };
    const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(e);
      cancelAnimationFrame(frame.current);
      if (ref.current) delete ref.current.dataset.active;
    };

    return (
      <Comp
        ref={useMergedRef(ref, forwardedRef)}
        className={cn("spotlight rounded-card border border-border bg-card text-card-foreground", className)}
        style={size ? { ...style, "--spotlight-size": size } : style}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        {...props}
      />
    );
  },
);
SpotlightCard.displayName = "SpotlightCard";
