import { Badge, Button, useTheme, type Motion, type Theme } from "junco";
import { Globe, ModelViewer, ParticleField, ShaderGradient, TiltCard } from "@junco/three";

const themes: Theme[] = ["light", "dark"];
const motions: Motion[] = ["full", "subtle", "off"];

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-control border border-border bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o}
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className="h-7 rounded-xs px-2.5 text-xs font-medium text-muted-foreground capitalize hover:text-foreground aria-checked:bg-accent aria-checked:text-foreground"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Panel({ title, note, children, className = "" }: { title: string; note: string; children: React.ReactNode; className?: string }) {
  return (
    <section className="overflow-hidden rounded-card border border-border bg-card">
      <div className={`relative ${className}`}>{children}</div>
      <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
    </section>
  );
}

const hotspots = [
  { id: "ring", position: [0.3, 1.84, 0.3] as [number, number, number], label: "Ring light", content: "Glows in your accent color while it listens." },
  { id: "fabric", position: [0, 0.95, 0.67] as [number, number, number], label: "Acoustic fabric", content: "Recycled knit, tuned for 360° sound." },
  { id: "base", position: [0.6, 0.06, 0] as [number, number, number], label: "Aluminum base", content: "Weighted so it never tips." },
];

const features = [
  { title: "Theme aware", body: "Scenes read Junco tokens at runtime and relight when you switch modes." },
  { title: "Motion aware", body: "data-motion and reduced motion slow or freeze every scene." },
  { title: "Lazy by default", body: "three.js loads only when a scene scrolls near the screen." },
];

export function App() {
  const { resolvedTheme, setTheme, motion, setMotion } = useTheme();
  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">@junco/three</h1>
          <p className="mt-1 text-sm text-muted-foreground">3D scenes that follow your theme and motion settings.</p>
        </div>
        <div className="flex gap-2">
          <Segmented label="Theme" options={themes} value={resolvedTheme} onChange={setTheme} />
          <Segmented label="Motion" options={motions} value={motion} onChange={setMotion} />
        </div>
      </header>

      <section className="relative isolate overflow-hidden rounded-card border border-border">
        <ShaderGradient className="absolute inset-0 -z-10" eager />
        <div className="grid min-h-80 place-items-center px-6 py-16 text-center">
          <div className="max-w-xl">
            <Badge variant="outline" className="bg-background/60 backdrop-blur">ShaderGradient</Badge>
            <h2 className="mt-4 text-4xl font-semibold tracking-tighter text-balance">Ship the hero section in an afternoon</h2>
            <p className="mt-3 text-base text-muted-foreground">A flowing mesh gradient built from your accent and chart colors.</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button size="lg">Get started</Button>
              <Button size="lg" variant="outline" className="bg-background/60 backdrop-blur">
                View docs
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="ParticleField" note="Hero background" className="h-80">
          <ParticleField className="absolute inset-0" />
          <div className="pointer-events-none relative grid h-full place-items-center">
            <p className="text-3xl font-semibold tracking-tight">Build something calm.</p>
          </div>
        </Panel>
        <Panel title="Globe" note="Drag to rotate" className="h-80">
          <Globe className="absolute inset-0" />
        </Panel>
      </div>

      <Panel title="ModelViewer" note="Drag to orbit, open the hotspots" className="h-[28rem]">
        <ModelViewer className="absolute inset-0" src="/speaker.glb" label="Junco smart speaker in charcoal fabric" hotspots={hotspots} />
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <TiltCard key={f.title} className="rounded-card border border-border bg-card p-5">
            <h3 className="text-sm font-medium">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
          </TiltCard>
        ))}
      </div>
    </main>
  );
}
