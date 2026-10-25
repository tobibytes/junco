"use client";

import { Field, Input } from "@junco/react";
import * as React from "react";
import type { ComponentDoc } from "./types";

function Validated() {
  const [value, setValue] = React.useState("taken");
  const taken = value.trim().toLowerCase() === "taken";
  return (
    <div className="w-full max-w-xs">
      <Field label="Username" description="Letters, numbers and dashes." error={taken ? "That username is taken." : undefined}>
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
    </div>
  );
}

export const doc: ComponentDoc = {
  imports: ["Input"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "placeholder", type: "text", default: "you@example.com" },
      { name: "isInvalid", type: "boolean", default: false },
      { name: "disabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="w-full max-w-xs">
        <Input
          aria-label="Email"
          size={v.size as "md"}
          placeholder={String(v.placeholder)}
          isInvalid={v.isInvalid as boolean}
          disabled={v.disabled as boolean}
        />
      </div>
    ),
    code: (v) => {
      const attrs = [
        v.size !== "md" && `size="${v.size}"`,
        `placeholder="${v.placeholder}"`,
        v.isInvalid && "isInvalid",
        v.disabled && "disabled",
      ].filter(Boolean);
      return `<Input ${attrs.join(" ")} />`;
    },
  },
  usage: {
    installed: `<Field label="Email">
  <Input type="email" placeholder="you@example.com" />
</Field>`,
    semantic: `<label class="label" for="email">Email</label>
<input id="email" class="input" type="email" placeholder="you@example.com" />

<!-- invalid -->
<input class="input" aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" class="field-error">Enter a valid email.</p>`,
    utilities: `<input
  className="h-9 w-full rounded-card border border-input bg-surface px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
  placeholder="you@example.com"
/>`,
  },
  examples: [
    {
      title: "Sizes",
      Preview: () => (
        <div className="grid w-full max-w-xs gap-3">
          <Input size="sm" aria-label="Small" placeholder="Small" />
          <Input size="md" aria-label="Medium" placeholder="Medium" />
          <Input size="lg" aria-label="Large" placeholder="Large" />
        </div>
      ),
      code: `<Input size="sm" placeholder="Small" />
<Input size="md" placeholder="Medium" />
<Input size="lg" placeholder="Large" />`,
    },
    {
      title: "With validation",
      description: "Inside a Field, the error is linked with aria-describedby and the input is marked invalid. Type something else to clear it.",
      Preview: Validated,
      code: `<Field
  label="Username"
  description="Letters, numbers and dashes."
  error={taken ? "That username is taken." : undefined}
>
  <Input value={value} onChange={(e) => setValue(e.target.value)} />
</Field>`,
    },
    {
      title: "File",
      Preview: () => (
        <div className="w-full max-w-xs">
          <Input type="file" aria-label="Upload a file" className="py-1.5" />
        </div>
      ),
      code: `<Input type="file" aria-label="Upload a file" />`,
    },
  ],
  props: [
    {
      component: "Input",
      description: "Also takes every native <input> attribute.",
      props: [
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Height, padding and font size." },
        { name: "isInvalid", type: "boolean", default: "false", description: "Sets aria-invalid and the error border. Inside a Field, setting error does this for you." },
        { name: "type", type: "string", default: '"text"', description: "Native input type." },
        { name: "className", type: "string", description: "Extra classes." },
      ],
    },
  ],
  keyboard: [{ keys: ["Tab"], action: "Moves focus into and out of the field." }],
  a11y: [
    "Always give an input a visible label: wrap it in a Field or pair it with a Label. Placeholder text is not a label.",
    "Invalid state is shown by a red border and an error message, never the border color alone.",
    "Inside a Field, the help text and error are announced with the input through aria-describedby.",
  ],
};
