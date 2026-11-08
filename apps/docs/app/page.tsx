import { Button } from "@junco/react";
import Link from "next/link";
import { Beyond } from "@/components/home/beyond";
import { InstallCommand } from "@/components/home/install-command";
import { Levels } from "@/components/home/levels";
import { Showcase } from "@/components/home/showcase";
import { components } from "@/content/components";
import { BrowserShot } from "@/components/examples/shot";
import { getExamples } from "@/lib/examples";
import { site } from "@/lib/site";

const features: { title: string; body: string; href?: string }[] = [
  {
    title: "Accessible by default",
    body: "WAI-ARIA keyboard patterns, axe in CI, 4.5:1 contrast tested on every token pair.",
  },
  {
    title: "Copied code that updates",
    body: "Own the source, then pull fixes with junco update. Your edits survive.",
  },
  {
    title: "One variable themes it",
    body: "Change --primary and everything follows, light and dark.",
  },
  {
    title: "Native SwiftUI",
    body: "The same tokens in Swift, with SwiftUI styles. iOS and Mac apps match the web.",
    href: "/docs/swiftui/",
  },
  {
    title: "Built for agents",
    body: "MCP server, llms.txt and a shadcn-compatible registry.",
  },
  {
    title: "Free. All of it.",
    body: "MIT. No pro tier, no license keys.",
  },
];

export default function Home() {
  return (
    <div className="overflow-x-clip">
      {/* Hero: the product itself is the picture */}
      <section className="border-b border-border">
        <div className="animate-rise mx-auto grid max-w-screen-xl items-center gap-12 px-4 pt-16 pb-20 md:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:pt-24 lg:pb-28">
          <div className="grid justify-items-start gap-6">
            <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              One design system, four ways to use it.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Tokens, components and whole pages for React, Tailwind v4 and SwiftUI. Use CSS classes, utilities, copied
              source or npm, and they all read the same tokens. Free and{" "}
              <a href={site.github} rel="noreferrer" className="text-foreground underline underline-offset-4 hover:no-underline">
                open source
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/docs/installation/">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/components/">Browse components</Link>
              </Button>
            </div>
            <div className="max-w-full overflow-x-auto">
              <InstallCommand command="npm i @junco/react @junco/tailwind" />
            </div>
          </div>
          <Levels />
        </div>
      </section>

      {/* Built with Junco */}
      <section aria-labelledby="built-with" className="mx-auto grid max-w-screen-xl gap-8 px-4 pt-20 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid max-w-2xl gap-3">
            <h2 id="built-with" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built with Junco.
            </h2>
            <p className="text-muted-foreground">Complete projects, all live, all open source.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/examples/">
              All examples
            </Link>
          </Button>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {getExamples().map((ex, i, all) => (
            // Two wide, then three: no lone card on the last row (falls back to equal columns for other counts).
            <li key={ex.slug} className={all.length === 5 ? (i < 2 ? "lg:col-span-3" : "lg:col-span-2") : "lg:col-span-2"}>
              <Link
                href={`/examples/${ex.slug}/`}
                className="group grid gap-3 rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <BrowserShot light={ex.shots.light} dark={ex.shots.dark} alt={`${ex.title} screenshot`} className="transition-shadow duration-base group-hover:shadow-float" />
                <span className="font-medium">{ex.title}</span>
                <span className="-mt-2 text-sm text-pretty text-muted-foreground">{ex.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Showcase */}
      <section aria-labelledby="showcase" className="border-y border-border bg-surface/50">
        <div className="mx-auto grid max-w-screen-xl gap-8 px-4 py-20 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid max-w-2xl gap-3">
              <h2 id="showcase" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Real components, not screenshots.
              </h2>
              <p className="text-muted-foreground">
                All live. Try the form, then pick an accent and watch the site follow.
              </p>
            </div>
            <Link href="/components/" className="text-sm font-medium underline underline-offset-4 hover:no-underline">
              All {components.length} components
            </Link>
          </div>
          <Showcase />
        </div>
      </section>

      {/* Beyond components */}
      <section aria-labelledby="beyond" className="mx-auto grid max-w-screen-xl gap-8 px-4 pt-20 md:px-6">
        <div className="grid max-w-2xl gap-3">
          <h2 id="beyond" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Whole pages, motion and 3D.
          </h2>
          <p className="text-muted-foreground">
            Start from a finished screen, not a blank file.
          </p>
        </div>
        <Beyond />
      </section>

      {/* Features */}
      <section aria-labelledby="features" className="mx-auto grid max-w-screen-xl gap-10 px-4 py-20 md:px-6">
        <h2 id="features" className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
          The parts other libraries leave out.
        </h2>
        <div className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, body, href }) => (
            <div key={title} className="relative grid content-start gap-2 bg-card p-6">
              <h3 className="font-medium">
                {href ? (
                  <Link href={href} className="rounded-xs after:absolute after:inset-0 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-5 px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl">Your next project, already designed.</h2>
          <p className="max-w-xl text-muted-foreground">Two minutes to install. One variable to make it yours.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/docs/installation/">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/docs/theming/">Build a theme</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
