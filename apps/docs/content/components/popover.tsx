"use client";

import { Button, Field, Input, Popover, PopoverClose, PopoverContent, PopoverTrigger, toast } from "junco";
import type { ComponentDoc } from "./types";

export const doc: ComponentDoc = {
  imports: ["Popover", "PopoverTrigger", "PopoverContent", "PopoverClose"],
  playground: {
    controls: [
      { name: "side", type: "select", options: ["bottom", "top", "right", "left"], default: "bottom" },
      { name: "align", type: "select", options: ["center", "start", "end"], default: "center" },
    ],
    render: (v) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent side={v.side as "bottom"} align={v.align as "center"}>
          <p className="font-medium">Dimensions</p>
          <p className="mt-1 text-muted-foreground">Set the size of the canvas.</p>
        </PopoverContent>
      </Popover>
    ),
    code: (v) => {
      const attrs = [v.side !== "bottom" && `side="${v.side}"`, v.align !== "center" && `align="${v.align}"`].filter(Boolean);
      return `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent${attrs.length ? " " + attrs.join(" ") : ""}>
    <p className="font-medium">Dimensions</p>
    <p className="mt-1 text-muted-foreground">Set the size of the canvas.</p>
  </PopoverContent>
</Popover>`;
    },
  },
  usage: {
    installed: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Share</Button>
  </PopoverTrigger>
  <PopoverContent align="end">…</PopoverContent>
</Popover>`,
    semantic: `<!-- The native popover attribute: light dismiss and Esc come from the browser. -->
<button class="btn" popovertarget="share">Share</button>

<div id="share" popover class="popover">
  <p>Anyone with the link can view.</p>
</div>`,
  },
  examples: [
    {
      title: "With a form",
      description: "Focus moves into the popover, so the field is ready to type in.",
      Preview: () => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Invite</Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="grid gap-3">
            <Field label="Email">
              <Input type="email" placeholder="ada@example.com" />
            </Field>
            <PopoverClose asChild>
              <Button size="sm" onClick={() => toast.success("Invite sent")}>
                Send invite
              </Button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      ),
      code: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Invite</Button>
  </PopoverTrigger>
  <PopoverContent align="start" className="grid gap-3">
    <Field label="Email">
      <Input type="email" placeholder="ada@example.com" />
    </Field>
    <PopoverClose asChild>
      <Button size="sm" onClick={() => toast.success("Invite sent")}>Send invite</Button>
    </PopoverClose>
  </PopoverContent>
</Popover>`,
    },
  ],
  props: [
    {
      component: "Popover",
      props: [
        { name: "open", type: "boolean", description: "Controlled open state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state when uncontrolled." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when it opens or closes." },
        { name: "modal", type: "boolean", default: "false", description: "Block interaction with the rest of the page while open." },
      ],
    },
    {
      component: "PopoverContent",
      description: "Rendered in a portal and kept on screen automatically.",
      props: [
        { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side; flips when there isn't room." },
        { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment against the trigger." },
        { name: "sideOffset", type: "number", default: "6", description: "Gap from the trigger in px." },
        { name: "collisionPadding", type: "number", default: "8", description: "Space kept from the viewport edges." },
        { name: "className", type: "string", description: "Default width is 18rem; override it here." },
      ],
    },
    {
      component: "PopoverTrigger / PopoverClose / PopoverAnchor",
      props: [{ name: "asChild", type: "boolean", default: "false", description: "Use your own element. PopoverAnchor positions against something other than the trigger." }],
    },
  ],
  keyboard: [
    { keys: ["Enter"], action: "Opens the popover from the trigger." },
    { keys: ["Esc"], action: "Closes it and returns focus to the trigger." },
    { keys: ["Tab"], action: "Moves through the popover's content." },
  ],
  a11y: [
    "The trigger gets aria-expanded and aria-controls automatically.",
    "Focus moves into the popover on open and back to the trigger on close.",
    "Clicking outside closes it. For a short text hint, use Tooltip instead.",
  ],
};
