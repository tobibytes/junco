import { Badge } from "@junco/react";
import type { Metadata } from "next";
import { Pager } from "@/components/docs/pager";
import { DocHeader } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in Junco.",
};

const entries = [
  {
    version: "Unreleased",
    date: "October 2026",
    items: [
      "Form controls: Textarea, Select, Checkbox, Switch, Radio group, Field and Label.",
      "Tabs, Tooltip, Avatar and Separator.",
      "Pure-CSS versions of checkbox, radio, switch, select, textarea, tabs, avatar, tooltip and field.",
      "Axe accessibility checks across the component set.",
    ],
  },
  {
    version: "0.1.0",
    date: "October 2026",
    items: [
      "Tokens: color, type scale, spacing, radius, shadows, z-index and motion, as CSS, TypeScript and W3C JSON.",
      "Contrast test for every text and background pair.",
      "Tailwind v4 mapping and the first semantic classes.",
      "Button, Input, Badge, Kbd, Spinner, Skeleton and ThemeProvider.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <DocHeader eyebrow="Getting started" title="Changelog" description="Releases are versioned with Changesets. Full notes land here with each release." />
      <ol className="mt-10 grid gap-10">
        {entries.map((entry) => (
          <li key={entry.version} className="grid gap-3 sm:grid-cols-[9rem_1fr]">
            <div className="flex items-center gap-2 sm:grid sm:content-start sm:gap-1">
              <Badge variant="outline">{entry.version}</Badge>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
            </div>
            <ul className="grid gap-2 text-[15px] text-muted-foreground">
              {entry.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-border" />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <Pager href="/docs/changelog/" />
    </>
  );
}
