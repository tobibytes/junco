"use client";

import { Globe, ModelViewer, ParticleField, ShaderGradient, TiltCard } from "@junco/three";
import { Button } from "@junco/react";
import { cn } from "@/lib/cn";

/** The live scenes for /3d. Each one is lazy: three.js downloads when the first scene nears the screen. */

function Stage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative isolate overflow-hidden rounded-card border border-border bg-background", className)}>{children}</div>;
}

export function ShaderGradientDemo() {
  return (
    <Stage>
      <ShaderGradient className="absolute inset-0 -z-10" />
      <div className="grid min-h-80 place-items-center px-6 py-16 text-center">
        <div className="max-w-lg">
          <p className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Ship the hero in an afternoon</p>
          <p className="mt-3 text-sm text-muted-foreground">A flowing mesh gradient from your accent and chart colors.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button>Get started</Button>
            <Button variant="outline" className="bg-background/60 backdrop-blur">
              View docs
            </Button>
          </div>
        </div>
      </div>
    </Stage>
  );
}

export function ParticleFieldDemo() {
  return (
    <Stage className="h-80">
      <ParticleField className="absolute inset-0" />
      <div className="pointer-events-none relative grid h-full place-items-center px-6 text-center">
        <p className="text-3xl font-semibold tracking-tight">Build something calm.</p>
      </div>
    </Stage>
  );
}

export function GlobeDemo() {
  return (
    <Stage className="h-96">
      <Globe className="absolute inset-0" label="Junco's sample offices and the routes between them" />
    </Stage>
  );
}

const hotspots = [
  { id: "ring", position: [0.3, 1.84, 0.3] as [number, number, number], label: "Ring light", content: "Glows in your accent color while it listens." },
  { id: "fabric", position: [0, 0.95, 0.67] as [number, number, number], label: "Acoustic fabric", content: "Recycled knit, tuned for 360° sound." },
  { id: "base", position: [0.6, 0.06, 0] as [number, number, number], label: "Aluminum base", content: "Weighted so it never tips." },
];

export function ModelViewerDemo() {
  return (
    <Stage className="h-[28rem]">
      <ModelViewer className="absolute inset-0" src="/speaker.glb" label="A smart speaker in charcoal fabric" hotspots={hotspots} />
    </Stage>
  );
}

export function TiltCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        ["Theme aware", "Scenes read Junco tokens at runtime and relight when you switch modes."],
        ["Motion aware", "data-motion and reduced motion slow or freeze every scene."],
        ["Lazy by default", "three.js loads only when a scene scrolls near the screen."],
      ].map(([title, body]) => (
        <TiltCard key={title} className="rounded-card border border-border bg-card p-5">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
        </TiltCard>
      ))}
    </div>
  );
}
