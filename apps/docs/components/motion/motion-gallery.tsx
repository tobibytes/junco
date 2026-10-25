"use client";

import {
  AnimatedBeam,
  BorderBeam,
  confetti,
  GradientBorder,
  MagneticButton,
  Marquee,
  NumberTicker,
  Reveal,
  ShimmerText,
  SpotlightCard,
  TextReveal,
  Typewriter,
  useViewTransition,
} from "@junco/motion";
import { Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger, useTheme } from "@junco/react";
import * as React from "react";
import { cn } from "@/lib/cn";
import { CodeBlock } from "../code-block";
import { RefreshIcon } from "../icons";
import { MotionSegmented } from "../theme-controls";

/* -------------------------------------------------------------- demo shell */

function Demo({
  id,
  title,
  description,
  code,
  children,
  className,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  code: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-32 grid-cols-[minmax(0,1fr)] content-start gap-3">
      <div className="grid gap-1">
        <h2 id={`${id}-title`} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Tabs defaultValue="preview">
        <TabsList aria-label={`${title} example`}>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-3">
          <div
            className={cn(
              "preview-canvas relative grid min-h-56 place-items-center overflow-hidden rounded-card border border-border p-6",
              className,
            )}
          >
            {children}
          </div>
        </TabsContent>
        <TabsContent value="code" className="mt-3">
          <CodeBlock code={code} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

/* -------------------------------------------------------------- demos */

function BeamDemo() {
  const container = React.useRef<HTMLDivElement>(null);
  const a = React.useRef<HTMLDivElement>(null);
  const b = React.useRef<HTMLDivElement>(null);
  const c = React.useRef<HTMLDivElement>(null);
  const hub = React.useRef<HTMLDivElement>(null);
  const node = "relative z-10 grid size-12 place-items-center rounded-pill border border-border bg-surface text-xs font-medium shadow-float";
  return (
    <div ref={container} className="relative flex w-full max-w-md items-center justify-between">
      <div className="grid gap-6">
        <div ref={a} className={node}>
          Git
        </div>
        <div ref={b} className={node}>
          CI
        </div>
        <div ref={c} className={node}>
          Docs
        </div>
      </div>
      <div ref={hub} className={cn(node, "size-16 bg-primary text-primary-foreground")}>
        Junco
      </div>
      <AnimatedBeam containerRef={container} fromRef={a} toRef={hub} curvature={-40} />
      <AnimatedBeam containerRef={container} fromRef={b} toRef={hub} delay={0.6} />
      <AnimatedBeam containerRef={container} fromRef={c} toRef={hub} curvature={40} delay={1.2} />
    </div>
  );
}

function ViewTransitionDemo() {
  const transition = useViewTransition();
  const [grid, setGrid] = React.useState(true);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Button variant="outline" size="sm" className="justify-self-start" onClick={() => transition(() => setGrid((g) => !g))}>
        Switch to {grid ? "list" : "grid"}
      </Button>
      <ul className={cn("gap-2", grid ? "grid grid-cols-3" : "grid")}>
        {["Inbox", "Drafts", "Sent"].map((label, i) => (
          <li
            key={label}
            style={{ viewTransitionName: `vt-item-${i}` }}
            className={cn("rounded-control border border-border bg-surface p-3 text-sm", grid && "aspect-square")}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfettiDemo() {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <Button ref={ref} onClick={() => confetti({ from: ref.current })}>
      Celebrate
    </Button>
  );
}

/* -------------------------------------------------------------- page */

const toc = [
  ["reveal", "Reveal"],
  ["text-reveal", "Text reveal"],
  ["number-ticker", "Number ticker"],
  ["typewriter", "Typewriter"],
  ["marquee", "Marquee"],
  ["shimmer", "Shimmer text"],
  ["beam", "Animated beam"],
  ["spotlight", "Spotlight card"],
  ["magnetic", "Magnetic button"],
  ["borders", "Border beam and gradient border"],
  ["confetti", "Confetti"],
  ["view-transitions", "View transitions"],
] as const;

export function MotionGallery() {
  const { motion } = useTheme();
  // Remounting replays entrance effects (reveal, text reveal, tickers, typewriter).
  const [run, setRun] = React.useState(0);

  return (
    <div className="grid gap-10">
      <div className="sticky top-14 z-sticky -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" id="motion-switch-label">
            Motion
          </span>
          <MotionSegmented />
          <Badge variant="outline" className="hidden font-mono sm:inline-flex">
            data-motion=&quot;{motion}&quot;
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRun((r) => r + 1)}>
          <RefreshIcon width={14} height={14} /> Replay
        </Button>
      </div>

      <nav aria-label="Effects" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {toc.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {label}
          </a>
        ))}
      </nav>

      <div key={run} className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-2 lg:gap-x-10">
        <Demo
          id="reveal"
          title="Reveal"
          description="Fades and rises in when it scrolls into view. stagger reveals children one after another by the --stagger token."
          code={`import { Reveal } from "@junco/motion";

<Reveal stagger className="grid grid-cols-3 gap-3">
  <Card>Plan</Card>
  <Card>Build</Card>
  <Card>Ship</Card>
</Reveal>`}
        >
          <Reveal stagger className="grid w-full max-w-sm grid-cols-3 gap-3">
            {["Plan", "Build", "Ship"].map((s) => (
              <div key={s} className="grid aspect-square place-items-center rounded-card border border-border bg-surface text-sm font-medium">
                {s}
              </div>
            ))}
          </Reveal>
        </Demo>

        <Demo
          id="text-reveal"
          title="Text reveal"
          description="Words (or characters) rise in one after another. Screen readers get the whole sentence at once."
          code={`import { TextReveal } from "@junco/motion";

<TextReveal as="h2" className="text-3xl font-semibold">
  Design that ships itself
</TextReveal>`}
        >
          <TextReveal as="p" className="text-center text-3xl font-semibold tracking-tight text-balance">
            Design that ships itself
          </TextReveal>
        </Demo>

        <Demo
          id="number-ticker"
          title="Number ticker"
          description="Counts up when visible, with tabular numbers. The final value is what assistive tech reads, from the start."
          code={`import { NumberTicker } from "@junco/motion";

<NumberTicker value={48210} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
<NumberTicker value={99.98} format={(n) => \`\${n.toFixed(2)}%\`} />`}
        >
          <div className="grid w-full grid-cols-3 gap-4 text-center">
            <div className="grid gap-1">
              <NumberTicker value={48210} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} className="text-2xl font-semibold" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="grid gap-1">
              <NumberTicker value={2914} className="text-2xl font-semibold" />
              <span className="text-xs text-muted-foreground">Users</span>
            </div>
            <div className="grid gap-1">
              <NumberTicker value={99.98} format={(n) => `${n.toFixed(2)}%`} className="text-2xl font-semibold" />
              <span className="text-xs text-muted-foreground">Uptime</span>
            </div>
          </div>
        </Demo>

        <Demo
          id="typewriter"
          title="Typewriter"
          description="Types, pauses, erases and cycles through words. With motion off it shows the first word."
          code={`import { Typewriter } from "@junco/motion";

<h2>
  Build your <Typewriter words={["dashboard", "landing page", "design system"]} />
</h2>`}
        >
          <p className="text-2xl font-semibold tracking-tight">
            Build your <Typewriter words={["dashboard", "landing page", "design system"]} className="text-primary" />
          </p>
        </Demo>

        <Demo
          id="marquee"
          title="Marquee"
          description="An endless scroll that pauses on hover and focus. Copies are hidden from screen readers; with motion off it wraps into one still row."
          code={`import { Marquee } from "@junco/motion";

<Marquee duration={30}>
  {logos.map((name) => <Logo key={name} name={name} />)}
</Marquee>`}
          className="px-0"
        >
          <Marquee duration={24} className="w-full">
            {["Northwind", "Globex", "Initech", "Umbrella", "Hooli", "Stark Labs", "Pied Piper"].map((n) => (
              <span key={n} className="text-lg font-semibold tracking-tight text-muted-foreground">
                {n}
              </span>
            ))}
          </Marquee>
        </Demo>

        <Demo
          id="shimmer"
          title="Shimmer text"
          description="A light sweep across text, for things like “Thinking…”. Plain text with motion off."
          code={`import { ShimmerText } from "@junco/motion";

<ShimmerText>Generating your report…</ShimmerText>

{/* or pure CSS */}
<span class="shimmer">Generating your report…</span>`}
        >
          <ShimmerText className="text-lg font-medium">Generating your report…</ShimmerText>
        </Demo>

        <Demo
          id="beam"
          title="Animated beam"
          description="A light that travels an SVG path between two elements. Recomputes on resize."
          code={`import { AnimatedBeam } from "@junco/motion";

const container = useRef(null), from = useRef(null), to = useRef(null);

<div ref={container} className="relative flex justify-between">
  <Node ref={from} />
  <Node ref={to} />
  <AnimatedBeam containerRef={container} fromRef={from} toRef={to} curvature={-40} />
</div>`}
        >
          <BeamDemo />
        </Demo>

        <Demo
          id="spotlight"
          title="Spotlight card"
          description="A soft light follows the pointer across the card and its border."
          code={`import { SpotlightCard } from "@junco/motion";

<SpotlightCard className="rounded-card border p-6">
  <h3>Realtime sync</h3>
  <p>Changes show up everywhere, instantly.</p>
</SpotlightCard>`}
        >
          <SpotlightCard className="w-full max-w-xs rounded-card border border-border bg-card p-6">
            <p className="font-medium">Realtime sync</p>
            <p className="mt-1 text-sm text-muted-foreground">Move your pointer over this card.</p>
          </SpotlightCard>
        </Demo>

        <Demo
          id="magnetic"
          title="Magnetic button"
          description="A Junco Button that leans toward the pointer. Still with motion off, and for touch."
          code={`import { MagneticButton } from "@junco/motion";

<MagneticButton strength={0.3}>Get started</MagneticButton>`}
        >
          <MagneticButton strength={0.3} size="lg">
            Get started
          </MagneticButton>
        </Demo>

        <Demo
          id="borders"
          title="Border beam and gradient border"
          description="A light running around a rounded border, and a slowly turning gradient border in the chart palette."
          code={`import { BorderBeam, GradientBorder } from "@junco/motion";

<div className="relative rounded-card border p-6">
  New in v2
  <BorderBeam />
</div>

<GradientBorder className="p-6">Pro plan</GradientBorder>

{/* or pure CSS */}
<div class="relative rounded-card border"><span class="border-beam"></span></div>
<div class="gradient-border rounded-card">…</div>`}
        >
          <div className="grid w-full max-w-sm grid-cols-2 gap-4">
            <div className="relative rounded-card border border-border bg-card p-5 text-sm font-medium">
              New in v2
              <BorderBeam />
            </div>
            <GradientBorder className="p-5 text-sm font-medium">Pro plan</GradientBorder>
          </div>
        </Demo>

        <Demo
          id="confetti"
          title="Confetti"
          description="A tiny canvas burst in your theme colors. Does nothing with motion off. No dependencies."
          code={`import { confetti } from "@junco/motion";

<Button ref={ref} onClick={() => confetti({ from: ref.current })}>Celebrate</Button>`}
        >
          <ConfettiDemo />
        </Demo>

        <Demo
          id="view-transitions"
          title="View transitions"
          description="Wraps a state change in the View Transitions API, so layouts morph instead of snapping. Falls back to an instant change."
          code={`import { useViewTransition, startViewTransition } from "@junco/motion";

const transition = useViewTransition();
<Button onClick={() => transition(() => setView("list"))}>List</Button>

// Or around a router navigation:
startViewTransition(() => router.push("/pricing"));`}
        >
          <ViewTransitionDemo />
        </Demo>
      </div>
    </div>
  );
}
