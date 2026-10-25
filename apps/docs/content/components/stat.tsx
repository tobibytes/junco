"use client";

import { Sparkline, Stat, StatGroup } from "@junco/react";
import type { ComponentDoc } from "./types";

const revenue = [12, 14, 13, 17, 16, 19, 22, 21, 25, 28];

export const doc: ComponentDoc = {
  imports: ["Stat", "StatGroup", "Sparkline"],
  playground: {
    controls: [
      { name: "trend", type: "select", options: ["up", "down", "flat"], default: "up" },
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "isInverse", type: "boolean", default: false },
      { name: "chart", label: "sparkline", type: "boolean", default: true },
    ],
    render: (v) => (
      <Stat
        className="w-64"
        label="Monthly revenue"
        value="$48,210"
        delta={v.trend === "up" ? 12.5 : v.trend === "down" ? -4.2 : 0}
        trend={v.trend as "up"}
        size={v.size as "md"}
        isInverse={v.isInverse as boolean}
        deltaLabel="vs last month"
        chart={v.chart ? <Sparkline data={v.trend === "down" ? [...revenue].reverse() : revenue} /> : undefined}
      />
    ),
    code: (v) => {
      const delta = v.trend === "up" ? "12.5" : v.trend === "down" ? "-4.2" : "0";
      const attrs = [
        `label="Monthly revenue"`,
        `value="$48,210"`,
        `delta={${delta}}`,
        v.size !== "md" && `size="${v.size}"`,
        v.isInverse && "isInverse",
        `deltaLabel="vs last month"`,
        v.chart && `chart={<Sparkline data={revenue} />}`,
      ].filter(Boolean);
      return `<Stat\n  ${attrs.join("\n  ")}\n/>`;
    },
  },
  usage: {
    installed: `<StatGroup>
  <Stat label="MRR" value="$13,036" delta={8.2} deltaLabel="vs last month" chart={<Sparkline data={mrr} />} />
  <Stat label="Churn" value="1.9%" delta={-0.4} isInverse />
  <Stat label="Seats" value="244" delta="+12" trend="up" />
</StatGroup>`,
    semantic: `<dl class="stat-group">
  <div class="stat">
    <dt class="stat-label">MRR</dt>
    <dd class="stat-value">$13,036</dd>
    <dd class="stat-delta stat-up">+8.2% vs last month</dd>
  </div>
  <div class="stat">
    <dt class="stat-label">Churn</dt>
    <dd class="stat-value">1.9%</dd>
    <!-- churn going down is good: color it like "up", keep the − sign in the text -->
    <dd class="stat-delta stat-up">−0.4% vs last month</dd>
  </div>
</dl>`,
  },
  examples: [
    {
      title: "A row of stats",
      description: "StatGroup lays stats out in a responsive grid as one description list.",
      Preview: () => (
        <StatGroup className="w-full">
          <Stat label="MRR" value="$13,036" delta={8.2} deltaLabel="vs last month" chart={<Sparkline data={revenue} />} />
          <Stat label="Churn" value="1.9%" delta={-0.4} isInverse deltaLabel="vs last month" />
          <Stat label="Seats" value="244" delta="+12" trend="up" />
        </StatGroup>
      ),
      code: `<StatGroup>
  <Stat label="MRR" value="$13,036" delta={8.2} deltaLabel="vs last month" chart={<Sparkline data={mrr} />} />
  <Stat label="Churn" value="1.9%" delta={-0.4} isInverse deltaLabel="vs last month" />
  <Stat label="Seats" value="244" delta="+12" trend="up" />
</StatGroup>`,
    },
  ],
  props: [
    {
      component: "Stat",
      props: [
        { name: "label", type: "ReactNode", description: "Required. What the number is." },
        { name: "value", type: "ReactNode", description: "Required. The number, already formatted." },
        { name: "delta", type: "number | string", description: "Change vs the comparison period. A number is shown as a signed percent (12.5 → +12.5%)." },
        { name: "trend", type: '"up" | "down" | "flat"', description: "Direction. Inferred from a numeric delta when omitted." },
        { name: "isInverse", type: "boolean", default: "false", description: "For numbers where a rise is bad (costs, churn): up reads as the warning color. Icon and sign still show the real direction." },
        { name: "deltaLabel", type: "ReactNode", description: 'Text after the delta, e.g. "vs last month".' },
        { name: "chart", type: "ReactNode", description: "A small chart under the numbers, usually a Sparkline." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Size of the value." },
        { name: "classNames", type: "{ root?, label?, value?, footer?, delta?, deltaLabel?, chart? }", description: "Class overrides for each part." },
      ],
    },
    {
      component: "Sparkline",
      description: "A tiny dependency-free line chart. Colored with currentColor (primary inside a Stat).",
      props: [
        { name: "data", type: "number[]", description: "Required. At least two points." },
        { name: "isFilled", type: "boolean", default: "true", description: "Fill the area under the line." },
      ],
    },
  ],
  a11y: [
    "Renders a description list, so the label and value are read together.",
    "Direction is shown three ways: an arrow icon, the + or − sign, and screen-reader text (\"Up 12.5%\"). Color is the fourth cue, never the only one.",
    "The sparkline is decorative and hidden from assistive tech; put anything important in the label or delta.",
  ],
};
