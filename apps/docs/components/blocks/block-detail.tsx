"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@junco/react";
import * as React from "react";
import { getBlock, installCommand, setupCss, usageCode } from "@/content/blocks/catalog";
import { CodeBlock } from "../code-block";
import { BlockViewer } from "./block-viewer";

export function BlockDetail({ slug }: { slug: string }) {
  const entry = getBlock(slug)!;
  const [variant, setVariant] = React.useState(entry.variants[0]!.value);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8">
      <BlockViewer entry={entry} variant={variant} onVariantChange={setVariant} />

      <section aria-labelledby="usage" className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <h2 id="usage" className="scroll-mt-20 text-xl font-semibold tracking-tight">
          Usage
        </h2>
        <Tabs defaultValue="usage">
          <TabsList aria-label="Code">
            <TabsTrigger value="usage">Usage</TabsTrigger>
            {entry.example && <TabsTrigger value="customize">Props and slots</TabsTrigger>}
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>
          <TabsContent value="usage">
            <CodeBlock code={usageCode(entry, variant)} title="page.tsx" />
          </TabsContent>
          {entry.example && (
            <TabsContent value="customize">
              <CodeBlock code={entry.example} />
            </TabsContent>
          )}
          <TabsContent value="setup" className="grid gap-3">
            <CodeBlock lang="bash" code={installCommand} />
            <CodeBlock lang="css" title="app.css" code={setupCss} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
