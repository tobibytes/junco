"use client";

import { Button } from "junco";
import { Highlighted } from "../code-block";
import type { Lang } from "@/lib/highlight";

const levels: { n: string; title: string; lang: Lang; code: string; result: React.ReactNode }[] = [
  {
    n: "01",
    title: "Semantic classes",
    lang: "html",
    code: `<button class="btn btn-primary">
  Deploy
</button>`,
    result: <button className="btn btn-primary">Deploy</button>,
  },
  {
    n: "02",
    title: "Utilities",
    lang: "tsx",
    code: `<button className="
  h-9 rounded-control px-3.5
  bg-primary text-sm
  text-primary-foreground">
  Deploy
</button>`,
    result: (
      <button className="h-9 rounded-control bg-primary px-3.5 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        Deploy
      </button>
    ),
  },
  {
    n: "03",
    title: "Copy-in",
    lang: "bash",
    code: `npx @junco/cli add button
# yours to edit, still updatable
npx @junco/cli update button`,
    result: <Button>Deploy</Button>,
  },
  {
    n: "04",
    title: "Installed",
    lang: "tsx",
    code: `import { Button } from "junco";

<Button isLoading>Deploy</Button>`,
    result: <Button isLoading>Deploy</Button>,
  },
];

export function Levels() {
  return (
    <div className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {levels.map((level) => (
        <div key={level.n} className="flex flex-col bg-card">
          <div className="flex items-center justify-between gap-2 px-4 pt-4">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted-foreground">{level.n}</span>
              <span className="text-sm font-medium">{level.title}</span>
            </span>
          </div>
          <pre tabIndex={0} aria-label={`${level.title} code`} className="mx-4 mt-3 flex-1 overflow-x-auto rounded-control focus-visible:outline-2 focus-visible:outline-ring bg-(--code-bg) p-3 font-mono text-[12px] leading-5">
            <code>
              <Highlighted code={level.code} lang={level.lang} />
            </code>
          </pre>
          <div className="preview-canvas mt-4 flex h-20 items-center justify-center border-t border-border">{level.result}</div>
        </div>
      ))}
    </div>
  );
}
