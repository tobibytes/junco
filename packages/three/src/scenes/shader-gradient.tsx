import * as React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Vector2 } from "three";
import { JuncoCanvas, useInvalidateOn, useSceneMotion, type SceneFrameProps } from "../lib/canvas";
import { useThemeColors } from "../lib/theme-colors";

export interface ShaderGradientProps extends SceneFrameProps {
  /** Up to four theme variables that form the blobs. Default ["--primary", "--chart-2", "--chart-4"]. */
  colors?: string[];
  /** The canvas color the blobs sit on. Default "--background". */
  base?: string;
  /** Flow speed multiplier. Default 1. */
  speed?: number;
  /** How strongly the blobs cover the base, 0..1. Default 0.62. */
  intensity?: number;
  /** Film grain amount, 0..0.15. Default 0.02. A touch of grain hides banding on large gradients. */
  grain?: number;
  /**
   * Keeps the middle calmer so headline text stays readable, 0..1. Default 0.55.
   * Set 0 for an even gradient.
   */
  clearCenter?: number;
}

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uBase;
  uniform vec3 uColors[4];
  uniform int uCount;
  uniform float uIntensity;
  uniform float uGrain;
  uniform float uClear;
  varying vec2 vUv;

  // 2D simplex noise (Ashima Arts, MIT)
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
    float t = uTime * 0.06;

    // warp the space with noise so the blobs flow like liquid instead of sliding
    vec2 w = p + 0.28 * vec2(snoise(p * 1.4 + vec2(t, -t)), snoise(p * 1.4 + vec2(-t + 3.7, t + 1.3)));

    // blobs fade near the center (stretched to the aspect) so text placed there stays legible
    float calm = mix(1.0, smoothstep(0.08, 0.62, length(vec2(p.x / max(aspect, 1.0), p.y) * vec2(1.0, 1.25))), uClear);

    vec3 color = uBase;
    for (int i = 0; i < 4; i++) {
      if (i >= uCount) break;
      float fi = float(i);
      vec2 center = vec2(
        (0.55 * aspect) * sin(t * (0.9 + fi * 0.23) + fi * 1.9),
        0.38 * cos(t * (0.7 + fi * 0.19) + fi * 2.7)
      );
      float d = length(w - center);
      float weight = smoothstep(1.05, 0.0, d) * uIntensity * calm;
      color = mix(color, uColors[i], weight * weight * (3.0 - 2.0 * weight));
    }

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
    // grain after the color space conversion so it is perceptually even
    gl_FragColor.rgb += (hash(gl_FragCoord.xy + fract(uTime * 0.37) * 91.0) - 0.5) * uGrain;
  }
`;

function Gradient({
  colors,
  base,
  speed,
  intensity,
  grain,
  clearCenter,
}: Required<Omit<ShaderGradientProps, keyof SceneFrameProps>>) {
  const names = React.useMemo(() => [base, ...colors.slice(0, 4)], [base, colors]);
  const theme = useThemeColors(names);
  const { scale } = useSceneMotion();
  const size = useThree((s) => s.size);

  // biome-ignore lint/correctness/useExhaustiveDependencies: created once; the values are updated in place every render
  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 8 },
      uRes: { value: new Vector2(1, 1) },
      uBase: { value: new Color() },
      uColors: { value: [new Color(), new Color(), new Color(), new Color()] },
      uCount: { value: 0 },
      uIntensity: { value: intensity },
      uGrain: { value: grain },
      uClear: { value: clearCenter },
    }),
    [],
  );
  uniforms.uRes.value.set(size.width, size.height);
  uniforms.uBase.value.setRGB(...theme[base]!.rgb);
  colors.slice(0, 4).forEach((name, i) => {
    uniforms.uColors.value[i]!.setRGB(...theme[name]!.rgb);
  });
  uniforms.uCount.value = Math.min(colors.length, 4);
  uniforms.uIntensity.value = intensity;
  uniforms.uGrain.value = grain;
  uniforms.uClear.value = clearCenter;
  useInvalidateOn([theme, size.width, size.height, intensity, grain, clearCenter]);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta * speed * scale;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/**
 * A slowly flowing mesh gradient built from the theme's accent and chart colors. Made for hero
 * backgrounds; put content on top with enough contrast. Decorative by default.
 */
export function ShaderGradient({
  colors = ["--primary", "--chart-2", "--chart-4"],
  base = "--background",
  speed = 1,
  intensity = 0.62,
  grain = 0.02,
  clearCenter = 0.55,
  ...frame
}: ShaderGradientProps) {
  return (
    <JuncoCanvas {...frame}>
      <Gradient colors={colors} base={base} speed={speed} intensity={intensity} grain={grain} clearCenter={clearCenter} />
    </JuncoCanvas>
  );
}

export default ShaderGradient;
