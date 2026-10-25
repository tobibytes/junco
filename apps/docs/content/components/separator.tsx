"use client";

import { Separator } from "@junco/react";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Separator"],
  playground: {
    controls: [
      { name: "orientation", type: "select", options: ["horizontal", "vertical"], default: "horizontal" },
      { name: "decorative", type: "boolean", default: true },
    ],
    render: (v) =>
      v.orientation === "vertical" ? (
        <div className="flex h-6 items-center gap-3 text-sm">
          <span>Docs</span>
          <Separator orientation="vertical" decorative={v.decorative as boolean} />
          <span>Components</span>
          <Separator orientation="vertical" decorative={v.decorative as boolean} />
          <span>Blocks</span>
        </div>
      ) : (
        <div className="w-full max-w-xs text-sm">
          <p className="font-medium">Junco</p>
          <p className="text-muted-foreground">A design system for React.</p>
          <Separator className="my-3" decorative={v.decorative as boolean} />
          <p className="text-muted-foreground">MIT licensed.</p>
        </div>
      ),
    code: (v) => `<Separator${v.orientation !== "horizontal" ? ` orientation="${v.orientation}"` : ""}${v.decorative ? "" : " decorative={false}"} />`,
  },
  usage: {
    installed: `<Separator className="my-4" />`,
    semantic: `<hr class="separator" />
<div class="separator separator-vertical" role="none"></div>`,
    utilities: `<div role="none" className="h-px w-full bg-border" />`,
  },
  examples: [],
  props: [
    {
      component: "Separator",
      props: [
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction of the line." },
        { name: "decorative", type: "boolean", default: "true", description: "Hidden from assistive tech. Set false when it separates real sections." },
      ],
    },
  ],
  a11y: [
    "Decorative by default (role=none), since most dividers are visual only.",
    "With decorative={false} it's a role=separator with the right aria-orientation.",
  ],
};
