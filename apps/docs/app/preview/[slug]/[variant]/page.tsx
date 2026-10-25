import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FrameView } from "@/components/blocks/frame-view";
import { blocks, getBlock } from "@/content/blocks/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return blocks.flatMap((b) => b.variants.map((v) => ({ slug: b.slug, variant: v.value })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; variant: string }> }): Promise<Metadata> {
  const { slug, variant } = await params;
  const entry = getBlock(slug);
  return {
    title: entry ? `${entry.title} (${variant}) preview` : "Preview",
    robots: { index: false, follow: false },
  };
}

/**
 * Runs before the block paints: `?theme=` and `?motion=` from the embedding page win over the
 * saved site theme that the root layout's script applied.
 */
const FRAME_SCRIPT = `(function(){var p=new URLSearchParams(location.search),t=p.get("theme"),m=p.get("motion"),e=document.documentElement;if(t==="dark"||t==="light"){e.classList.toggle("dark",t==="dark");e.dataset.theme=t;e.style.colorScheme=t}if(m==="full"||m==="subtle"||m==="off")e.dataset.motion=m})()`;

export default async function PreviewPage({ params }: { params: Promise<{ slug: string; variant: string }> }) {
  const { slug, variant } = await params;
  const entry = getBlock(slug);
  if (!entry || !entry.variants.some((v) => v.value === variant)) notFound();
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: FRAME_SCRIPT }} />
      <FrameView slug={slug} variant={variant} />
    </>
  );
}
