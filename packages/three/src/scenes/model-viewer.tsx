import * as React from "react";
import { Bounds, Center, ContactShadows, Environment, Html, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { Spinner } from "@junco/react";
import { JuncoCanvas, useSceneMotion, type SceneFrameProps } from "../lib/canvas";

export interface ModelHotspot {
  id: string;
  /** Position in the model's own coordinates (the model is centered and sits on the floor). */
  position: [number, number, number];
  /** Names the hotspot button for everyone, including screen readers. */
  label: string;
  /** Shown in a small card when the hotspot is opened. Defaults to the label. */
  content?: React.ReactNode;
}

export interface ModelViewerProps extends Omit<SceneFrameProps, "label"> {
  /** URL of a .glb or .gltf file. */
  src: string;
  /** Describes the model for screen readers, e.g. "Junco speaker in sand finish". */
  label: string;
  /** Turns slowly until the user grabs it. Default true (stops with motion off). */
  autoRotate?: boolean;
  /** Default 1. */
  autoRotateSpeed?: number;
  /** Scroll or pinch to zoom. Default false, so the page scrolls normally over the model. */
  enableZoom?: boolean;
  /** Soft shadow under the model. Default true. */
  shadows?: boolean;
  hotspots?: ModelHotspot[];
  /** Called when a hotspot opens (id) or closes (null). */
  onHotspotChange?: (id: string | null) => void;
  /** Starting camera position. */
  cameraPosition?: [number, number, number];
}

const hotspotCss = `
.junco-hotspot{all:unset;box-sizing:border-box;display:grid;place-items:center;width:28px;height:28px;border-radius:9999px;
background:var(--primary);color:var(--primary-foreground);font:600 12px/1 var(--font-sans,system-ui);cursor:pointer;
box-shadow:0 0 0 4px color-mix(in oklch,var(--primary) 25%,transparent),var(--shadow-float);
transition:transform calc(var(--duration-fast,120ms) * var(--motion-scale,1)) var(--ease-standard,ease)}
.junco-hotspot:hover{transform:scale(1.08)}
.junco-hotspot:focus-visible{outline:2px solid var(--ring);outline-offset:3px}
.junco-hotspot-card{position:absolute;left:36px;top:50%;transform:translateY(-50%);min-width:160px;max-width:240px;padding:8px 10px;
border:1px solid var(--border);border-radius:var(--radius,8px);background:var(--popover);color:var(--popover-foreground);
box-shadow:var(--shadow-float);font:400 13px/1.4 var(--font-sans,system-ui);pointer-events:auto}
`;

class ModelErrorBoundary extends React.Component<{ onError: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Model({ src, onLoaded }: { src: string; onLoaded: () => void }) {
  const { scene } = useGLTF(src);
  React.useEffect(() => onLoaded(), [scene, onLoaded]);
  return <primitive object={scene} />;
}

function Hotspot({
  hotspot,
  open,
  onToggle,
  portal,
}: {
  hotspot: ModelHotspot;
  open: boolean;
  onToggle: () => void;
  portal: React.RefObject<HTMLElement>;
}) {
  const cardId = React.useId();
  return (
    <Html position={hotspot.position} center portal={portal} zIndexRange={[20, 10]} style={{ pointerEvents: "auto" }}>
      <div style={{ position: "relative" }}>
        <button
          type="button"
          className="junco-hotspot"
          aria-label={hotspot.label}
          aria-expanded={open}
          aria-controls={open ? cardId : undefined}
          onClick={onToggle}
        >
          +
        </button>
        {open && (
          <div id={cardId} role="note" className="junco-hotspot-card">
            {hotspot.content ?? hotspot.label}
          </div>
        )}
      </div>
    </Html>
  );
}

function Scene({
  src,
  autoRotate,
  autoRotateSpeed,
  enableZoom,
  shadows,
  hotspots,
  openId,
  setOpenId,
  portal,
  onLoaded,
  onError,
}: Required<Pick<ModelViewerProps, "src" | "autoRotate" | "autoRotateSpeed" | "enableZoom" | "shadows">> & {
  hotspots: ModelHotspot[];
  openId: string | null;
  setOpenId: (id: string | null) => void;
  portal: React.RefObject<HTMLElement>;
  onLoaded: () => void;
  onError: () => void;
}) {
  const { scale } = useSceneMotion();
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} />
      {/* rim light from behind so the silhouette separates from dark backgrounds */}
      <directionalLight position={[-3, 3, -4]} intensity={2.4} />
      {/* a studio light rig built locally, so nothing is fetched from a CDN */}
      <Environment resolution={256} environmentIntensity={1.15}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
        </group>
      </Environment>
      <ModelErrorBoundary onError={onError}>
        <React.Suspense fallback={null}>
          <Bounds fit clip observe margin={1.25}>
            <Center top>
              <Model src={src} onLoaded={onLoaded} />
              {hotspots.map((h) => (
                <Hotspot
                  key={h.id}
                  hotspot={h}
                  portal={portal}
                  open={openId === h.id}
                  onToggle={() => setOpenId(openId === h.id ? null : h.id)}
                />
              ))}
            </Center>
          </Bounds>
          {shadows && <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={8} blur={2.4} far={4} resolution={512} />}
        </React.Suspense>
      </ModelErrorBoundary>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={enableZoom}
        enableDamping
        autoRotate={autoRotate && scale > 0 && openId === null}
        autoRotateSpeed={autoRotateSpeed * scale}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

/**
 * Shows a GLB/GLTF model with orbit controls, a soft studio light, an optional shadow, and
 * hotspots that are real, keyboard-reachable buttons.
 */
export function ModelViewer({
  src,
  label,
  autoRotate = true,
  autoRotateSpeed = 1,
  enableZoom = false,
  shadows = true,
  hotspots = [],
  onHotspotChange,
  cameraPosition = [2.2, 2.4, 3.2],
  className,
  style,
  description,
}: ModelViewerProps) {
  const portal = React.useRef<HTMLDivElement>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [openId, setOpenIdState] = React.useState<string | null>(null);

  React.useEffect(() => setStatus("loading"), [src]);

  const setOpenId = React.useCallback(
    (id: string | null) => {
      setOpenIdState(id);
      onHotspotChange?.(id);
    },
    [onHotspotChange],
  );

  React.useEffect(() => {
    if (openId === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, setOpenId]);

  const onLoaded = React.useCallback(() => setStatus("ready"), []);
  const onError = React.useCallback(() => setStatus("error"), []);

  const overlay = (
    <>
      <style href="junco-model-hotspots" precedence="default">{hotspotCss}</style>
      <div ref={portal} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      {status !== "ready" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
            color: "var(--muted-foreground)",
            font: "400 13px/1.4 var(--font-sans, system-ui)",
          }}
        >
          {status === "loading" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Spinner label={null} />
              <span role="status">Loading 3D model</span>
            </span>
          ) : (
            <span role="alert">Couldn't load the 3D model.</span>
          )}
        </div>
      )}
    </>
  );

  return (
    <JuncoCanvas
      flat={false}
      interactive
      camera={{ position: cameraPosition, fov: 40 }}
      label={label}
      description={description}
      overlay={overlay}
      className={className}
      style={{ cursor: "grab", ...style }}
    >
      <Scene
        src={src}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        enableZoom={enableZoom}
        shadows={shadows}
        hotspots={hotspots}
        openId={openId}
        setOpenId={setOpenId}
        portal={portal as React.RefObject<HTMLElement>}
        onLoaded={onLoaded}
        onError={onError}
      />
    </JuncoCanvas>
  );
}

/** Starts downloading a model before the viewer mounts (e.g. on hover of a link to the product page). */
export const preloadModel = (src: string) => useGLTF.preload(src);

export default ModelViewer;
