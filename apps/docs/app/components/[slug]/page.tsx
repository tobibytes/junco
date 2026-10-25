import { Badge } from "junco";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentDocView } from "@/components/docs/component-doc";
import { Pager } from "@/components/docs/pager";
import { ExternalIcon } from "@/components/icons";
import { components, getComponent } from "@/content/components";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = getComponent((await params).slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.description,
    openGraph: { title: `${entry.title} | Junco`, description: entry.description },
  };
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getComponent(slug);
  if (!entry) notFound();
  const file = slug === "theme-provider" ? "../theme/theme-provider.tsx" : `${slug}.tsx`;

  return (
    <>
      <header className="mb-10 grid gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Components</span>
          <span aria-hidden>/</span>
          <Badge variant="outline">{entry.category}</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl">{entry.title}</h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg sm:leading-7">{entry.description}</p>
        <div className="flex flex-wrap gap-4 pt-1 text-sm">
          <a
            href={`${site.sourceBase}/${file}`}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            rel="noreferrer"
          >
            <ExternalIcon width={14} height={14} /> View source
          </a>
          {slug !== "theme-provider" && (
            <a
              href={`/r/${slug}.json`}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ExternalIcon width={14} height={14} /> Registry JSON
            </a>
          )}
        </div>
      </header>
      <ComponentDocView slug={slug} />
      <Pager href={`/components/${slug}/`} />
    </>
  );
}
