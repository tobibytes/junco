import type { Metadata } from "next";
import { BlockGallery } from "@/components/blocks/block-gallery";
import { CodeBlock } from "@/components/code-block";
import { blocks, installCommand, isPage, setupCss } from "@/content/blocks/catalog";

export const metadata: Metadata = {
  title: "Blocks and pages",
  description: "Full pages and page sections built from Junco components: landing, pricing, dashboards, settings, auth and more. Typed props, fake data, variants and slots.",
};

export default function BlocksPage() {
  const pages = blocks.filter(isPage).length;
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
      <header className="grid max-w-3xl gap-3">
        <p className="text-sm font-medium text-primary">@junco/blocks</p>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">Blocks and pages</h1>
        <p className="text-base text-pretty text-muted-foreground">
          {pages} full pages and {blocks.length - pages} sections, built only from Junco components. Every page takes typed
          data and falls back to realistic fake data, has layout <code className="font-mono text-[0.9em]">variant</code>s, and
          lets you replace or hide any region with <code className="font-mono text-[0.9em]">slots</code>. They follow your
          accent, dark mode and the motion switch.
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CodeBlock lang="bash" title="Install" code={installCommand} />
        <CodeBlock lang="css" title="app.css" code={setupCss} />
      </div>

      <div className="mt-12">
        <BlockGallery />
      </div>
    </div>
  );
}
