"use client";

import { Kbd } from "junco";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Kbd"],
  playground: {
    controls: [{ name: "children", label: "key", type: "text", default: "K" }],
    render: (v) => (
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        <Kbd title="Command">⌘</Kbd>
        <Kbd>{String(v.children)}</Kbd>
      </span>
    ),
    code: (v) => `<Kbd title="Command">⌘</Kbd>
<Kbd>${v.children}</Kbd>`,
  },
  usage: {
    installed: `<Kbd title="Command">⌘</Kbd><Kbd>K</Kbd>`,
    semantic: `<kbd class="kbd" title="Command">⌘</kbd><kbd class="kbd">K</kbd>`,
    utilities: `<kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-b-2 border-border bg-surface px-1.5 font-mono text-[11px] text-muted-foreground">K</kbd>`,
  },
  examples: [
    {
      title: "In text",
      Preview: () => (
        <p className="text-sm text-muted-foreground">
          Press <Kbd title="Command">⌘</Kbd> <Kbd>K</Kbd> to search, or <Kbd>/</Kbd> anywhere. <Kbd>Esc</Kbd> closes.
        </p>
      ),
      code: `<p>
  Press <Kbd title="Command">⌘</Kbd> <Kbd>K</Kbd> to search, or <Kbd>/</Kbd> anywhere.
</p>`,
    },
  ],
  props: [{ component: "Kbd", description: "Also takes every native <kbd> attribute.", props: [{ name: "title", type: "string", description: "Spell out symbols like ⌘ or ⇧ so they read clearly." }] }],
  a11y: [
    "Renders a real <kbd> element.",
    "Symbols such as ⌘ are read inconsistently by screen readers; add a title or visually hidden text.",
  ],
};
