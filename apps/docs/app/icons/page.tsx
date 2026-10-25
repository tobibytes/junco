import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { IconGallery } from "@/components/icon-gallery";

export const metadata: Metadata = {
  title: "Icons",
  description: "Search 1,600+ Lucide icons and copy the import. Junco's Icon sizes them to the type scale with one stroke weight.",
};

export default function IconsPage() {
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
      <header className="grid max-w-3xl gap-3">
        <p className="text-sm font-medium text-primary">lucide-react</p>
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">Icons</h1>
        <p className="text-base text-pretty text-muted-foreground">Click an icon to copy its import. Junco&apos;s Icon handles size, stroke and accessibility.</p>
      </header>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CodeBlock lang="bash" title="Install" code="npm i lucide-react" />
        <CodeBlock
          title="Use"
          code={`import { Icon } from "@junco/react";
import { Search } from "lucide-react";

<Icon as={Search} />`}
        />
      </div>
      <div className="mt-10">
        <IconGallery />
      </div>
    </div>
  );
}
