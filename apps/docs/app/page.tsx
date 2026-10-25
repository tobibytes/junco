import { Button } from "junco";
import Link from "next/link";
import { Beyond } from "@/components/home/beyond";
import { InstallCommand } from "@/components/home/install-command";
import { Levels } from "@/components/home/levels";
import { Showcase } from "@/components/home/showcase";
import {
  ArrowRightIcon,
  BotIcon,
  HalfCircleIcon,
  HeartIcon,
  PhoneIcon,
  RefreshIcon,
  ShieldIcon,
} from "@/components/icons";
import { components } from "@/content/components";
import { BrowserShot } from "@/components/examples/shot";
import { getExamples } from "@/lib/examples";
import { site } from "@/lib/site";

const features: { icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactNode; title: string; body: string; href?: string }[] = [
  {
    icon: ShieldIcon,
    title: "Accessible by default",
    body: "WAI-ARIA keyboard patterns, axe in CI, 4.5:1 contrast tested on every token pair.",
  },
  {
    icon: RefreshIcon,
    title: "Copied code that updates",
    body: "Own the source, then pull fixes with junco update. Your edits survive.",
  },
  {
    icon: HalfCircleIcon,
    title: "One variable themes it",
    body: "Change --primary and everything follows, light and dark.",
  },
  {
    icon: PhoneIcon,
    title: "Native SwiftUI",
    body: "The same tokens in Swift, with SwiftUI styles. iOS and Mac apps match the web.",
    href: "/docs/swiftui/",
  },
  {
    icon: BotIcon,
    title: "Built for agents",
    body: "MCP server, llms.txt and a shadcn-compatible registry.",
  },
  {
    icon: HeartIcon,
    title: "Free. All of it.",
    body: "MIT. No pro tier, no license keys.",
  },
];

export default function Home() {
  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="hero-glow relative border-b border-border">
        <div className="mx-auto grid max-w-5xl justify-items-center gap-6 px-4 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
          <a
            href={site.github}
            rel="noreferrer"
            className="animate-rise inline-flex items-center gap-2 rounded-pill border border-border bg-surface py-1 pr-2.5 pl-3 text-xs text-muted-foreground transition-colors duration-fast hover:text-foreground"
          >
            <span className="size-1.5 rounded-pill bg-success" aria-hidden />
            Free and open source, MIT
            <ArrowRightIcon width={12} height={12} />
          </a>
          <h1 className="animate-rise text-4xl font-semibold tracking-tighter text-balance sm:text-6xl sm:leading-[1.05]">
            One design system.
            <br />
            <span className="text-muted-foreground">Four ways to use it.</span>
          </h1>
          <p className="animate-rise max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            Tokens, components and pages for React, Tailwind v4 and SwiftUI. CSS classes, utilities, copy-in or npm, all on
            the same tokens.
          </p>
          <div className="animate-rise flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/docs/installation/">
                Get started <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/examples/">See examples</Link>
            </Button>
          </div>
          <div className="animate-rise max-w-full overflow-x-auto">
            <InstallCommand command="npm i junco @junco/tailwind" />
          </div>
        </div>
      </section>

      {/* Built with Junco */}
      <section aria-labelledby="built-with" className="mx-auto grid max-w-screen-xl gap-8 px-4 pt-20 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid max-w-2xl gap-3">
            <h2 id="built-with" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Built with Junco.
            </h2>
            <p className="text-muted-foreground">
              Four complete projects, live.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/examples/">
              All examples <ArrowRightIcon />
            </Link>
          </Button>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {getExamples().map((ex) => (
            <li key={ex.slug}>
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

      {/* Four levels */}
      <section aria-labelledby="levels" className="mx-auto grid max-w-screen-xl gap-8 px-4 py-20 md:px-6">
        <div className="grid max-w-2xl gap-3">
          <h2 id="levels" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start simple. Go deeper when you need to.
          </h2>
          <p className="text-muted-foreground">
            The same button, four ways. Same tokens, so they always match.
          </p>
        </div>
        <Levels />
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
            <Link href="/components/" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4">
              All {components.length} components <ArrowRightIcon width={14} height={14} />
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
          {features.map(({ icon: Icon, title, body, href }) => (
            <div key={title} className="relative grid content-start gap-3 bg-card p-6">
              <span className="grid size-9 place-items-center rounded-control border border-border bg-surface text-foreground">
                <Icon />
              </span>
              <h3 className="text-sm font-medium">
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
