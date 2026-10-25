"use client";

import { Label, Separator, Switch } from "@junco/react";
import type { ComponentDoc } from "./types";

const settings = [
  { id: "s-mentions", title: "Mentions", description: "When someone @mentions you.", on: true },
  { id: "s-digest", title: "Weekly digest", description: "A summary every Monday.", on: false },
  { id: "s-product", title: "Product updates", description: "New features and fixes.", on: true },
];

export const doc: ComponentDoc = {
  imports: ["Switch", "Label"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "defaultChecked", type: "boolean", default: true },
      { name: "disabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="flex items-center gap-3">
        <Switch
          key={String(v.defaultChecked)}
          id="pg-switch"
          size={v.size as "md"}
          defaultChecked={v.defaultChecked as boolean}
          disabled={v.disabled as boolean}
        />
        <Label htmlFor="pg-switch">Email notifications</Label>
      </div>
    ),
    code: (v) => {
      const attrs = [`id="notify"`, v.size !== "md" && `size="${v.size}"`, v.defaultChecked && "defaultChecked", v.disabled && "disabled"].filter(Boolean);
      return `<Switch ${attrs.join(" ")} />
<Label htmlFor="notify">Email notifications</Label>`;
    },
  },
  usage: {
    installed: `<Switch id="notify" checked={on} onCheckedChange={setOn} />
<Label htmlFor="notify">Email notifications</Label>`,
    semantic: `<label class="label">
  <input type="checkbox" role="switch" class="switch" checked />
  Email notifications
</label>`,
  },
  examples: [
    {
      title: "Settings list",
      description: "Switches apply immediately, so they suit settings. For choices submitted with a form, use a Checkbox.",
      Preview: () => (
        <div className="w-full max-w-sm rounded-card border border-border bg-card">
          {settings.map((s, i) => (
            <div key={s.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <Label htmlFor={s.id}>{s.title}</Label>
                  <p id={`${s.id}-d`} className="text-xs text-muted-foreground">
                    {s.description}
                  </p>
                </div>
                <Switch id={s.id} defaultChecked={s.on} aria-describedby={`${s.id}-d`} />
              </div>
            </div>
          ))}
        </div>
      ),
      code: `<div className="flex items-center justify-between gap-4 p-4">
  <div>
    <Label htmlFor="mentions">Mentions</Label>
    <p id="mentions-d" className="text-xs text-muted-foreground">When someone @mentions you.</p>
  </div>
  <Switch id="mentions" defaultChecked aria-describedby="mentions-d" />
</div>`,
    },
  ],
  props: [
    {
      component: "Switch",
      props: [
        { name: "checked / defaultChecked", type: "boolean", description: "Controlled or initial state." },
        { name: "onCheckedChange", type: "(checked: boolean) => void", description: "Called on toggle." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Track and thumb size." },
        { name: "disabled", type: "boolean", default: "false", description: "Not focusable or toggleable." },
        { name: "classNames", type: "{ root?: string; thumb?: string }", description: "Slot overrides." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Space"], action: "Toggles the switch." },
    { keys: ["Enter"], action: "Toggles the switch." },
  ],
  a11y: [
    "Renders role=switch with aria-checked, so screen readers say on or off.",
    "The thumb position shows the state as well as the track color.",
    "The thumb's spring follows the motion switch and stops moving with reduced motion.",
  ],
};
