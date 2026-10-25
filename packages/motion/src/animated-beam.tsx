import * as React from "react";
import { cn } from "junco";
import type { CSSVars } from "./lib/utils";

export interface AnimatedBeamProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  /** The positioned element that contains both ends (and this beam). */
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  /** Bend of the curve in px. 0 is straight; negative bends up. Default 0. */
  curvature?: number;
  /** Seconds per trip at full motion. */
  duration?: number;
  /** Seconds before the first trip. */
  delay?: number;
  /** Send the light from `to` back to `from`. */
  reverse?: boolean;
}

/**
 * A line between two elements with a light that travels along it, e.g. to show data flowing from
 * integrations into your app. Decorative (hidden from assistive tech). With motion off only the
 * line remains. Place it inside `containerRef` with `position: relative` on the container.
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration,
  delay = 0,
  reverse = false,
  className,
  style,
  ...props
}: AnimatedBeamProps) {
  const [geo, setGeo] = React.useState({ d: "", w: 0, h: 0 });

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const from = fromRef.current;
      const to = toRef.current;
      if (!from || !to) return;
      const c = container.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const x1 = a.left - c.left + a.width / 2;
      const y1 = a.top - c.top + a.height / 2;
      const x2 = b.left - c.left + b.width / 2;
      const y2 = b.top - c.top + b.height / 2;
      const [sx, sy, ex, ey] = reverse ? [x2, y2, x1, y1] : [x1, y1, x2, y2];
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2 - curvature;
      setGeo({ d: `M ${sx},${sy} Q ${mx},${my} ${ex},${ey}`, w: c.width, h: c.height });
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(container);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef, fromRef, toRef, curvature, reverse]);

  const vars: CSSVars = { ...style, "--beam-delay": `${delay}s` };
  if (duration) vars["--beam-duration"] = `${duration}s`;

  return (
    <svg
      aria-hidden
      focusable={false}
      width={geo.w}
      height={geo.h}
      viewBox={`0 0 ${geo.w} ${geo.h}`}
      fill="none"
      className={cn(className)}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", ...vars }}
      {...props}
    >
      {geo.d && (
        <>
          <path d={geo.d} pathLength={1} stroke="var(--border-strong)" strokeOpacity={0.5} strokeWidth={1.5} />
          <path
            d={geo.d}
            pathLength={1}
            className="beam-path"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
