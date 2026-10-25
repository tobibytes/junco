# @junco/three

3D scenes for Junco on React Three Fiber. Every scene:

- **Loads lazily.** The root entry never imports three.js. Scenes, three and R3F download only when a scene is near the screen on a device that can run it.
- **Follows your theme.** Colors come from Junco CSS variables (`--primary`, `--chart-2`, ...) at runtime, and the scene relights when the theme changes (`.dark`, `data-theme`, or the OS setting).
- **Follows motion settings.** `data-motion="subtle"` slows it down; `data-motion="off"` or `prefers-reduced-motion` freezes it on one still frame.
- **Costs nothing off screen.** Rendering switches to on-demand when the scene scrolls away.
- **Falls back cleanly.** Without WebGL, in data-saver mode, or if the scene fails, it shows a poster image, your own fallback, or a static gradient made from the same theme colors.

```bash
npm i @junco/three three @react-three/fiber @react-three/drei
```

## Usage

```tsx
// Lazy (recommended): import from the root
import { Globe, ParticleField, ShaderGradient, ModelViewer, TiltCard } from "@junco/three";

<section className="relative isolate h-[32rem]">
  <ShaderGradient className="absolute inset-0 -z-10" />
  <h1>Your headline</h1>
</section>

<Globe className="h-96" points={offices} arcs={routes} label="Our offices and the routes between them" />
```

```tsx
// Eager: import a subpath when the scene is above the fold and you want it in the main bundle
import { Globe } from "@junco/three/globe";
```

Size the scene with `className` (or `style`); it fills that box. Any class you pass wins over the defaults (they sit in a zero-specificity cascade layer).

### Lazy wrapper props (all lazy scenes, and `Scene3D`)

| Prop | Default | |
| --- | --- | --- |
| `fallback` | `poster`, else a theme gradient | Shown without WebGL, in data-saver mode, or if the scene fails |
| `loading` | the fallback | Shown while the scene downloads |
| `poster`, `alt` | | A still image fallback (a screenshot of the scene works well) |
| `reducedMotion` | `"freeze"` | `"freeze"` renders one still frame; `"fallback"` shows the fallback and never downloads three.js |
| `eager` | `false` | Load on mount instead of when near the screen |

`ModelViewer` defaults differ: it shows "Loading 3D model" while loading, and a short "isn't available on this device" note when it can't run, since a product model is content, not decoration.

### Your own scenes

```tsx
import { Scene3D, createLazyScene } from "@junco/three";

const loadMyScene = () => import("./my-scene"); // keep it at module scope
<Scene3D load={loadMyScene} props={{ speed: 2 }} className="h-80" />

// or build a reusable lazy component
export const MyScene = createLazyScene(loadMyScene, "MyScene");
```

Inside your scene, `useThemeColors(["--primary"])` gives live theme colors as linear RGB (`color.setRGB(...c.rgb)`), and `useMotion()` gives the motion level and its speed multiplier.

## Scenes

All WebGL scenes take `className`, `style`, `label` and `description`. Without a `label` a scene is decorative and hidden from screen readers; with one it is announced as an image, and `description` adds screen-reader-only detail.

### `ParticleField`

A slow, drifting field of soft particles for hero backgrounds.

| Prop | Default | |
| --- | --- | --- |
| `count` | `1400` | Halved on screens under 640px |
| `size` | `3` | Particle size multiplier |
| `speed` | `1` | Drift speed (multiplied by the motion setting) |
| `colors` | `["--primary", "--muted-foreground"]` | `[accent, base]`; about a quarter of the particles take the accent |
| `parallax` | `true` | Leans toward the pointer |

### `ShaderGradient`

A flowing mesh gradient built from your accent and chart colors.

| Prop | Default | |
| --- | --- | --- |
| `colors` | `["--primary", "--chart-2", "--chart-4"]` | Up to four theme variables |
| `base` | `"--background"` | The color the blobs sit on |
| `intensity` | `0.62` | How strongly blobs cover the base, 0..1 |
| `clearCenter` | `0.55` | Keeps the middle calm so headline text stays readable, 0..1 |
| `grain` | `0.02` | Film grain, hides banding |
| `speed` | `1` | |

### `Globe`

A dotted globe with location markers and animated connection arcs. Drag to rotate.

| Prop | Default | |
| --- | --- | --- |
| `points` | sample cities | `{ lat, lng, label?, size? }[]` |
| `arcs` | sample routes | `{ from: { lat, lng }, to: { lat, lng }, label? }[]` |
| `label` | counts of points and arcs | Screen readers also get a list of every labelled point and arc |
| `autoRotate` | `true` | Stops with motion off |
| `interactive` | `true` | Drag to rotate (vertical swipes still scroll the page on touch) |
| `dotCount` | `2600` | |
| `colors` | `{ dots: "--muted-foreground", accent: "--primary", glow: "--primary" }` | |

Also exported: `latLngToVector3`, `sampleGlobeData`.

### `ModelViewer`

Shows a GLB/GLTF model with orbit controls, a local studio light rig (nothing fetched from a CDN), a soft contact shadow, and hotspots.

| Prop | Default | |
| --- | --- | --- |
| `src` | required | `.glb` / `.gltf` URL |
| `label` | required | Describes the model for screen readers |
| `hotspots` | `[]` | `{ id, position: [x, y, z], label, content? }[]` in model space (centered, sitting on y = 0). Each is a real button: Tab to it, Enter to open, Esc to close |
| `onHotspotChange` | | `(id \| null) => void` |
| `autoRotate`, `autoRotateSpeed` | `true`, `1` | Pauses while a hotspot is open and with motion off |
| `enableZoom` | `false` | Off so the page scrolls normally over the model |
| `shadows` | `true` | |
| `cameraPosition` | `[2.2, 2.4, 3.2]` | Direction to view from; distance is fitted to the model |

Also exported: `preloadModel(src)` to start downloading early (e.g. on hover of a link).

### `TiltCard`

A card that tilts toward the pointer. Pure CSS transforms, no WebGL, and no three.js needed (`@junco/three/tilt-card` or the root).

| Prop | Default | |
| --- | --- | --- |
| `maxTilt` | `8` | Degrees |
| `glare` | `true` | A soft light that follows the pointer |
| `hoverScale` | `1.015` | |
| `perspective` | `900` | px |

The tilt is multiplied by `--motion-scale`, so `data-motion="subtle"` softens it and `"off"` keeps it flat. Touch never tilts.

## Sizes

Published ESM (not minified; your bundler minifies it), excluding peers (react, three, @react-three/*):

| Entry | Size |
| --- | --- |
| root (`Scene3D`, lazy scenes, `TiltCard`, hooks), incl. shared chunks | ~15 KB |
| `particle-field` | ~6 KB + 2.5 KB shared canvas |
| `shader-gradient` | ~5 KB + 2.5 KB shared canvas |
| `globe` | ~10 KB + 2.5 KB shared canvas |
| `model-viewer` | ~8 KB + 2.5 KB shared canvas |

three.js + React Three Fiber add roughly 250 KB gzipped, loaded only with the first scene.
