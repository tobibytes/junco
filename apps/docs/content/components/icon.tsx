"use client";

import { Button, Icon } from "junco";
import { Bell, Check, Search, Settings, Trash2 } from "lucide-react";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Icon"],
  installExtra: ["lucide-react"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["xs", "sm", "md", "lg", "xl"], default: "md" },
      { name: "label", type: "text", default: "" },
    ],
    render: (v) => <Icon as={Settings} size={v.size as "md"} label={String(v.label) || undefined} />,
    code: (v) => `<Icon as={Settings}${v.size !== "md" ? ` size="${v.size}"` : ""}${v.label ? ` label="${v.label}"` : ""} />`,
  },
  usage: {
    installed: `import { Search } from "lucide-react";

<Icon as={Search} />                  // decorative
<Icon as={Search} label="Search" />   // meaningful on its own`,
    semantic: `<svg class="icon" aria-hidden="true">…</svg>
<svg class="icon icon-lg" aria-hidden="true">…</svg>`,
    utilities: `<Search aria-hidden className="size-4 shrink-0 [stroke-width:var(--icon-stroke)]" />`,
  },
  examples: [
    {
      title: "Sizes",
      description: "Sizes follow the type scale, and every icon gets the same stroke from --icon-stroke.",
      Preview: () => (
        <>
          {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
            <Icon key={s} as={Bell} size={s} />
          ))}
        </>
      ),
      code: `<Icon as={Bell} size="xs" />
<Icon as={Bell} size="sm" />
<Icon as={Bell} />
<Icon as={Bell} size="lg" />
<Icon as={Bell} size="xl" />`,
    },
    {
      title: "With text and in buttons",
      description: "Next to text the icon is decorative. Icon-only buttons need an aria-label, and Junco warns in development if one is missing.",
      Preview: () => (
        <>
          <Button>
            <Icon as={Check} /> Save
          </Button>
          <Button variant="outline" size="icon" aria-label="Search">
            <Icon as={Search} />
          </Button>
          <Button variant="danger" size="icon" aria-label="Delete">
            <Icon as={Trash2} />
          </Button>
        </>
      ),
      code: `<Button><Icon as={Check} /> Save</Button>
<Button variant="outline" size="icon" aria-label="Search">
  <Icon as={Search} />
</Button>`,
    },
  ],
  props: [
    {
      component: "Icon",
      description: "Also takes every SVG attribute.",
      props: [
        { name: "as", type: "React.ElementType", description: "The icon to render. Lucide, Heroicons, Phosphor or your own SVG component." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', default: '"md"', description: "12, 14, 16, 20 or 24px." },
        { name: "label", type: "string", description: "Makes the icon an image with this name. Leave it out when text nearby says the same thing." },
        { name: "strokeWidth", type: "number", description: "Overrides --icon-stroke for this icon." },
      ],
    },
  ],
  a11y: [
    "Decorative by default: aria-hidden and not focusable.",
    "With label it becomes role=img with that name.",
    'Button size="icon" warns in development when it has no aria-label, aria-labelledby or title.',
  ],
};
