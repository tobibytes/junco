import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Color, NormalBlending, type Points, type ShaderMaterial } from "three";
import { JuncoCanvas, useInvalidateOn, useSceneMotion, type SceneFrameProps } from "../lib/canvas";
import { useThemeColors } from "../lib/theme-colors";

export interface ParticleFieldProps extends SceneFrameProps {
  /** Number of particles. Default 1400 (halved on small screens). */
  count?: number;
  /** Particle size multiplier. Default 3. */
  size?: number;
  /** Drift speed multiplier. Default 1. Scaled down further by the motion setting. */
  speed?: number;
  /** [accent, base] theme variables. About a quarter of the particles take the accent. Default ["--primary", "--muted-foreground"]. */
  colors?: [string, string];
  /** Particles lean toward the pointer. Default true. */
  parallax?: boolean;
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vMix;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float t = uTime * 0.12 + aSeed * 6.2831;
    // slow looping drift, different per particle
    p.x += sin(t + p.y * 0.6) * 0.18;
    p.y += cos(t * 0.8 + p.x * 0.5) * 0.18;
    p.z += sin(t * 0.6 + p.x * 0.3) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    // capped so particles drifting close to the camera never balloon into blurry discs
    gl_PointSize = min(uSize * uPixelRatio * (11.0 / depth) * (0.5 + aSeed * aSeed), 9.0 * uPixelRatio);
    vMix = aSeed;
    // fade the nearest and farthest particles so the field has depth without hard edges
    vAlpha = smoothstep(14.0, 7.0, depth) * smoothstep(1.0, 3.0, depth) * (0.35 + 0.65 * fract(aSeed * 7.13));
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vMix;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    // a crisp core with a soft falloff reads as a point of light rather than a blurry blob
    float soft = smoothstep(0.5, 0.15, d);
    vec3 color = mix(uColorB, uColorA, step(0.74, vMix));
    gl_FragColor = vec4(color, soft * vAlpha * uOpacity);
    #include <colorspace_fragment>
  }
`;

function Field({ count, size, speed, colors, parallax }: Required<Omit<ParticleFieldProps, keyof SceneFrameProps>>) {
  const theme = useThemeColors([colors[0], colors[1], "--background"]);
  const { scale } = useSceneMotion();
  const viewportWidth = useThree((s) => s.size.width);
  const dpr = useThree((s) => s.viewport.dpr);
  const points = React.useRef<Points>(null);
  const material = React.useRef<ShaderMaterial>(null);
  const n = viewportWidth < 640 ? Math.round(count / 2) : count;

  const [positions, seeds] = React.useMemo(() => {
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    let s = 1;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rand() - 0.5) * 16;
      pos[i * 3 + 1] = (rand() - 0.5) * 9;
      pos[i * 3 + 2] = (rand() - 0.5) * 10;
      seed[i] = rand();
    }
    return [pos, seed];
  }, [n]);

  // dark backgrounds glow with additive light; on light backgrounds that would vanish, so blend normally
  const bg = theme["--background"]!.rgb;
  const isDark = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2] < 0.2;

  // biome-ignore lint/correctness/useExhaustiveDependencies: created once; the values are updated in place every render
  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: dpr },
      uColorA: { value: new Color() },
      uColorB: { value: new Color() },
      uOpacity: { value: 1 },
    }),
    [],
  );
  uniforms.uSize.value = size;
  uniforms.uPixelRatio.value = dpr;
  uniforms.uColorA.value.setRGB(...theme[colors[0]]!.rgb);
  uniforms.uColorB.value.setRGB(...theme[colors[1]]!.rgb);
  uniforms.uOpacity.value = isDark ? 0.9 : 0.75;
  useInvalidateOn([theme, isDark, size, dpr]);

  // background canvases don't take pointer events, so follow the pointer at the window level
  const target = React.useRef({ x: 0, y: 0 });
  React.useEffect(() => {
    if (!parallax) return;
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [parallax]);

  const pointer = React.useRef({ x: 0, y: 0 });
  useFrame((_, delta) => {
    uniforms.uTime.value += delta * speed * scale;
    if (!points.current) return;
    const goal = parallax ? target.current : { x: 0, y: 0 };
    pointer.current.x += (goal.x - pointer.current.x) * Math.min(1, delta * 2);
    pointer.current.y += (goal.y - pointer.current.y) * Math.min(1, delta * 2);
    points.current.rotation.y = pointer.current.x * 0.08 * scale + uniforms.uTime.value * 0.02;
    points.current.rotation.x = -pointer.current.y * 0.05 * scale;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={isDark ? AdditiveBlending : NormalBlending}
      />
    </points>
  );
}

/**
 * A slow, drifting field of soft particles for hero backgrounds. Decorative by default.
 * Colors come from the theme and update with dark mode.
 */
export function ParticleField({
  count = 1400,
  size = 3,
  speed = 1,
  colors = ["--primary", "--muted-foreground"],
  parallax = true,
  ...frame
}: ParticleFieldProps) {
  return (
    <JuncoCanvas camera={{ position: [0, 0, 7], fov: 60 }} {...frame}>
      <Field count={count} size={size} speed={speed} colors={colors} parallax={parallax} />
    </JuncoCanvas>
  );
}

export default ParticleField;
