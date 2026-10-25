"use client";

import {
  Button,
  Checkbox,
  Label,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@junco/react";
import type { ComponentDoc } from "./types";

const filters = ["Open", "In progress", "Done"];

function Filters({ side = "right" }: { side?: "right" | "left" | "top" | "bottom" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Filters</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>On phones this becomes a bottom sheet you can swipe down.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-3 py-2">
          {filters.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <Checkbox id={`sheet-${side}-${f}`} defaultChecked={f !== "Done"} />
              <Label htmlFor={`sheet-${side}-${f}`}>{f}</Label>
            </div>
          ))}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Apply</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const doc: ComponentDoc = {
  imports: ["Sheet", "SheetTrigger", "SheetContent", "SheetHeader", "SheetTitle", "SheetDescription", "SheetFooter", "SheetClose"],
  playground: {
    controls: [
      { name: "side", type: "select", options: ["right", "left", "top", "bottom"], default: "right" },
      { name: "mobileSide", type: "select", options: ["bottom", "same"], default: "bottom" },
    ],
    render: (v) => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent side={v.side as "right"} mobileSide={v.mobileSide as "bottom"}>
          <SheetHeader>
            <SheetTitle>Project settings</SheetTitle>
            <SheetDescription>Slides in from the {String(v.side)}.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
    code: (v) => {
      const attrs = [v.side !== "right" && `side="${v.side}"`, v.mobileSide !== "bottom" && `mobileSide="${v.mobileSide}"`].filter(Boolean);
      return `<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open sheet</Button>
  </SheetTrigger>
  <SheetContent${attrs.length ? " " + attrs.join(" ") : ""}>
    <SheetHeader>
      <SheetTitle>Project settings</SheetTitle>
      <SheetDescription>Slides in from the ${String(v.side)}.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`;
    },
  },
  usage: {
    installed: `<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Filters</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Narrow down the list.</SheetDescription>
    </SheetHeader>
    {/* content */}
    <SheetFooter>
      <SheetClose asChild><Button>Apply</Button></SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`,
  },
  examples: [
    {
      title: "Filters panel",
      description: "Resize the window below 640px: the side sheet turns into a bottom sheet with a drag handle.",
      Preview: () => <Filters />,
      code: `<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Filters</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>On phones this becomes a bottom sheet you can swipe down.</SheetDescription>
    </SheetHeader>
    {filters.map((f) => (
      <div key={f} className="flex items-center gap-2">
        <Checkbox id={f} defaultChecked />
        <Label htmlFor={f}>{f}</Label>
      </div>
    ))}
    <SheetFooter>
      <SheetClose asChild><Button>Apply</Button></SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`,
    },
    {
      title: "Sides",
      Preview: () => (
        <>
          <Filters side="left" />
          <Filters side="top" />
          <Filters side="bottom" />
        </>
      ),
      code: `<SheetContent side="left">…</SheetContent>
<SheetContent side="top">…</SheetContent>
<SheetContent side="bottom">…</SheetContent>`,
    },
  ],
  props: [
    {
      component: "Sheet",
      props: [
        { name: "open", type: "boolean", description: "Controlled open state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Initial open state when uncontrolled." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the sheet opens or closes, including after a swipe." },
      ],
    },
    {
      component: "SheetContent",
      props: [
        { name: "side", type: '"right" | "left" | "top" | "bottom"', default: '"right"', description: "The edge it slides in from." },
        { name: "mobileSide", type: '"bottom" | "same"', default: '"bottom"', description: "Under 640px, side sheets become swipeable bottom sheets. same keeps the side." },
        { name: "showClose", type: "boolean", default: "true", description: "Show the × button." },
        { name: "closeLabel", type: "string", default: '"Close"', description: "Accessible name for the × button." },
        { name: "classNames", type: "{ overlay?, content?, handle?, close? }", description: "Class overrides for each part." },
      ],
    },
    {
      component: "SheetTitle",
      props: [{ name: "isHidden", type: "boolean", default: "false", description: "Visually hidden, still read by screen readers." }],
    },
  ],
  keyboard: [
    { keys: ["Esc"], action: "Closes the sheet and returns focus to the trigger." },
    { keys: ["Tab"], action: "Cycles focus inside the sheet." },
  ],
  a11y: [
    "Built on the same accessible dialog as Dialog: focus trap, focus return, page hidden behind it.",
    "Swipe to close is an extra on touch; the × button and Esc always work too.",
    "Short drags snap back, so a scroll gesture doesn't close the sheet by accident.",
    "Slide distance scales with the motion switch, and is instant with motion off.",
  ],
};
