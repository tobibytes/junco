import * as React from "react";
import { Canvas, useThree, type CanvasProps } from "@react-three/fiber";
import { useInView, useMotion } from "./environment";
import { SceneStyles } from "./styles";

interface SceneMotion {
  /** Speed multiplier: 1 full, 0.6 subtle, 0 off. Multiply every animation's delta by it. */
  scale: number;
  /** True while frozen (off screen or motion off). */
  paused: boolean;
}

const SceneMotionContext = React.createContext<SceneMotion>({ scale: 1, paused: false });

/** Motion state for code inside a JuncoCanvas. */
export function useSceneMotion() {
  return React.useContext(SceneMotionContext);
}

export interface SceneFrameProps {
  className?: string;
  style?: React.CSSProperties;
  /**
   * Describes the scene for screen readers. Omit for purely decorative scenes (backgrounds),
   * which are then hidden from assistive tech.
   */
  label?: string;
  /** Extra content for screen readers only (e.g. a list of the globe's locations). */
  description?: React.ReactNode;
}

export interface JuncoCanvasProps extends SceneFrameProps {
  children: React.ReactNode;
  camera?: CanvasProps["camera"];
  /** Keep token colors exact (no tone mapping). Default true; PBR model scenes turn it off. */
  flat?: boolean;
  /** Extra DOM layered over the canvas (loading states, hotspot UI). */
  overlay?: React.ReactNode;
  gl?: CanvasProps["gl"];
  /** Pause regardless of visibility. */
  paused?: boolean;
  onCreated?: CanvasProps["onCreated"];
  /** Allow pointer events on the canvas (drag to rotate). Background scenes leave this off. */
  interactive?: boolean;
}

export const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * The canvas every Junco scene renders into. It renders continuously only while on screen and
 * motion is allowed; otherwise it switches to on-demand rendering, so a frozen scene still draws
 * one correct frame (and redraws when the theme changes) but costs nothing per frame.
 */
export function JuncoCanvas({
  children,
  className,
  style,
  label,
  description,
  camera,
  flat = true,
  overlay,
  gl,
  paused: forcePaused = false,
  onCreated,
  interactive = false,
}: JuncoCanvasProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, "0px");
  const { scale } = useMotion(ref);
  const paused = forcePaused || !inView || scale === 0;
  const motion = React.useMemo(() => ({ scale, paused }), [scale, paused]);

  const descriptionId = React.useId();

  // role="img" makes its children presentational, so it sits on an inner layer that holds only
  // the canvas. Overlays (hotspot buttons) and the screen reader description stay reachable.
  return (
    <div ref={ref} className={className} data-junco-canvas="" style={style}>
      <SceneStyles />
      <div
        role={label ? "img" : undefined}
        aria-label={label}
        aria-describedby={label && description ? descriptionId : undefined}
        aria-hidden={label ? undefined : true}
        style={{ position: "absolute", inset: 0 }}
      >
        <Canvas
          frameloop={paused ? "demand" : "always"}
          dpr={[1, 2]}
          flat={flat}
          camera={camera}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", ...(gl as object) }}
          onCreated={onCreated}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: interactive ? "auto" : "none",
            touchAction: interactive ? "pan-y" : undefined,
          }}
        >
          <SceneMotionContext.Provider value={motion}>{children}</SceneMotionContext.Provider>
        </Canvas>
      </div>
      {overlay}
      {description && (
        <div id={descriptionId} style={srOnly}>
          {description}
        </div>
      )}
    </div>
  );
}

/** Redraws a paused (on-demand) canvas when any dependency changes, e.g. theme colors. */
export function useInvalidateOn(deps: React.DependencyList) {
  const invalidate = useThree((s) => s.invalidate);
  // biome-ignore lint/correctness/useExhaustiveDependencies: callers pass the dependency list
  React.useEffect(() => invalidate(), deps);
}
