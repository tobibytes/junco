"use client";

import { Checkbox, Label } from "@junco/react";
import * as React from "react";
import type { ComponentDoc } from "./types";

const items = ["Email", "Push", "SMS"] as const;

function SelectAll() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>({ Email: true, Push: false, SMS: false });
  const count = Object.values(checked).filter(Boolean).length;
  const all = count === items.length ? true : count === 0 ? false : "indeterminate";
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="all"
          checked={all}
          onCheckedChange={(v) => setChecked(Object.fromEntries(items.map((i) => [i, v === true])))}
        />
        <Label htmlFor="all">All channels</Label>
      </div>
      <div className="grid gap-2.5 pl-6">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Checkbox
              id={`ch-${item}`}
              checked={checked[item]}
              onCheckedChange={(v) => setChecked((c) => ({ ...c, [item]: v === true }))}
            />
            <Label htmlFor={`ch-${item}`} className="font-normal">
              {item}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export const doc: ComponentDoc = {
  imports: ["Checkbox", "Label"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "defaultChecked", type: "boolean", default: true },
      { name: "isInvalid", type: "boolean", default: false },
      { name: "disabled", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="flex items-center gap-2">
        <Checkbox
          key={String(v.defaultChecked)}
          id="pg-terms"
          size={v.size as "md"}
          defaultChecked={v.defaultChecked as boolean}
          isInvalid={v.isInvalid as boolean}
          disabled={v.disabled as boolean}
        />
        <Label htmlFor="pg-terms">Accept the terms</Label>
      </div>
    ),
    code: (v) => {
      const attrs = [
        `id="terms"`,
        v.size !== "md" && `size="${v.size}"`,
        v.defaultChecked && "defaultChecked",
        v.isInvalid && "isInvalid",
        v.disabled && "disabled",
      ].filter(Boolean);
      return `<Checkbox ${attrs.join(" ")} />
<Label htmlFor="terms">Accept the terms</Label>`;
    },
  },
  usage: {
    installed: `<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept the terms</Label>
</div>`,
    semantic: `<label class="label">
  <input type="checkbox" class="checkbox" checked />
  Accept the terms
</label>`,
  },
  examples: [
    {
      title: "Indeterminate",
      description: "A parent checkbox shows a dash when only some children are checked.",
      Preview: SelectAll,
      code: `const all = count === total ? true : count === 0 ? false : "indeterminate";

<Checkbox id="all" checked={all} onCheckedChange={toggleAll} />
<Label htmlFor="all">All channels</Label>`,
    },
  ],
  props: [
    {
      component: "Checkbox",
      props: [
        { name: "checked / defaultChecked", type: 'boolean | "indeterminate"', description: "Controlled or initial state." },
        { name: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', description: "Called on toggle." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Box size." },
        { name: "isInvalid", type: "boolean", default: "false", description: "Sets aria-invalid and the error border." },
        { name: "disabled", type: "boolean", default: "false", description: "Not focusable or toggleable." },
        { name: "name / value / required", type: "string / string / boolean", description: "For native form submission." },
      ],
    },
  ],
  keyboard: [{ keys: ["Space"], action: "Toggles the checkbox." }],
  a11y: [
    "Renders role=checkbox with aria-checked, including mixed for indeterminate.",
    "Always pair it with a Label (htmlFor) or put it in a Field; clicking the label toggles it.",
    "Checked state shows a check mark, not just a color fill.",
  ],
};
