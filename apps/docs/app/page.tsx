import { Button } from "junco";
import Link from "next/link";
import { Beyond } from "@/components/home/beyond";
import { InstallCommand } from "@/components/home/install-command";
import { Levels } from "@/components/home/levels";
import { Showcase } from "@/components/home/showcase";
import {
  ActivityIcon,
  ArrowRightIcon,
  BotIcon,
  HalfCircleIcon,
  HeartIcon,
  RefreshIcon,
  ShieldIcon,
} from "@/components/icons";
import { components } from "@/content/components";
import { site } from "@/lib/site";

const features = [
  {
    icon: ShieldIcon,
    title: "Accessible by default",
    body: "Keyboard patterns from WAI-ARIA, focus rings that only show for keyboards, axe in the test suite, and 4.5:1 contrast enforced on every token pair.",
  },
  {
    icon: RefreshIcon,
    title: "Copied code that updates",
    body: "Own the source like shadcn, then pull upstream fixes with junco update. A three-way merge keeps your edits.",
  },
  {
    icon: HalfCircleIcon,
    title: "One variable themes it",
    body: "Change --primary and everything follows, in light and dark. The theme builder picks lightness that stays readable.",
  },
  {
    icon: ActivityIcon,
    title: "Motion with one switch",
    body: "Durations and easings are tokens. data-motion turns all of it down, and reduced-motion always wins.",
  },
  {
    icon: BotIcon,
    title: "Built for agents",
    body: "An MCP server, llms.txt and shadcn-compatible registry JSON, so AI tools build with real components.",
  },
  {
    icon: HeartIcon,
    title: "Free. All of it.",
    body: "MIT licensed. Components, blocks, pages and templates. No pro tier, no license keys.",
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
            Tokens, components, blocks and pages for React and Tailwind v4. Use plain CSS classes, utilities, copy-in source or an
            installed package. They all read the same tokens, so they mix in one app.
          </p>
          <div className="animate-rise flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/docs/installation/">
                Get started <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/components/">Browse components</Link>
            </Button>
          </div>
          <div className="animate-rise max-w-full overflow-x-auto">
            <InstallCommand command="npm i junco @junco/tailwind" />
          </div>
        </div>
      </section>

      {/* Four levels */}
      <section aria-labelledby="levels" className="mx-auto grid max-w-screen-xl gap-8 px-4 py-20 md:px-6">
        <div className="grid max-w-2xl gap-3">
          <h2 id="levels" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Start simple. Go deeper when you need to.
          </h2>
          <p className="text-muted-foreground">
            The same button, four ways. Every level reads the same tokens, so a semantic <code className="font-mono text-sm">.btn</code>{" "}
            and an installed <code className="font-mono text-sm">&lt;Button&gt;</code> always match.
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
                Everything below is live. Type in the form, tab through it, open the select, flip to dark mode. Then pick a new accent
                and watch the whole site follow.
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
            Start from a finished screen instead of a blank file. Every page is built from the same components, so it already
            matches the rest of your app.
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
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="grid content-start gap-3 bg-card p-6">
              <span className="grid size-9 place-items-center rounded-control border border-border bg-surface text-foreground">
                <Icon />
              </span>
              <h3 className="text-sm font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-5 px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl">Your next project, already designed.</h2>
          <p className="max-w-xl text-muted-foreground">Install it in two minutes. Change one variable to make it yours.</p>
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
