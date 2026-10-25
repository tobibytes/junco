import type { Metadata } from "next";
import { Badge, Button } from "junco";
import Link from "next/link";
import { ArrowRightIcon, GithubIcon } from "@/components/icons";
import { BrowserShot } from "@/components/examples/shot";
import { getExamples } from "@/lib/examples";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Examples",
  description: "Real projects built entirely with Junco: an analytics SaaS, a finance tracker, a hackathon site and a plain-HTML status page. Open the live demos or read the source.",
};

export default function ExamplesPage() {
  const examples = getExamples();
  return (
    <div className="overflow-x-clip">
      <section className="hero-glow relative border-b border-border">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-4 px-4 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
          <Badge variant="outline" hasDot color="success" className="animate-rise">
            {examples.length} projects, all open source
          </Badge>
          <h1 className="animate-rise text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
            Built with Junco
          </h1>
          <p className="animate-rise max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            Complete projects made only from Junco. Open a demo, then see how it's built.
          </p>
        </div>
      </section>

      <section aria-label="Example projects" className="mx-auto max-w-screen-xl px-4 py-12 md:px-6 sm:py-16">
        <ul className="grid gap-x-8 gap-y-14 lg:grid-cols-2">
          {examples.map((ex, i) => (
            <li key={ex.slug} className="group grid content-start gap-5">
              <Link
                href={`/examples/${ex.slug}/`}
                className="block rounded-card transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring group-hover:-translate-y-0.5"
                aria-hidden
                tabIndex={-1}
              >
                <BrowserShot light={ex.shots.light} dark={ex.shots.dark} alt={`${ex.title} screenshot`} url={ex.demo ? `${new URL(site.url).host}${ex.demo}` : undefined} priority={i < 2} className="transition-shadow duration-base group-hover:shadow-float" />
              </Link>
              <div className="grid gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-xl font-semibold tracking-tight">
                    <Link href={`/examples/${ex.slug}/`} className="rounded-xs hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                      {ex.title}
                    </Link>
                  </h2>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                    {ex.tags.slice(0, 3).map((t) => (
                      <li key={t}>
                        <Badge variant="outline">{t}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-pretty text-muted-foreground">{ex.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ex.demo && (
                  <Button asChild size="sm">
                    <a href={ex.demo} target="_blank" rel="noreferrer">
                      Live demo <ArrowRightIcon className="size-3.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </Button>
                )}
                <Button asChild size="sm" variant="outline">
                  <Link href={`/examples/${ex.slug}/`}>How it's built</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <a href={ex.source} target="_blank" rel="noreferrer">
                    <GithubIcon className="size-3.5" /> Source
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Built something with Junco?</h2>
          <p className="text-muted-foreground">Open a pull request adding it to examples/ and it can show up here.</p>
          <Button asChild variant="outline">
            <a href={`${site.github}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
              How to contribute
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
