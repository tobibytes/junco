import * as React from "react";
import { hasWebGL, isLowPower, useInView, useIsClient, useMotion } from "./environment";
import { SceneStyles } from "./styles";

const fill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

export interface StaticGradientProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * The default still fallback: a soft mesh-like gradient built from the theme's own colors,
 * so it matches the 3D scene it stands in for and follows dark mode with no JavaScript.
 */
export function StaticGradient({ style, ...props }: StaticGradientProps) {
  return (
    <div
      aria-hidden
      style={{
        ...fill,
        background: [
          "radial-gradient(60% 70% at 18% 28%, color-mix(in oklch, var(--primary, #3b82f6) 38%, transparent), transparent 70%)",
          "radial-gradient(50% 60% at 82% 22%, color-mix(in oklch, var(--chart-2, #14b8a6) 28%, transparent), transparent 70%)",
          "radial-gradient(60% 60% at 70% 85%, color-mix(in oklch, var(--chart-4, #d946ef) 24%, transparent), transparent 70%)",
          "var(--background, transparent)",
        ].join(", "),
        ...style,
      }}
      {...props}
    />
  );
}

/** A plain note for scenes that can't fall back to decoration (a product model is content). */
export function UnavailableFallback({ label = "3D preview isn't available on this device." }: { label?: string }) {
  return (
    <div style={{ ...fill, display: "grid", placeItems: "center", padding: 16, textAlign: "center" }}>
      <p style={{ margin: 0, color: "var(--muted-foreground)", font: "400 13px/1.4 var(--font-sans, system-ui)" }}>{label}</p>
    </div>
  );
}

/** A neutral loading state, for scenes (like a product model) where a decorative gradient would mislead. */
export function LoadingFallback({ label = "Loading 3D scene" }: { label?: string }) {
  return (
    <div style={{ ...fill, display: "grid", placeItems: "center" }}>
      <span
        role="status"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted-foreground)", font: "400 13px/1.4 var(--font-sans, system-ui)" }}
      >
        <span
          aria-hidden
          style={{
            width: 16,
            height: 16,
            borderRadius: 9999,
            border: "2px solid currentColor",
            borderRightColor: "transparent",
            animation: "junco-three-spin calc(0.8s / max(var(--motion-scale, 1), 0.5)) linear infinite",
          }}
        />
        {label}
      </span>
    </div>
  );
}

class SceneErrorBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    if (typeof console !== "undefined") console.warn("[@junco/three] scene failed, showing the fallback.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type Loader<P> = () => Promise<{ default: React.ComponentType<P> }>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;
const lazyCache = new WeakMap<() => Promise<{ default: AnyComponent }>, React.LazyExoticComponent<AnyComponent>>();

/** One React.lazy per loader, so re-renders never remount the scene. */
function lazyFor<P>(load: Loader<P>): React.LazyExoticComponent<React.ComponentType<P>> {
  let lazy = lazyCache.get(load);
  if (!lazy) {
    lazy = React.lazy(load);
    lazyCache.set(load, lazy);
  }
  return lazy;
}

export interface Scene3DFrameProps {
  /** Shown without WebGL, in data-saver mode, and if the scene fails. Defaults to `poster` or a theme gradient. */
  fallback?: React.ReactNode;
  /** Shown while the scene downloads. Defaults to the fallback. */
  loading?: React.ReactNode;
  /** A still image to use as the fallback (a screenshot of the scene works well). */
  poster?: string;
  /** Alt text for `poster`. Leave empty for decorative scenes. */
  alt?: string;
  /**
   * What reduced motion (or `data-motion="off"`) does. "freeze" (default) renders one still frame;
   * "fallback" shows the fallback and never downloads three.js.
   */
  reducedMotion?: "freeze" | "fallback";
  /** Load as soon as mounted instead of waiting until the scene is near the viewport. */
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface Scene3DProps<P> extends Scene3DFrameProps {
  /** A dynamic import of the scene, e.g. `() => import("@junco/three/globe")`. Keep it stable (module scope). */
  load: Loader<P>;
  /** Props for the scene. */
  props?: P;
}

/**
 * Lazy loads a 3D scene only when it is near the screen and the device can run it, with a fallback
 * for everything else. Nothing from three.js is downloaded until then.
 *
 *   const loadGlobe = () => import("@junco/three/globe");
 *   <Scene3D load={loadGlobe} props={{ points }} className="h-96" />
 */
export function Scene3D<P extends object>({
  load,
  props,
  fallback,
  loading,
  poster,
  alt = "",
  reducedMotion = "freeze",
  eager = false,
  className,
  style,
}: Scene3DProps<P>) {
  const ref = React.useRef<HTMLDivElement>(null);
  const client = useIsClient();
  const inView = useInView(ref);
  const { level } = useMotion(ref);
  const [started, setStarted] = React.useState(false);

  const supported = client && hasWebGL() && !isLowPower();
  const blockedByMotion = reducedMotion === "fallback" && level === "off";
  const ready = supported && !blockedByMotion && (eager || inView || started);

  // once a scene has loaded, keep it mounted when it scrolls away (the canvas pauses itself)
  React.useEffect(() => {
    if (ready) setStarted(true);
  }, [ready]);

  const still =
    fallback ??
    (poster ? (
      <img src={poster} alt={alt} loading="lazy" decoding="async" style={{ ...fill, objectFit: "cover" }} />
    ) : (
      <StaticGradient />
    ));

  const Scene = lazyFor(load);

  return (
    <div
      ref={ref}
      className={className}
      data-junco-scene={ready ? "live" : "fallback"}
      style={style}
    >
      <SceneStyles />
      {ready ? (
        <SceneErrorBoundary fallback={still}>
          <React.Suspense fallback={loading ?? still}>
            <Scene {...(props as P & React.JSX.IntrinsicAttributes)} />
          </React.Suspense>
        </SceneErrorBoundary>
      ) : (
        still
      )}
    </div>
  );
}

/** Turns a scene loader into a ready-to-use lazy component: scene props plus Scene3D's frame props. */
export function createLazyScene<P extends object>(
  load: Loader<P>,
  displayName: string,
  /** Scene-specific defaults, used when the caller passes nothing (or no `poster` for the fallback). */
  defaults: { loading?: React.ReactNode; fallback?: React.ReactNode } = {},
) {
  function LazyScene({
    fallback,
    loading = defaults.loading,
    poster,
    alt,
    reducedMotion,
    eager,
    className,
    style,
    ...props
  }: P & Scene3DFrameProps) {
    return (
      <Scene3D
        load={load}
        props={props as unknown as P}
        fallback={fallback ?? (poster ? undefined : defaults.fallback)}
        loading={loading}
        poster={poster}
        alt={alt}
        reducedMotion={reducedMotion}
        eager={eager}
        className={className}
        style={style}
      />
    );
  }
  LazyScene.displayName = displayName;
  return LazyScene;
}
