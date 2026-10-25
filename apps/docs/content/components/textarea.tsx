"use client";

import { Field, Textarea } from "@junco/react";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Textarea"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "autoResize", type: "boolean", default: true },
      { name: "isInvalid", type: "boolean", default: false },
      { name: "disabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="w-full max-w-sm">
        <Textarea
          aria-label="Message"
          placeholder="Write a message…"
          size={v.size as "md"}
          autoResize={v.autoResize as boolean}
          isInvalid={v.isInvalid as boolean}
          disabled={v.disabled as boolean}
        />
      </div>
    ),
    code: (v) => {
      const attrs = [
        v.size !== "md" && `size="${v.size}"`,
        v.autoResize && "autoResize",
        v.isInvalid && "isInvalid",
        v.disabled && "disabled",
        `placeholder="Write a message…"`,
      ].filter(Boolean);
      return `<Textarea ${attrs.join(" ")} />`;
    },
  },
  usage: {
    installed: `<Field label="Message" description="Markdown is supported.">
  <Textarea autoResize placeholder="Write a message…" />
</Field>`,
    semantic: `<label class="label" for="msg">Message</label>
<textarea id="msg" class="textarea textarea-auto" placeholder="Write a message…"></textarea>`,
    utilities: `<textarea className="min-h-20 w-full rounded-card border border-input bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring" />`,
  },
  examples: [
    {
      title: "Grows with content",
      description: "autoResize uses CSS field-sizing, so there's no JavaScript measuring. Browsers without it keep a fixed height.",
      Preview: () => (
        <div className="w-full max-w-sm">
          <Field label="Notes">
            <Textarea autoResize defaultValue={"Line one\nLine two\nKeep typing and the box grows."} />
          </Field>
        </div>
      ),
      code: `<Field label="Notes">
  <Textarea autoResize />
</Field>`,
    },
  ],
  props: [
    {
      component: "Textarea",
      description: "Also takes every native <textarea> attribute.",
      props: [
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Minimum height, padding and font size." },
        { name: "autoResize", type: "boolean", default: "false", description: "Grow to fit the content instead of showing a resize handle." },
        { name: "isInvalid", type: "boolean", default: "false", description: "Sets aria-invalid and the error border." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Tab"], action: "Moves focus into and out of the field." },
    { keys: ["Enter"], action: "Inserts a new line." },
  ],
  a11y: [
    "Label it with a Field or Label; placeholders disappear as soon as someone types.",
    "Inside a Field, help text and errors are linked with aria-describedby.",
  ],
};
