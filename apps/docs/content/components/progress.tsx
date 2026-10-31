"use client";

import { Progress } from "@junco/react";
import * as React from "react";
import type { ComponentDoc } from "./types";

function Sync() {
  const [done, setDone] = React.useState(3);
  React.useEffect(() => {
    const t = setInterval(() => setDone((d) => (d >= 12 ? 0 : d + 1)), 700);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid w-full max-w-sm gap-2">
      <div className="flex justify-between text-sm">
        <span id="sync-label" className="font-medium">
          Syncing courses
        </span>
        <span className="text-muted-foreground tabular-nums">{done} of 12</span>
      </div>
      <Progress value={done} max={12} aria-labelledby="sync-label" getValueLabel={(v, m) => `${v} of ${m} courses`} />
    </div>
  );
}

export const doc: ComponentDoc = {
  imports: ["Progress"],
  playground: {
    controls: [
      { name: "value", type: "select", options: ["0", "25", "60", "100", "unknown"], default: "60" },
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "color", type: "select", options: ["primary", "success", "warning", "danger"], default: "primary" },
    ],
    render: (v) => (
      <Progress
        className="max-w-sm"
        aria-label="Upload"
        value={v.value === "unknown" ? null : Number(v.value)}
        size={v.size as "md"}
        color={v.color as "primary"}
      />
    ),
    code: (v) => {
      const attrs = [
        v.value !== "unknown" && `value={${v.value}}`,
        v.size !== "md" && `size="${v.size}"`,
        v.color !== "primary" && `color="${v.color}"`,
        `aria-label="Upload"`,
      ].filter(Boolean);
      return `<Progress ${attrs.join(" ")} />`;
    },
  },
  usage: {
    installed: `<Progress value={done} max={total} aria-label="Sync progress" />`,
    semantic: `<progress class="progress" value="60" max="100" aria-label="Upload">60%</progress>`,
  },
  examples: [
    {
      title: "With a visible label",
      description: "Point aria-labelledby at the label, and use getValueLabel so screen readers hear the same count you show.",
      Preview: Sync,
      code: `<span id="sync-label">Syncing courses</span>
<span>{done} of 12</span>
<Progress value={done} max={12} aria-labelledby="sync-label" getValueLabel={(v, m) => \`\${v} of \${m} courses\`} />`,
    },
    {
      title: "Unknown length",
      description: "Leave out value while you can't measure progress yet. The bar slides instead.",
      Preview: () => <Progress aria-label="Preparing files" className="max-w-sm" />,
      code: `<Progress aria-label="Preparing files" />`,
    },
  ],
  props: [
    {
      component: "Progress",
      props: [
        { name: "value", type: "number | null", description: "From 0 to max. Leave it out while the amount is unknown." },
        { name: "max", type: "number", default: "100", description: "The value that means done." },
        { name: "getValueLabel", type: "(value, max) => string", description: 'What screen readers say. Defaults to the percentage, e.g. "60%".' },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Bar height." },
        { name: "color", type: '"primary" | "success" | "warning" | "danger"', default: '"primary"', description: "Fill color." },
        { name: "classNames", type: "{ root?: string; indicator?: string }", description: "Slot overrides." },
      ],
    },
  ],
  a11y: [
    "Renders role=progressbar with aria-valuenow, aria-valuemax and a readable aria-valuetext.",
    "Needs a name: aria-label, or aria-labelledby pointing at visible text.",
    "data-state is loading, complete or indeterminate, for styling.",
    "The fill animates with the motion setting; the indeterminate slide keeps moving (slower) with motion off, since it carries meaning.",
  ],
};
