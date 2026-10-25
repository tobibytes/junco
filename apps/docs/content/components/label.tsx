"use client";

import { Input, Label } from "@junco/react";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Label"],
  playground: {
    controls: [
      { name: "children", label: "text", type: "text", default: "Email" },
      { name: "isRequired", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="grid w-full max-w-xs gap-1.5">
        <Label htmlFor="pg-label" isRequired={v.isRequired as boolean}>
          {String(v.children)}
        </Label>
        <Input id="pg-label" required={v.isRequired as boolean} />
      </div>
    ),
    code: (v) => `<Label htmlFor="email"${v.isRequired ? " isRequired" : ""}>${v.children}</Label>
<Input id="email"${v.isRequired ? " required" : ""} />`,
  },
  usage: {
    installed: `<Label htmlFor="email" isRequired>Email</Label>
<Input id="email" required />`,
    semantic: `<label class="label" for="email">Email</label>
<input id="email" class="input" />`,
    utilities: `<label htmlFor="email" className="text-sm font-medium">Email</label>`,
  },
  examples: [],
  props: [
    {
      component: "Label",
      description: "Also takes every native <label> attribute.",
      props: [
        { name: "htmlFor", type: "string", description: "Id of the control it labels." },
        { name: "isRequired", type: "boolean", default: "false", description: "Shows a required marker (hidden from screen readers; set required on the control)." },
      ],
    },
  ],
  a11y: [
    "A real <label>: clicking it focuses or toggles its control.",
    "The asterisk is decorative. Set required on the control so assistive tech announces it.",
    "Dims automatically when the control right before it (peer) is disabled.",
  ],
};
