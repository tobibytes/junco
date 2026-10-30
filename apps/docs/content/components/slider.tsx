"use client";

import { Field, Slider } from "@junco/react";
import * as React from "react";
import type { ComponentDoc } from "./types";

function Range() {
  const [range, setRange] = React.useState([5, 30]);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Page count</span>
        <span className="text-muted-foreground tabular-nums">
          {range[0]}–{range[1]} pages
        </span>
      </div>
      <Slider value={range} onValueChange={setRange} max={50} thumbLabels={["Fewest pages", "Most pages"]} getValueLabel={(v) => `${v} pages`} />
    </div>
  );
}

export const doc: ComponentDoc = {
  imports: ["Slider"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md"], default: "md" },
      { name: "range", type: "boolean", default: false },
      { name: "disabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <Slider
        key={String(v.range)}
        className="max-w-sm"
        aria-label="Volume"
        thumbLabels={v.range ? ["Minimum", "Maximum"] : undefined}
        defaultValue={v.range ? [20, 70] : [40]}
        size={v.size as "md"}
        disabled={v.disabled as boolean}
      />
    ),
    code: (v) => {
      const attrs = [
        v.range ? "defaultValue={[20, 70]}" : "defaultValue={[40]}",
        v.range ? `thumbLabels={["Minimum", "Maximum"]}` : `aria-label="Volume"`,
        v.size !== "md" && `size="${v.size}"`,
        v.disabled && "disabled",
      ].filter(Boolean);
      return `<Slider ${attrs.join(" ")} />`;
    },
  },
  usage: {
    installed: `<Slider value={[minutes]} onValueChange={([m]) => setMinutes(m)} max={120} step={5} aria-label="Session length" />`,
    semantic: `<input type="range" class="range" min="0" max="120" step="5" value="45" aria-label="Session length" />`,
  },
  examples: [
    {
      title: "Range",
      description: "Two values make two thumbs. Name each one with thumbLabels.",
      Preview: Range,
      code: `const [range, setRange] = React.useState([5, 30]);

<Slider
  value={range}
  onValueChange={setRange}
  max={50}
  thumbLabels={["Fewest pages", "Most pages"]}
  getValueLabel={(v) => \`\${v} pages\`}
/>`,
    },
    {
      title: "In a Field",
      description: "Inside a Field the thumb takes its name from the label.",
      Preview: () => (
        <Field label="Daily goal" description="Minutes of study a day." className="w-full max-w-sm">
          <Slider defaultValue={[45]} max={120} step={5} getValueLabel={(v) => `${v} minutes`} />
        </Field>
      ),
      code: `<Field label="Daily goal" description="Minutes of study a day.">
  <Slider defaultValue={[45]} max={120} step={5} getValueLabel={(v) => \`\${v} minutes\`} />
</Field>`,
    },
  ],
  props: [
    {
      component: "Slider",
      props: [
        { name: "value / defaultValue", type: "number[]", description: "One number per thumb." },
        { name: "onValueChange", type: "(value: number[]) => void", description: "Called while dragging or on each key press." },
        { name: "onValueCommit", type: "(value: number[]) => void", description: "Called when the user lets go." },
        { name: "min / max / step", type: "number", default: "0 / 100 / 1", description: "The scale." },
        { name: "thumbLabels", type: "string[]", description: "An accessible name per thumb. One thumb can use aria-label instead." },
        { name: "getValueLabel", type: "(value: number) => string", description: 'What screen readers say for a value, e.g. "45 minutes".' },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Track and thumb size." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction." },
        { name: "disabled", type: "boolean", default: "false", description: "Not focusable or draggable." },
        { name: "classNames", type: "{ root?; track?; range?; thumb? }", description: "Slot overrides." },
      ],
    },
  ],
  keyboard: [
    { keys: ["←", "→"], action: "Moves by one step (↑ and ↓ too)." },
    { keys: ["Page Up", "Page Down"], action: "Moves by ten steps." },
    { keys: ["Home", "End"], action: "Jumps to the minimum or maximum." },
  ],
  a11y: [
    "Each thumb is role=slider with its own name and value.",
    "Use getValueLabel when the number alone isn't meaningful (units, ranges).",
    "Focus shows a ring around the thumb.",
  ],
};
