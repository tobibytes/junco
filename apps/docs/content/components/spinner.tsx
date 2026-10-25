"use client";

import { Button, Spinner } from "@junco/react";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Spinner"],
  playground: {
    controls: [
      { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
      { name: "label", type: "text", default: "Loading" },
    ],
    render: (v) => <Spinner size={v.size as "md"} label={String(v.label) || null} />,
    code: (v) => `<Spinner${v.size !== "md" ? ` size="${v.size}"` : ""}${v.label !== "Loading" ? ` label=${v.label ? `"${v.label}"` : "{null}"}` : ""} />`,
  },
  usage: {
    installed: `<Spinner />
<Spinner size="lg" label="Loading results" />`,
    semantic: `<span class="spinner" role="status" aria-label="Loading"></span>`,
    utilities: `<span role="status" aria-label="Loading" className="size-4 animate-spinner rounded-pill border-2 border-current border-r-transparent" />`,
  },
  examples: [
    {
      title: "Sizes and color",
      description: "Spinners draw in currentColor, so they match the text around them.",
      Preview: () => (
        <>
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
          <Spinner size="lg" className="text-primary" />
        </>
      ),
      code: `<Spinner size="sm" />
<Spinner />
<Spinner size="lg" />
<Spinner size="lg" className="text-primary" />`,
    },
    {
      title: "Inside a button",
      description: "Prefer Button's isLoading: it hides this spinner from screen readers and sets aria-busy instead.",
      Preview: () => <Button isLoading>Deploying</Button>,
      code: `<Button isLoading>Deploying</Button>`,
    },
  ],
  props: [
    {
      component: "Spinner",
      props: [
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "12, 16 or 24px." },
        { name: "label", type: "string | null", default: '"Loading"', description: "Read by screen readers. Pass null when something nearby already announces loading." },
      ],
    },
  ],
  a11y: [
    "role=status with a label, so the loading state is announced.",
    "Keeps turning with motion off (slower), because it carries meaning; everything else stops.",
  ],
};
