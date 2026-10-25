/**
 * @junco/three
 *
 * The root entry never imports three.js. Its scene components are lazy: three, React Three Fiber
 * and the scene code download only when a scene is near the screen on a device that can run it.
 * Import a subpath (`@junco/three/globe`) instead to get a scene eagerly.
 */
import type { GlobeProps } from "./scenes/globe";
import type { ModelViewerProps } from "./scenes/model-viewer";
import type { ParticleFieldProps } from "./scenes/particle-field";
import type { ShaderGradientProps } from "./scenes/shader-gradient";
import { createLazyScene, LoadingFallback, UnavailableFallback } from "./lib/scene-3d";

export { Scene3D, StaticGradient, LoadingFallback, UnavailableFallback, createLazyScene, type Scene3DFrameProps, type Scene3DProps } from "./lib/scene-3d";
export { TiltCard, type TiltCardProps } from "./tilt-card";
export { parseCssColor, readThemeColors, subscribeToTheme, useThemeColors, type ThemeColor } from "./lib/theme-colors";
export { hasWebGL, isLowPower, readMotion, useInView, useMotion, type MotionLevel } from "./lib/environment";

export const ParticleField = createLazyScene<ParticleFieldProps>(() => import("./particle-field"), "ParticleField");
export const ShaderGradient = createLazyScene<ShaderGradientProps>(() => import("./shader-gradient"), "ShaderGradient");
export const Globe = createLazyScene<GlobeProps>(() => import("./globe"), "Globe");
export const ModelViewer = createLazyScene<ModelViewerProps>(
  () => import("./model-viewer"),
  "ModelViewer",
  { loading: <LoadingFallback label="Loading 3D model" />, fallback: <UnavailableFallback /> },
);

export type { GlobeArc, GlobePoint, GlobeProps } from "./scenes/globe";
export type { ModelHotspot, ModelViewerProps } from "./scenes/model-viewer";
export type { ParticleFieldProps } from "./scenes/particle-field";
export type { ShaderGradientProps } from "./scenes/shader-gradient";
