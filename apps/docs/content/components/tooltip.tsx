"use client";

import { Button, Tooltip } from "@junco/react";
import { CopyIcon, PlusIcon, SearchIcon } from "@/components/icons";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Tooltip", "TooltipProvider"],
  playground: {
    controls: [
      { name: "content", type: "text", default: "Add item" },
      { name: "side", type: "select", options: ["top", "right", "bottom", "left"], default: "top" },
      { name: "shortcut", type: "text", default: "A" },
    ],
    render: (v) => (
      <Tooltip content={String(v.content)} side={v.side as "top"} shortcut={String(v.shortcut) || undefined}>
        <Button variant="outline" size="icon" aria-label={String(v.content)}>
          <PlusIcon />
        </Button>
      </Tooltip>
    ),
    code: (v) => `<Tooltip content="${v.content}"${v.side !== "top" ? ` side="${v.side}"` : ""}${v.shortcut ? ` shortcut="${v.shortcut}"` : ""}>
  <Button variant="outline" size="icon" aria-label="${v.content}">
    <PlusIcon />
  </Button>
</Tooltip>`,
  },
  usage: {
    installed: `// once, near the root
<TooltipProvider>
  <App />
</TooltipProvider>

<Tooltip content="Copy link" shortcut="⌘C">
  <Button size="icon" aria-label="Copy link"><CopyIcon /></Button>
</Tooltip>`,
    semantic: `<!-- CSS-only: hover and focus, text must also be the accessible name -->
<button class="btn btn-icon tooltip" data-tip="Copy link" aria-label="Copy link">⧉</button>`,
  },
  examples: [
    {
      title: "Toolbar",
      description: "Move between buttons and the tooltips switch instantly, since they share a provider.",
      Preview: () => (
        <div className="flex gap-1 rounded-card border border-border bg-card p-1">
          <Tooltip content="Search" shortcut="/">
            <Button variant="ghost" size="icon" aria-label="Search">
              <SearchIcon />
            </Button>
          </Tooltip>
          <Tooltip content="Copy link" shortcut="⌘C">
            <Button variant="ghost" size="icon" aria-label="Copy link">
              <CopyIcon />
            </Button>
          </Tooltip>
          <Tooltip content="New item" shortcut="N">
            <Button variant="ghost" size="icon" aria-label="New item">
              <PlusIcon />
            </Button>
          </Tooltip>
        </div>
      ),
      code: `<Tooltip content="Search" shortcut="/">
  <Button variant="ghost" size="icon" aria-label="Search"><SearchIcon /></Button>
</Tooltip>`,
    },
  ],
  props: [
    {
      component: "Tooltip",
      props: [
        { name: "content", type: "ReactNode", description: "What the tooltip says. Keep it short." },
        { name: "children", type: "ReactElement", description: "The trigger. Must be focusable and accept a ref." },
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Preferred side; flips when there's no room." },
        { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment along the side." },
        { name: "shortcut", type: "string", description: "A keyboard hint shown after the text." },
        { name: "delayDuration", type: "number", description: "Override the provider's open delay for this tooltip." },
      ],
    },
    { component: "TooltipProvider", props: [{ name: "delayDuration", type: "number", default: "400", description: "Milliseconds before a tooltip opens on hover." }] },
  ],
  keyboard: [
    { keys: ["Tab"], action: "Focusing the trigger opens the tooltip." },
    { keys: ["Esc"], action: "Closes the tooltip." },
  ],
  a11y: [
    "Opens on keyboard focus as well as hover, and the content is linked to the trigger with aria-describedby.",
    "Never put the only copy of important information in a tooltip: touch users can't hover.",
    "Icon-only triggers still need their own aria-label; the tooltip describes, it doesn't name.",
  ],
};
