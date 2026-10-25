"use client";

import { Button } from "@junco/react";
import * as React from "react";
import { PlusIcon } from "@/components/icons";
import type { ComponentDoc } from "./types";

function Loading() {
  const [saving, setSaving] = React.useState(false);
  return (
    <Button
      isLoading={saving}
      onClick={() => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
      }}
    >
      {saving ? "Saving" : "Save changes"}
    </Button>
  );
}

export const doc: ComponentDoc = {
  imports: ["Button"],
  playground: {
    controls: [
      { name: "variant", type: "select", options: ["solid", "outline", "soft", "ghost", "danger"], default: "solid" },
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "isLoading", type: "boolean", default: false },
      { name: "disabled", type: "boolean", default: false },
      { name: "children", label: "label", type: "text", default: "Save changes" },
    ],
    render: (v) => (
      <Button
        variant={v.variant as "solid"}
        size={v.size as "md"}
        isLoading={v.isLoading as boolean}
        disabled={v.disabled as boolean}
      >
        {String(v.children)}
      </Button>
    ),
    code: (v) => {
      const attrs = [
        v.variant !== "solid" && `variant="${v.variant}"`,
        v.size !== "md" && `size="${v.size}"`,
        v.isLoading && "isLoading",
        v.disabled && "disabled",
      ].filter(Boolean);
      return `<Button${attrs.length ? " " + attrs.join(" ") : ""}>${String(v.children)}</Button>`;
    },
  },
  usage: {
    installed: `<Button onClick={save}>Save changes</Button>
<Button variant="outline">Cancel</Button>
<Button isLoading>Saving</Button>`,
    semantic: `<button class="btn btn-primary">Save changes</button>
<button class="btn">Cancel</button>
<button class="btn btn-ghost btn-sm">More</button>
<button class="btn btn-primary" aria-busy="true">
  <span class="spinner spinner-sm" aria-hidden="true"></span>
  Saving
</button>`,
    utilities: `<button className="inline-flex h-9 items-center gap-2 rounded-control bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors duration-fast ease-standard hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
  Save changes
</button>`,
  },
  examples: [
    {
      title: "Variants",
      description: "Solid marks the one primary action on a screen. Everything else is quieter.",
      Preview: () => (
        <>
          <Button>Solid</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </>
      ),
      code: `<Button>Solid</Button>
<Button variant="outline">Outline</Button>
<Button variant="soft">Soft</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`,
    },
    {
      title: "Sizes",
      Preview: () => (
        <>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" variant="outline" aria-label="Add item">
            <PlusIcon />
          </Button>
        </>
      ),
      code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon" variant="outline" aria-label="Add item">
  <PlusIcon />
</Button>`,
    },
    {
      title: "Loading",
      description: "isLoading disables the button, shows a spinner and sets aria-busy. Click to try it.",
      Preview: Loading,
      code: `const [saving, setSaving] = useState(false);

<Button isLoading={saving} onClick={save}>
  {saving ? "Saving" : "Save changes"}
</Button>`,
    },
    {
      title: "As a link",
      description: "asChild renders your element (a link, a router Link) with button styles.",
      Preview: () => (
        <Button asChild variant="outline">
          <a href="#as-a-link">Read the docs</a>
        </Button>
      ),
      code: `<Button asChild variant="outline">
  <a href="/docs">Read the docs</a>
</Button>`,
    },
  ],
  props: [
    {
      component: "Button",
      description: "Also takes every native <button> attribute.",
      props: [
        { name: "variant", type: '"solid" | "outline" | "soft" | "ghost" | "danger"', default: '"solid"', description: "Visual weight. Use solid once per view for the main action." },
        { name: "size", type: '"sm" | "md" | "lg" | "icon"', default: '"md"', description: "Height and padding. icon is square; give it an aria-label." },
        { name: "isLoading", type: "boolean", default: "false", description: "Shows a spinner, disables the button and sets aria-busy." },
        { name: "asChild", type: "boolean", default: "false", description: "Render the child element instead of a <button>, merging props and styles." },
        { name: "className", type: "string", description: "Extra classes. Conflicting utilities override the defaults." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Enter"], action: "Activates the button." },
    { keys: ["Space"], action: "Activates the button." },
    { keys: ["Tab"], action: "Moves focus to the next control. Disabled and loading buttons are skipped." },
  ],
  a11y: [
    "Renders a native <button>, so it works with keyboards and screen readers without extra wiring.",
    "Icon-only buttons need an aria-label; the visible icon is hidden from assistive tech.",
    "isLoading keeps the label visible and sets aria-busy, so the button doesn't go silent while working.",
    "The focus ring uses --ring and only shows for keyboard focus (focus-visible).",
  ],
};
