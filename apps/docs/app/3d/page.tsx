import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { DataTable, Note } from "@/components/docs/prose";
import { MotionBar } from "@/components/three/motion-bar";
import { GlobeDemo, ModelViewerDemo, ParticleFieldDemo, ShaderGradientDemo, TiltCardDemo } from "@/components/three/three-demos";

export const metadata: Metadata = {
  title: "3D",
  description: "Lazy-loaded 3D scenes on React Three Fiber: shader gradient, particle field, globe, model viewer and tilt card. Theme and motion aware, with clean fallbacks.",
};

const code = (s: string) => (
  <code key={s} className="font-mono text-xs">
    {s}
  </code>
);

function Scene({
  id,
  title,
  description,
  usage,
  props,
  children,
}: {
  id: string;
  title: string;
  description: string;
  usage: string;
  props: [string, string, string][];
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-32 grid-cols-[minmax(0,1fr)] gap-4">
      <div className="grid max-w-3xl gap-1">
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      {children}
      <div className="grid gap-4 lg:grid-cols-2">
        <CodeBlock code={usage} />
        <DataTable head={["Prop", "Default", ""]} rows={props.map(([p, d, n]) => [code(p), d ? code(d) : "", n])} />
      </div>
    </section>
  );
}

export default function ThreePage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
      <header className="grid max-w-3xl gap-3">
        <p className="text-sm font-medium text-primary">@junco/three</p>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">3D</h1>
        <p className="text-base text-pretty text-muted-foreground">
          Scenes on React Three Fiber that read your theme tokens at runtime and relight when you switch modes. Each one loads
          lazily, pauses when it scrolls away, follows the motion switch, and falls back to a still gradient or poster
          without WebGL.
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CodeBlock lang="bash" title="Install" code="npm i @junco/three three @react-three/fiber @react-three/drei" />
        <CodeBlock
          title="Lazy by default"
          code={`// The root entry never imports three.js. Scenes download near the screen.
import { Globe, ShaderGradient } from "@junco/three";

// Or load one eagerly, for an above-the-fold hero:
import { ShaderGradient } from "@junco/three/shader-gradient";`}
        />
      </div>

      <div className="mt-10">
        <MotionBar note="Switch the theme to watch the scenes relight; motion off freezes them." />
      </div>

      <div className="mt-10 grid gap-16">
        <Scene
          id="shader-gradient"
          title="Shader gradient"
          description="A flowing mesh gradient built from your accent and chart colors, with a calm center so headlines stay readable."
          usage={`<section className="relative isolate">
  <ShaderGradient className="absolute inset-0 -z-10" />
  <h1>Your headline</h1>
</section>`}
          props={[
            ["colors", '["--primary", "--chart-2", "--chart-4"]', "Up to four theme variables"],
            ["base", '"--background"', "The color the blobs sit on"],
            ["intensity", "0.62", "How strongly blobs cover the base, 0..1"],
            ["clearCenter", "0.55", "Keeps the middle calm for text, 0..1"],
            ["speed", "1", "Multiplied by the motion setting"],
          ]}
        >
          <ShaderGradientDemo />
        </Scene>

        <Scene
          id="particle-field"
          title="Particle field"
          description="A slow, drifting field of soft particles for hero backgrounds. A quarter take your accent color."
          usage={`<div className="relative h-80">
  <ParticleField className="absolute inset-0" />
</div>`}
          props={[
            ["count", "1400", "Halved on screens under 640px"],
            ["size", "3", "Particle size multiplier"],
            ["speed", "1", "Drift speed"],
            ["colors", '["--primary", "--muted-foreground"]', "[accent, base]"],
            ["parallax", "true", "Leans toward the pointer"],
          ]}
        >
          <ParticleFieldDemo />
        </Scene>

        <Scene
          id="globe"
          title="Globe"
          description="A dotted globe with location markers and animated arcs. Drag to rotate. Screen readers get the list of places and routes."
          usage={`<Globe
  className="h-96"
  points={[{ lat: 39.3, lng: -76.6, label: "Baltimore" }]}
  arcs={[{ from: { lat: 39.3, lng: -76.6 }, to: { lat: 47.6, lng: -122.3 } }]}
  label="Our offices and the routes between them"
/>`}
          props={[
            ["points", "sample cities", "{ lat, lng, label?, size? }[]"],
            ["arcs", "sample routes", "{ from, to, label? }[]"],
            ["label", "", "Announces it as an image, with a list of places"],
            ["autoRotate", "true", "Stops with motion off"],
            ["interactive", "true", "Drag to rotate"],
          ]}
        >
          <GlobeDemo />
        </Scene>

        <Scene
          id="model-viewer"
          title="Model viewer"
          description="A GLB/GLTF model with orbit controls, a local studio light rig and hotspots that are real buttons: Tab to them, Enter to open, Esc to close."
          usage={`<ModelViewer
  className="h-[28rem]"
  src="/speaker.glb"
  label="A smart speaker in charcoal fabric"
  hotspots={[{ id: "ring", position: [0.3, 1.84, 0.3], label: "Ring light", content: "Glows in your accent color." }]}
/>`}
          props={[
            ["src", "", "Required. .glb or .gltf URL"],
            ["label", "", "Required. Describes the model"],
            ["hotspots", "[]", "{ id, position, label, content? }[]"],
            ["autoRotate", "true", "Pauses on a hotspot and with motion off"],
            ["enableZoom", "false", "So the page scrolls over the model"],
          ]}
        >
          <ModelViewerDemo />
        </Scene>

        <Scene
          id="tilt-card"
          title="Tilt card"
          description="A card that tilts toward the pointer, with a soft glare. Pure CSS transforms: no WebGL and no three.js. Touch never tilts."
          usage={`import { TiltCard } from "@junco/three/tilt-card";

<TiltCard className="rounded-card border p-5">…</TiltCard>`}
          props={[
            ["maxTilt", "8", "Degrees, multiplied by --motion-scale"],
            ["glare", "true", "A light that follows the pointer"],
            ["hoverScale", "1.015", ""],
            ["perspective", "900", "px"],
          ]}
        >
          <TiltCardDemo />
        </Scene>

        <section aria-labelledby="size" className="grid max-w-3xl gap-4">
          <h2 id="size" className="scroll-mt-32 text-xl font-semibold tracking-tight">
            Size and fallbacks
          </h2>
          <DataTable
            head={["Entry", "Size (not minified, peers excluded)"]}
            rows={[
              [code("@junco/three"), "~15 KB: Scene3D, lazy scenes, TiltCard, hooks"],
              [code("particle-field / shader-gradient"), "~5 to 6 KB each + 2.5 KB shared canvas"],
              [code("globe / model-viewer"), "~8 to 10 KB each + 2.5 KB shared canvas"],
              ["three.js + React Three Fiber", "~250 KB gzipped, loaded once with the first scene"],
            ]}
          />
          <Note title="When a scene can't run">
            Without WebGL, in data-saver mode, or if loading fails, every scene shows its <code className="font-mono">poster</code>,
            your own <code className="font-mono">fallback</code>, or a still gradient made from the same theme colors. With
            reduced motion it renders one frozen frame, or pass <code className="font-mono">reducedMotion=&quot;fallback&quot;</code>{" "}
            to skip downloading three.js entirely.
          </Note>
        </section>
      </div>
    </div>
  );
}
