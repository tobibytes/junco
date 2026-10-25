"use client";

import { Badge } from "@junco/react";
import type { ComponentDoc } from "./types";

const colors = ["neutral", "primary", "success", "warning", "danger"] as const;

export const doc: ComponentDoc = {
  imports: ["Badge"],
  playground: {
    controls: [
      { name: "variant", type: "select", options: ["solid", "outline"], default: "solid" },
      { name: "color", type: "select", options: colors, default: "success" },
      { name: "hasDot", type: "boolean", default: true },
      { name: "children", label: "text", type: "text", default: "Paid" },
    ],
    render: (v) => (
      <Badge variant={v.variant as "solid"} color={v.color as "neutral"} hasDot={v.hasDot as boolean}>
        {String(v.children)}
      </Badge>
    ),
    code: (v) => {
      const attrs = [v.variant !== "solid" && `variant="${v.variant}"`, v.color !== "neutral" && `color="${v.color}"`, v.hasDot && "hasDot"].filter(Boolean);
      return `<Badge${attrs.length ? " " + attrs.join(" ") : ""}>${v.children}</Badge>`;
    },
  },
  usage: {
    installed: `<Badge color="success" hasDot>Paid</Badge>
<Badge variant="outline" color="danger" hasDot>Failed</Badge>`,
    semantic: `<span class="badge">Beta</span>
<span class="badge badge-success badge-dot">Paid</span>
<span class="badge badge-outline">Draft</span>`,
    utilities: `<span className="inline-flex h-[22px] items-center gap-1.5 rounded-pill bg-secondary px-2 text-xs font-medium text-secondary-foreground">
  Beta
</span>`,
  },
  examples: [
    {
      title: "Solid",
      Preview: () => (
        <>
          {colors.map((c) => (
            <Badge key={c} color={c} className="capitalize">
              {c}
            </Badge>
          ))}
        </>
      ),
      code: colors.map((c) => `<Badge color="${c}">${c}</Badge>`).join("\n"),
    },
    {
      title: "Outline with status dots",
      description: "Outline badges use status text tokens that pass 4.5:1 on the page. The dot plus the word carry the meaning, not the color.",
      Preview: () => (
        <>
          <Badge variant="outline" color="success" hasDot>Paid</Badge>
          <Badge variant="outline" color="warning" hasDot>Pending</Badge>
          <Badge variant="outline" color="danger" hasDot>Failed</Badge>
          <Badge variant="outline" color="primary" hasDot>In review</Badge>
          <Badge variant="outline" hasDot>Draft</Badge>
        </>
      ),
      code: `<Badge variant="outline" color="success" hasDot>Paid</Badge>
<Badge variant="outline" color="warning" hasDot>Pending</Badge>
<Badge variant="outline" color="danger" hasDot>Failed</Badge>`,
    },
  ],
  props: [
    {
      component: "Badge",
      props: [
        { name: "variant", type: '"solid" | "outline"', default: '"solid"', description: "Filled or outlined." },
        { name: "color", type: '"neutral" | "primary" | "success" | "warning" | "danger"', default: '"neutral"', description: "Meaning. Always pair it with words." },
        { name: "hasDot", type: "boolean", default: "false", description: "Adds a leading dot in the current color." },
      ],
    },
  ],
  a11y: [
    "Status is never color alone: the badge text says what the color means.",
    "Every color pair is checked at 4.5:1 contrast in light and dark by the token tests.",
    "For counts that change live, wrap them in an aria-live region so updates are announced.",
  ],
};
