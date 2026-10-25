import * as React from "react";
import { useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  Color,
  NormalBlending,
  QuadraticBezierCurve3,
  Quaternion,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { JuncoCanvas, useInvalidateOn, useSceneMotion, type SceneFrameProps } from "../lib/canvas";
import { useThemeColors, type ThemeColor } from "../lib/theme-colors";

export interface GlobePoint {
  lat: number;
  lng: number;
  /** Read by screen readers in the location list. */
  label?: string;
  /** Marker size multiplier. Default 1. */
  size?: number;
}

export interface GlobeArc {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  label?: string;
}

export interface GlobeProps extends Omit<SceneFrameProps, "label"> {
  points?: GlobePoint[];
  arcs?: GlobeArc[];
  /** What the globe shows, for screen readers. Default describes the counts. */
  label?: string;
  /** Turns slowly on its own. Default true (stops with motion off). */
  autoRotate?: boolean;
  /** Drag to rotate. Default true. */
  interactive?: boolean;
  /** Dots that make up the sphere. Default 2600. */
  dotCount?: number;
  /** Theme variables: dots, accent (markers, arcs), glow. */
  colors?: { dots?: string; accent?: string; glow?: string };
}

/** A few well-known cities, used when no data is passed. */
export const sampleGlobeData: { points: GlobePoint[]; arcs: GlobeArc[] } = (() => {
  const c = {
    sf: { lat: 37.77, lng: -122.42, label: "San Francisco" },
    ny: { lat: 40.71, lng: -74.0, label: "New York" },
    ldn: { lat: 51.51, lng: -0.13, label: "London" },
    lag: { lat: 6.52, lng: 3.38, label: "Lagos" },
    blr: { lat: 12.97, lng: 77.59, label: "Bengaluru" },
    tyo: { lat: 35.68, lng: 139.69, label: "Tokyo" },
    syd: { lat: -33.87, lng: 151.21, label: "Sydney" },
    sp: { lat: -23.55, lng: -46.63, label: "São Paulo" },
  };
  const arc = (a: GlobePoint, b: GlobePoint): GlobeArc => ({ from: a, to: b, label: `${a.label} to ${b.label}` });
  return {
    points: Object.values(c),
    arcs: [arc(c.sf, c.ldn), arc(c.ny, c.lag), arc(c.ldn, c.blr), arc(c.blr, c.tyo), arc(c.tyo, c.syd), arc(c.sp, c.ny), arc(c.sf, c.tyo)],
  };
})();

export function latLngToVector3(lat: number, lng: number, radius = 1): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

const dotsVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (3.0 / -mv.z);
  }
`;

const dotsFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // dots fade toward the rim so the sphere reads as round
    float alpha = smoothstep(0.5, 0.35, d) * smoothstep(0.0, 0.55, vFacing) * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
    #include <colorspace_fragment>
  }
`;

const glowVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(clamp(1.0 + dot(vNormal, vView), 0.0, 1.0), 6.0);
    gl_FragColor = vec4(uColor, rim * uStrength);
    #include <colorspace_fragment>
  }
`;

function fibonacciSphere(count: number, radius: number) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    out[i * 3] = Math.cos(theta) * r * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return out;
}

function luminance([r, g, b]: [number, number, number]) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function Marker({ point, accent }: { point: GlobePoint; accent: ThemeColor }) {
  const ring = React.useRef<Mesh>(null);
  const { scale } = useSceneMotion();
  const position = React.useMemo(() => latLngToVector3(point.lat, point.lng, 1.005), [point.lat, point.lng]);
  const color = React.useMemo(() => new Color().setRGB(...accent.rgb), [accent]);
  const phase = React.useRef(Math.random());
  const size = point.size ?? 1;

  // ring geometry faces +Z; turn it to face out of the sphere (local space, so the globe's tilt doesn't matter)
  const orientation = React.useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), position.clone().normalize()),
    [position],
  );

  useFrame((_, delta) => {
    if (!ring.current) return;
    phase.current = (phase.current + delta * 0.6 * scale) % 1;
    const p = scale === 0 ? 0.5 : phase.current;
    ring.current.scale.setScalar(1 + p * 2.2);
    (ring.current.material as { opacity: number }).opacity = (1 - p) * 0.6;
  });

  return (
    <group position={position} quaternion={orientation}>
      <mesh>
        <sphereGeometry args={[0.014 * size, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.016 * size, 0.022 * size, 32]} />
        <meshBasicMaterial color={color} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Arc({ arc, accent, index }: { arc: GlobeArc; accent: ThemeColor; index: number }) {
  const line = React.useRef<{ material: { dashOffset: number } } | null>(null);
  const { scale } = useSceneMotion();
  const points = React.useMemo(() => {
    const a = latLngToVector3(arc.from.lat, arc.from.lng, 1.005);
    const b = latLngToVector3(arc.to.lat, arc.to.lng, 1.005);
    const lift = 1 + a.distanceTo(b) * 0.45;
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(lift);
    return new QuadraticBezierCurve3(a, mid, b).getPoints(64);
  }, [arc]);
  const color = React.useMemo(() => new Color().setRGB(...accent.rgb), [accent]);

  useFrame((_, delta) => {
    if (line.current) line.current.material.dashOffset -= delta * 0.35 * scale;
  });

  return (
    <group>
      <Line points={points} color={color} lineWidth={1} transparent opacity={0.35} toneMapped={false} />
      <Line
        ref={line as never}
        points={points}
        color={color}
        lineWidth={2.5}
        dashed
        dashScale={1}
        dashSize={0.35}
        gapSize={2.2}
        dashOffset={-index * 0.6}
        transparent
        opacity={0.95}
        toneMapped={false}
      />
    </group>
  );
}

function GlobeScene({
  points,
  arcs,
  autoRotate,
  dotCount,
  dots,
  accent,
  glow,
}: {
  points: GlobePoint[];
  arcs: GlobeArc[];
  autoRotate: boolean;
  dotCount: number;
  dots: string;
  accent: string;
  glow: string;
}) {
  const theme = useThemeColors([dots, accent, glow, "--background"]);
  const { scale } = useSceneMotion();
  const group = React.useRef<Group>(null);
  const dark = luminance(theme["--background"]!.rgb) < 0.2;
  const positions = React.useMemo(() => fibonacciSphere(dotCount, 1), [dotCount]);

  const dotUniforms = React.useMemo(
    () => ({ uColor: { value: new Color() }, uSize: { value: 2.2 }, uPixelRatio: { value: 1 }, uOpacity: { value: 1 } }),
    [],
  );
  const glowUniforms = React.useMemo(() => ({ uColor: { value: new Color() }, uStrength: { value: 1 } }), []);
  dotUniforms.uColor.value.setRGB(...theme[dots]!.rgb);
  dotUniforms.uPixelRatio.value = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;
  dotUniforms.uOpacity.value = dark ? 0.7 : 0.75;
  glowUniforms.uColor.value.setRGB(...theme[glow]!.rgb);
  glowUniforms.uStrength.value = dark ? 0.85 : 0.4;
  useInvalidateOn([theme, dark]);

  return (
    <>
      <group ref={group} rotation={[0.35, -1.2, 0]}>
        {/* invisible occluder: hides the far side of the dot sphere and lets the page show through */}
        <mesh renderOrder={0}>
          <sphereGeometry args={[0.99, 64, 64]} />
          <meshBasicMaterial colorWrite={false} />
        </mesh>
        <points renderOrder={1}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <shaderMaterial vertexShader={dotsVertex} fragmentShader={dotsFragment} uniforms={dotUniforms} transparent depthWrite={false} />
        </points>
        {points.map((p, i) => (
          <Marker key={`${p.lat},${p.lng},${i}`} point={p} accent={theme[accent]!} />
        ))}
        {arcs.map((a, i) => (
          <Arc key={i} arc={a} accent={theme[accent]!} index={i} />
        ))}
      </group>
      <mesh scale={1.12}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={glowUniforms}
          side={BackSide}
          transparent
          depthWrite={false}
          blending={dark ? AdditiveBlending : NormalBlending}
        />
      </mesh>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        autoRotate={autoRotate && scale > 0}
        autoRotateSpeed={0.5 * scale}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
    </>
  );
}

/**
 * An interactive dotted globe with location markers and animated connection arcs.
 * Screen readers get the label plus a list of every location and connection.
 */
export function Globe({
  points = sampleGlobeData.points,
  arcs = sampleGlobeData.arcs,
  label,
  autoRotate = true,
  interactive = true,
  dotCount = 2600,
  colors,
  ...frame
}: GlobeProps) {
  const named = points.filter((p) => p.label);
  const namedArcs = arcs.filter((a) => a.label);
  const description =
    named.length + namedArcs.length > 0 ? (
      <>
        {named.length > 0 && (
          <ul aria-label="Locations">
            {named.map((p, i) => (
              <li key={i}>{p.label}</li>
            ))}
          </ul>
        )}
        {namedArcs.length > 0 && (
          <ul aria-label="Connections">
            {namedArcs.map((a, i) => (
              <li key={i}>{a.label}</li>
            ))}
          </ul>
        )}
      </>
    ) : undefined;

  return (
    <JuncoCanvas
      camera={{ position: [0, 0, 3.1], fov: 45 }}
      interactive={interactive}
      label={label ?? `Globe showing ${points.length} locations and ${arcs.length} connections`}
      description={frame.description ?? description}
      className={frame.className}
      style={{ cursor: interactive ? "grab" : undefined, ...frame.style }}
    >
      <GlobeScene
        points={points}
        arcs={arcs}
        autoRotate={autoRotate}
        dotCount={dotCount}
        dots={colors?.dots ?? "--muted-foreground"}
        accent={colors?.accent ?? "--primary"}
        glow={colors?.glow ?? "--primary"}
      />
    </JuncoCanvas>
  );
}

export default Globe;
