import type { Metadata } from "next";
import { Badge, Button } from "@junco/react";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { ArrowRightIcon, GithubIcon } from "@/components/icons";
import { createCommand, getTemplates } from "@/lib/templates";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Templates",
  description: "Start a whole app from Junco: a SaaS app and an admin panel, built only from Junco blocks and pages. Try the live demos, then create your own with one command.",
};

export default function TemplatesPage() {
  const templates = getTemplates();
  const host = new URL(site.url).host;
  return (
    <div className="overflow-x-clip">
      <section className="hero-glow relative border-b border-border">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-4 px-4 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
          <Badge variant="outline" hasDot color="success" className="animate-rise">
            {templates.length} templates, free and MIT
          </Badge>
          <h1 className="animate-rise text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">Start from a whole app</h1>
          <p className="animate-rise max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            Every page wired up with routing, a sign-in and realistic data. Built only from Junco blocks and pages, so you change it the same way you'd build it.
          </p>
          <div className="animate-rise w-full max-w-md text-left">
            <CodeBlock lang="bash" code={createCommand(templates[0]?.name ?? "saas")} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-screen-xl gap-20 px-4 py-14 md:px-6 sm:py-16">
        {templates.map((t) => (
          <section key={t.name} id={t.name} aria-labelledby={`${t.name}-title`} className="grid scroll-mt-20 items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="grid content-start gap-5">
              <div className="grid gap-2">
                <h2 id={`${t.name}-title`} className="text-2xl font-semibold tracking-tight">
                  {t.title}
                </h2>
                <p className="text-pretty text-muted-foreground">{t.description}</p>
              </div>
              <CodeBlock lang="bash" code={createCommand(t.name)} />
              <div className="grid gap-2">
                <h3 className="text-sm font-medium">{t.pages.length} pages</h3>
                <ul className="flex flex-wrap gap-1.5" aria-label={`${t.title} pages`}>
                  {t.pages.map((p) => (
                    <li key={p}>
                      <Badge variant="outline">{p}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                {t.demo && (
                  <Button asChild size="sm">
                    <a href={t.demo} target="_blank" rel="noreferrer">
                      Open live demo <ArrowRightIcon className="size-3.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </Button>
                )}
                <Button asChild size="sm" variant="ghost">
                  <a href={t.source} target="_blank" rel="noreferrer">
                    <GithubIcon className="size-3.5" /> Source
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              </div>
            </div>

            {t.demo ? (
              <figure className="overflow-hidden rounded-card border border-border bg-surface">
                <div className="flex h-8 items-center gap-1.5 border-b border-border bg-muted px-3" aria-hidden>
                  <span className="size-2.5 rounded-pill bg-border-strong/60" />
                  <span className="size-2.5 rounded-pill bg-border-strong/60" />
                  <span className="size-2.5 rounded-pill bg-border-strong/60" />
                  <span className="mx-auto truncate rounded-xs bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {host}
                    {t.demo}
                  </span>
                </div>
                <iframe src={t.demo} title={`${t.title} template, live demo`} loading="lazy" className="block h-[560px] w-full bg-background" />
              </figure>
            ) : (
              <p className="rounded-card border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                The live demo is built with the site. Run <code className="font-mono">pnpm build</code> to see it locally.
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-4 px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Need a different starting point?</h2>
          <p className="text-pretty text-muted-foreground">
            Copy single pages into any app with <code className="font-mono text-foreground">junco add</code>, or see complete projects built with Junco.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/blocks/">Blocks and pages</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/examples/">Examples</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
