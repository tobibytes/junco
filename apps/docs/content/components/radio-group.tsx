"use client";

import { Label, Radio, RadioGroup } from "@junco/react";
import { cn } from "@/lib/cn";
import type { ComponentDoc } from "./types";

const plans = [
  { value: "hobby", title: "Hobby", price: "$0", note: "For side projects" },
  { value: "pro", title: "Pro", price: "$20", note: "For growing teams" },
  { value: "scale", title: "Scale", price: "$80", note: "SSO and audit logs" },
];

export const doc: ComponentDoc = {
  imports: ["RadioGroup", "Radio", "Label"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "orientation", type: "select", options: ["vertical", "horizontal"], default: "vertical" },
      { name: "disabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <RadioGroup
        aria-label="Billing"
        defaultValue="monthly"
        orientation={v.orientation as "vertical"}
        disabled={v.disabled as boolean}
      >
        {["monthly", "yearly"].map((option) => (
          <div key={option} className="flex items-center gap-2">
            <Radio id={`pg-${option}`} value={option} size={v.size as "md"} />
            <Label htmlFor={`pg-${option}`} className="capitalize">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    ),
    code: (v) => {
      const group = [`aria-label="Billing"`, `defaultValue="monthly"`, v.orientation !== "vertical" && `orientation="${v.orientation}"`, v.disabled && "disabled"].filter(Boolean);
      const size = v.size !== "md" ? ` size="${v.size}"` : "";
      return `<RadioGroup ${group.join(" ")}>
  <div className="flex items-center gap-2">
    <Radio id="monthly" value="monthly"${size} />
    <Label htmlFor="monthly">Monthly</Label>
  </div>
  <div className="flex items-center gap-2">
    <Radio id="yearly" value="yearly"${size} />
    <Label htmlFor="yearly">Yearly</Label>
  </div>
</RadioGroup>`;
    },
  },
  usage: {
    installed: `<RadioGroup aria-label="Billing" defaultValue="monthly">
  <div className="flex items-center gap-2">
    <Radio id="monthly" value="monthly" />
    <Label htmlFor="monthly">Monthly</Label>
  </div>
</RadioGroup>`,
    semantic: `<fieldset>
  <legend class="label">Billing</legend>
  <label class="label"><input type="radio" class="radio" name="billing" checked /> Monthly</label>
  <label class="label"><input type="radio" class="radio" name="billing" /> Yearly</label>
</fieldset>`,
  },
  examples: [
    {
      title: "Cards",
      description: "Make the whole card the label for a bigger target. The ring follows the checked radio.",
      Preview: () => (
        <RadioGroup aria-label="Plan" defaultValue="pro" className="grid w-full max-w-md gap-2 sm:grid-cols-3">
          {plans.map((plan) => (
            <Label
              key={plan.value}
              htmlFor={`plan-${plan.value}`}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-1 rounded-card border border-border bg-card p-3 font-normal",
                "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:shadow-[0_0_0_1px_var(--primary)]",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <span className="font-medium">{plan.title}</span>
                <Radio id={`plan-${plan.value}`} value={plan.value} />
              </span>
              <span className="text-lg font-semibold">{plan.price}</span>
              <span className="text-xs text-muted-foreground">{plan.note}</span>
            </Label>
          ))}
        </RadioGroup>
      ),
      code: `<RadioGroup aria-label="Plan" defaultValue="pro" className="grid gap-2 sm:grid-cols-3">
  {plans.map((plan) => (
    <Label
      key={plan.value}
      htmlFor={plan.value}
      className="flex flex-col items-start gap-1 rounded-card border border-border p-3 has-[[data-state=checked]]:border-primary"
    >
      <span className="flex w-full justify-between">
        {plan.title} <Radio id={plan.value} value={plan.value} />
      </span>
      ...
    </Label>
  ))}
</RadioGroup>`,
    },
  ],
  props: [
    {
      component: "RadioGroup",
      props: [
        { name: "value / defaultValue", type: "string", description: "Controlled or initial value." },
        { name: "onValueChange", type: "(value: string) => void", description: "Called when the choice changes." },
        { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Layout and which arrow keys move between options." },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every option." },
        { name: "name / required", type: "string / boolean", description: "For native form submission." },
      ],
    },
    {
      component: "Radio",
      props: [
        { name: "value", type: "string", description: "Required. The group's value when this one is checked." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Circle size." },
        { name: "disabled", type: "boolean", default: "false", description: "Skips this option." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Tab"], action: "Moves focus into the group (to the checked option) and out again." },
    { keys: ["↑", "↓"], action: "Moves to and checks the previous or next option." },
    { keys: ["←", "→"], action: "Same, for horizontal groups." },
    { keys: ["Space"], action: "Checks the focused option." },
  ],
  a11y: [
    "Follows the WAI-ARIA radio group pattern: one tab stop for the whole group, arrows to choose.",
    "Name the group with aria-label or aria-labelledby, and label every option.",
    "The checked option shows a filled dot, not just a color change.",
  ],
};
