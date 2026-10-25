import * as React from "react";
import { useMotion } from "./lib/environment";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum tilt in degrees. Default 8. */
  maxTilt?: number;
  /** A soft light that follows the pointer. Default true. */
  glare?: boolean;
  /** Scale while hovered. Default 1.015. */
  hoverScale?: number;
  /** Perspective distance in px. Smaller is more dramatic. Default 900. */
  perspective?: number;
}

/**
 * A card that tilts toward the pointer in 3D. Pure CSS transforms, no WebGL. The tilt is
 * multiplied by Junco's --motion-scale, so data-motion="subtle" softens it and "off" or
 * reduced motion keeps it flat. Touch input never tilts, so scrolling stays smooth.
 */
export const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(function TiltCard(
  {
    maxTilt = 8,
    glare = true,
    hoverScale = 1.015,
    perspective = 900,
    className,
    style,
    children,
    onPointerMove,
    onPointerLeave,
    ...props
  },
  forwardedRef,
) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current!);
  const { scale } = useMotion(ref);
  const frame = React.useRef(0);

  const set = (x: number, y: number, active: boolean) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", `${(-y * maxTilt).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(x * maxTilt).toFixed(2)}deg`);
    el.style.setProperty("--glare-x", `${((x + 1) * 50).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${((y + 1) * 50).toFixed(1)}%`);
    el.dataset.tilting = active ? "true" : "false";
  };

  React.useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={ref}
      className={className}
      data-tilt-card=""
      data-tilting="false"
      onPointerMove={(e) => {
        onPointerMove?.(e);
        if (e.pointerType === "touch" || scale === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => set(x, y, true));
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        cancelAnimationFrame(frame.current);
        set(0, 0, false);
      }}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(${perspective}px) rotateX(calc(var(--tilt-x, 0deg) * var(--motion-scale, 1))) rotateY(calc(var(--tilt-y, 0deg) * var(--motion-scale, 1))) scale(var(--tilt-scale, 1))`,
        transition:
          "transform calc(var(--duration-slow, 360ms) * var(--motion-scale, 1)) var(--ease-standard, ease-out)",
        willChange: "transform",
        ...({ "--tilt-scale-hover": hoverScale } as React.CSSProperties),
        ...style,
      }}
      {...props}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          data-tilt-glare
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background:
              "radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), oklch(1 0 0 / 0.16), transparent 55%)",
            opacity: "calc(var(--glare-on, 0) * var(--motion-scale, 1))",
            transition: "opacity calc(var(--duration-base, 200ms) * var(--motion-scale, 1)) var(--ease-standard, ease)",
            mixBlendMode: "soft-light",
          }}
        />
      )}
      {/* React 19 hoists this to <head> once, however many cards render */}
      <style href="junco-tilt-card" precedence="default">{`@layer base{:where([data-tilt-card]){position:relative}}[data-tilt-card][data-tilting="true"]{--tilt-scale:var(--tilt-scale-hover);--glare-on:1;transition-duration:calc(var(--duration-fast,120ms) * var(--motion-scale,1))!important}`}</style>
    </div>
  );
});

export default TiltCard;
