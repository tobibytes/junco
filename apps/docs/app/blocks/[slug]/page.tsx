import { Badge, Breadcrumb } from "@junco/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockDetail } from "@/components/blocks/block-detail";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { blocks, getBlock, isPage } from "@/content/blocks/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return blocks.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = getBlock(slug);
  if (!entry) return {};
  return { title: `${entry.title} ${isPage(entry) ? "page" : "block"}`, description: entry.description };
}

export default async function BlockPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getBlock(slug);
  if (!entry) notFound();
  const i = blocks.indexOf(entry);
  const prev = blocks[i - 1];
  const next = blocks[i + 1];

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <Breadcrumb
        items={[{ label: "Blocks", href: "/blocks/" }, { label: entry.category }, { label: entry.title }]}
      />
      <header className="mt-4 mb-8 grid max-w-3xl gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{entry.title}</h1>
        <p className="text-base text-pretty text-muted-foreground">{entry.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <code className="font-mono">{entry.component}</code>
          </Badge>
          <Badge variant="outline">
            <code className="font-mono">{entry.importFrom}</code>
          </Badge>
          {entry.variants.length > 1 && <Badge variant="outline">{entry.variants.length} variants</Badge>}
        </div>
      </header>

      <BlockDetail slug={slug} />

      <nav aria-label="More blocks" className="mt-12 flex justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link href={`/blocks/${prev.slug}/`} className="group grid gap-0.5 rounded-control text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <span className="flex items-center gap-1 text-muted-foreground">
              <ArrowLeftIcon width={14} height={14} /> Previous
            </span>
            <span className="font-medium group-hover:underline">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/blocks/${next.slug}/`} className="group grid justify-items-end gap-0.5 rounded-control text-right text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <span className="flex items-center gap-1 text-muted-foreground">
              Next <ArrowRightIcon width={14} height={14} />
            </span>
            <span className="font-medium group-hover:underline">{next.title}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
