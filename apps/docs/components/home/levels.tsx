"use client";

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@junco/react";
import { Highlighted } from "../code-block";
import type { Lang } from "@/lib/highlight";
import { HeroAccent } from "./hero-accent";

const levels: { id: string; tab: string; note: string; lang: Lang; code: string; result: React.ReactNode }[] = [
  {
    id: "classes",
    tab: "Classes",
    note: "Pure CSS. Any framework, or plain HTML.",
    lang: "html",
    code: `<button type="button" class="btn btn-primary">
  Deploy
</button>`,
    result: <button type="button" className="btn btn-primary">Deploy</button>,
  },
  {
    id: "utilities",
    tab: "Utilities",
    note: "Tailwind utilities that read the tokens.",
    lang: "tsx",
    code: `<button className="h-9 rounded-control px-3.5
  bg-primary text-sm font-medium
  text-primary-foreground">
  Deploy
</button>`,
    result: (
      <button
        type="button"
        className="h-9 rounded-control bg-primary px-3.5 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Deploy
      </button>
    ),
  },
  {
    id: "copy-in",
    tab: "Copy-in",
    note: "The source lands in your repo, and still takes updates.",
    lang: "bash",
    code: `npx @junco/cli add button
# edit it, then later:
npx @junco/cli update button`,
    result: <Button>Deploy</Button>,
  },
  {
    id: "installed",
    tab: "npm",
    note: "Import it like any other package.",
    lang: "tsx",
    code: `import { Button } from "@junco/react";

<Button isLoading>Deploy</Button>`,
    result: <Button isLoading>Deploy</Button>,
  },
];

/** The hero's working example: one button, four ways, plus the accent switch that re-themes all of them. */
export function Levels() {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card shadow-float">
      <Tabs defaultValue="classes" variant="line">
        <TabsList className="px-4" aria-label="Ways to use Junco">
          {levels.map((l) => (
            <TabsTrigger key={l.id} value={l.id} className="h-11">
              {l.tab}
            </TabsTrigger>
          ))}
        </TabsList>
        {levels.map((l) => (
          <TabsContent key={l.id} value={l.id} className="mt-0">
            <pre
              tabIndex={0}
              aria-label={`${l.tab} code`}
              className="m-4 mb-0 h-32 overflow-x-auto rounded-control bg-(--code-bg) p-4 font-mono text-[13px] leading-6 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <code>
                <Highlighted code={l.code} lang={l.lang} />
              </code>
            </pre>
            <p className="px-4 pt-3 text-sm text-muted-foreground">{l.note}</p>
            <div className="preview-canvas mt-4 flex h-24 items-center justify-center border-y border-border">{l.result}</div>
          </TabsContent>
        ))}
      </Tabs>
      <div className="px-4 py-3">
        <HeroAccent />
      </div>
    </div>
  );
}
