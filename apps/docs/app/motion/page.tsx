import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { DataTable } from "@/components/docs/prose";
import { MotionGallery } from "@/components/motion/motion-gallery";

export const metadata: Metadata = {
  title: "Motion",
  description: "Scroll reveal, number ticker, text reveal, marquee, spotlight, beams, confetti and view transitions. Every effect follows one motion switch and prefers-reduced-motion.",
};

const cssClasses: [string, string][] = [
  ["reveal", "Fades and rises in as it scrolls into view (CSS scroll-driven where supported; React <Reveal> elsewhere)"],
  ["reveal-item", "A child that reveals in turn inside a staggered reveal"],
  ["text-reveal", "Word-by-word reveal container (use <TextReveal> to split the text)"],
  ["marquee", "Endless horizontal scroll; add marquee-reverse or marquee-vertical. Pauses on hover and focus"],
  ["shimmer", "A light sweep across text"],
  ["spotlight", "Pointer-following light; set --spotlight-x and --spotlight-y"],
  ["border-beam", "A light running around the parent's rounded border"],
  ["gradient-border", "A slowly turning multi-color border"],
  ["animate-rise / animate-fade", "Entrance animations from @junco/tailwind"],
  ["duration-fast / -base / -slow", "Transition durations scaled by --motion-scale"],
];

export default function MotionPage() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
      <header className="grid max-w-3xl gap-3">
        <p className="text-sm font-medium text-primary">@junco/motion</p>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">Motion</h1>
        <p className="text-base text-pretty text-muted-foreground">
          Effects with no animation library. One <code className="font-mono text-[0.9em]">data-motion</code> switch tones them all
          down, and <code className="font-mono text-[0.9em]">prefers-reduced-motion</code> always wins.
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CodeBlock lang="bash" title="Install" code="npm i @junco/motion" />
        <CodeBlock
          lang="css"
          title="app.css"
          code={`@import "tailwindcss";
@import "@junco/tailwind"; /* includes motion.css */
@source "../node_modules/@junco/motion/dist";`}
        />
      </div>

      <div className="mt-10">
        <MotionGallery />
      </div>

      <section aria-labelledby="css" className="mt-16 grid max-w-3xl gap-4">
        <h2 id="css" className="scroll-mt-32 text-xl font-semibold tracking-tight">
          CSS-only classes
        </h2>
        <p className="text-sm text-muted-foreground">
          The same effects as plain classes from <code className="font-mono">@junco/tailwind</code>, for semantic-class users,
          server components and plain HTML. They follow the motion switch too.
        </p>
        <DataTable head={["Class", "What it does"]} rows={cssClasses.map(([c, d]) => [<code key={c} className="font-mono text-xs">{c}</code>, d])} />
        <CodeBlock
          lang="html"
          code={`<div class="reveal">Rises in as you scroll</div>

<div class="marquee">
  <div class="marquee-track">…logos…</div>
  <div class="marquee-track" aria-hidden="true">…same logos…</div>
</div>

<span class="shimmer">Thinking…</span>`}
        />
      </section>

      <section aria-labelledby="switch" className="mt-16 grid max-w-3xl gap-4">
        <h2 id="switch" className="scroll-mt-32 text-xl font-semibold tracking-tight">
          The motion switch
        </h2>
        <DataTable
          head={["Setting", "--motion-scale", "Effects"]}
          rows={[
            [<code key="f" className="font-mono text-xs">data-motion=&quot;full&quot;</code>, "1", "Everything plays"],
            [<code key="s" className="font-mono text-xs">data-motion=&quot;subtle&quot;</code>, "0.6", "Shorter, smaller movement"],
            [<code key="o" className="font-mono text-xs">data-motion=&quot;off&quot;</code>, "0", "Final states, nothing moves (spinners turn slower)"],
            [<code key="r" className="font-mono text-xs">prefers-reduced-motion</code>, "0", "Always wins over data-motion"],
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Set it with <code className="font-mono">useTheme().setMotion()</code> or on <code className="font-mono">&lt;html&gt;</code>{" "}
          directly. More in{" "}
          <Link href="/docs/dark-mode/" className="font-medium text-foreground underline underline-offset-4">
            Dark mode and motion
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
