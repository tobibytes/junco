import type { Metadata } from "next";
import { Badge, Button } from "junco";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/code-block";
import { ArrowRightIcon, GithubIcon } from "@/components/icons";
import { BrowserShot, PhoneShot } from "@/components/examples/shot";
import { getExample, getExamples } from "@/lib/examples";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getExamples().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const ex = getExample((await params).slug);
  if (!ex) return {};
  return {
    title: `${ex.title} example`,
    description: ex.tagline,
    openGraph: ex.shots.dark || ex.shots.light ? { images: [ex.shots.dark ?? ex.shots.light!] } : undefined,
  };
}

export default async function ExamplePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ex = getExample(slug);
  if (!ex) notFound();
  const all = getExamples();
  const others = all.filter((e) => e.slug !== ex.slug);
  const pkgName = `@junco/example-${ex.slug}`;

  return (
    <div className="overflow-x-clip">
      <section className="hero-glow relative border-b border-border">
        <div className="mx-auto grid max-w-screen-xl gap-10 px-4 pt-10 pb-12 md:px-6 sm:pt-14">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link href="/examples/" className="rounded-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Examples
            </Link>
            <span aria-hidden className="px-1.5">/</span>
            <span aria-current="page" className="text-foreground">{ex.title}</span>
          </nav>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-3">
              <h1 className="text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">{ex.title}</h1>
              <p className="max-w-2xl text-lg text-pretty text-muted-foreground">{ex.description}</p>
              <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                {ex.tags.map((t) => (
                  <li key={t}>
                    <Badge variant="outline">{t}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              {ex.demo && (
                <Button asChild>
                  <a href={ex.demo} target="_blank" rel="noreferrer">
                    Open live demo <ArrowRightIcon className="size-4" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              )}
              <Button asChild variant="outline">
                <a href={ex.source} target="_blank" rel="noreferrer">
                  <GithubIcon className="size-4" /> View source
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Button>
            </div>
          </div>
          <div className="grid items-end gap-6 lg:grid-cols-[1fr_220px]">
            <BrowserShot light={ex.shots.light} dark={ex.shots.dark} alt={`${ex.title}, desktop`} url={ex.demo ? `${new URL(site.url).host}${ex.demo}` : undefined} priority />
            {ex.shots.phone && <PhoneShot src={ex.shots.phone} alt={`${ex.title} on a phone`} className="mx-auto hidden w-[220px] lg:block" />}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-screen-xl gap-16 px-4 py-14 md:px-6">
        <section aria-labelledby="whats-inside" className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="grid content-start gap-4">
            <h2 id="whats-inside" className="text-2xl font-semibold tracking-tight">What's inside</h2>
            <ul className="grid gap-3">
              {ex.features.map((f) => (
                <li key={f} className="flex gap-3 text-pretty">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Built with</h2>
            <ul className="flex flex-wrap gap-2">
              {ex.packages.map((p) => (
                <li key={p}>
                  <Badge className="font-mono">{p}</Badge>
                </li>
              ))}
            </ul>
            <h3 className="mt-2 text-sm font-medium">Run it locally</h3>
            <CodeBlock
              lang="bash"
              code={`git clone ${site.github}.git && cd junco\npnpm install\npnpm --filter ${pkgName}... build\npnpm --filter ${pkgName} dev`}
            />
          </div>
        </section>

        {ex.shots.details.length > 0 && (
          <section aria-labelledby="screens" className="grid gap-6">
            <h2 id="screens" className="text-2xl font-semibold tracking-tight">Screens</h2>
            <div className="grid items-start gap-6 md:grid-cols-[1fr_auto]">
              <div className="grid gap-6">
                {ex.shots.details.map((d, i) => (
                  <BrowserShot key={d} light={d} alt={`${ex.title}, detail ${i + 1}`} />
                ))}
              </div>
              {/* The hero already shows the phone on large screens. */}
              {ex.shots.phone && <PhoneShot src={ex.shots.phone} alt={`${ex.title} on a phone`} className="mx-auto w-[240px] lg:hidden" />}
            </div>
          </section>
        )}

        {ex.demo && (
          <section aria-labelledby="try-it" className="grid gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="try-it" className="text-2xl font-semibold tracking-tight">Try it here</h2>
              <a href={ex.demo} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
                Open full screen<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <div className="overflow-hidden rounded-card border border-border bg-surface">
              <iframe src={ex.demo} title={`${ex.title} live demo`} loading="lazy" className="block h-[720px] w-full" />
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section aria-labelledby="more" className="grid gap-6 border-t border-border pt-12">
            <h2 id="more" className="text-xl font-semibold tracking-tight">More examples</h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/examples/${o.slug}/`} className="group grid gap-3 rounded-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                    <BrowserShot light={o.shots.light} dark={o.shots.dark} alt={`${o.title} screenshot`} className="transition-shadow duration-base group-hover:shadow-float" />
                    <span className="font-medium">{o.title}</span>
                    <span className="-mt-2 text-sm text-muted-foreground">{o.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
