import * as React from "react";
import { Button, cn, type ButtonProps } from "@junco/react";
import { readMotionScale } from "./lib/use-motion-scale";
import { useMergedRef } from "./lib/utils";

export interface MagneticButtonProps extends ButtonProps {
  /** How far it leans toward the pointer, as a share of the distance. Default 0.25. */
  strength?: number;
}

/**
 * A Junco Button that leans toward the pointer and springs back. Mouse and pen only; it never
 * moves under a finger or with motion off. Use it for one hero CTA, not a whole toolbar.
 */
export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ strength = 0.25, className, style, onPointerMove, onPointerLeave, ...props }, forwardedRef) => {
    const ref = React.useRef<HTMLButtonElement>(null);
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });

    const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerMove?.(e);
      const el = ref.current;
      if (!el || e.pointerType === "touch") return;
      const scale = readMotionScale(el);
      if (scale === 0) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength * scale;
      const y = (e.clientY - (r.top + r.height / 2)) * strength * scale;
      setOffset({ x, y });
    };
    const handleLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
      onPointerLeave?.(e);
      setOffset({ x: 0, y: 0 });
    };

    const moving = offset.x !== 0 || offset.y !== 0;
    return (
      <Button
        ref={useMergedRef(ref, forwardedRef)}
        className={cn(className)}
        style={{
          ...style,
          translate: `${offset.x}px ${offset.y}px`,
          transition: moving
            ? "translate calc(var(--duration-fast) * var(--motion-scale)) var(--ease-standard), background-color var(--duration-fast)"
            : "translate calc(var(--duration-slow) * 1.5 * var(--motion-scale)) var(--ease-spring), background-color var(--duration-fast)",
        }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        {...props}
      />
    );
  },
);
MagneticButton.displayName = "MagneticButton";
