"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "junco";
import type { ComponentDoc } from "./types";

const faq = [
  { q: "Is Junco free?", a: "Yes. Everything is MIT licensed, with nothing behind a paywall." },
  { q: "Can I use it without React?", a: "Yes. The semantic classes (btn, card, input, …) are plain CSS and work in any framework or plain HTML." },
  { q: "Will copied components still get updates?", a: "Run junco diff to see upstream changes and junco update to merge them, keeping your edits." },
];

export const doc: ComponentDoc = {
  imports: ["Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent"],
  playground: {
    controls: [
      { name: "type", type: "select", options: ["single", "multiple"], default: "single" },
      { name: "variant", type: "select", options: ["line", "card"], default: "line" },
      { name: "collapsible", type: "boolean", default: true },
    ],
    render: (v) => {
      const items = faq.map((f, i) => (
        <AccordionItem key={f.q} value={`item-${i}`}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ));
      return (
        <div className="w-full max-w-md">
          {v.type === "multiple" ? (
            <Accordion type="multiple" variant={v.variant as "line"}>
              {items}
            </Accordion>
          ) : (
            <Accordion type="single" collapsible={v.collapsible as boolean} variant={v.variant as "line"}>
              {items}
            </Accordion>
          )}
        </div>
      );
    },
    code: (v) => {
      const attrs = [`type="${v.type}"`, v.type === "single" && v.collapsible && "collapsible", v.variant !== "line" && `variant="${v.variant}"`].filter(Boolean);
      return `<Accordion ${attrs.join(" ")}>
  <AccordionItem value="free">
    <AccordionTrigger>Is Junco free?</AccordionTrigger>
    <AccordionContent>Yes. Everything is MIT licensed.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="react">
    <AccordionTrigger>Can I use it without React?</AccordionTrigger>
    <AccordionContent>Yes. The semantic classes are plain CSS.</AccordionContent>
  </AccordionItem>
</Accordion>`;
    },
  },
  usage: {
    installed: `<Accordion type="single" collapsible>
  <AccordionItem value="free">
    <AccordionTrigger>Is it free?</AccordionTrigger>
    <AccordionContent>Yes, MIT licensed.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    semantic: `<!-- Native <details>: no JS, keyboard support and find-in-page from the browser. -->
<details class="accordion-item">
  <summary>Is it free?</summary>
  <div class="accordion-content">Yes, MIT licensed.</div>
</details>
<details class="accordion-item">
  <summary>Can I use it without React?</summary>
  <div class="accordion-content">Yes. The semantic classes are plain CSS.</div>
</details>`,
  },
  examples: [
    {
      title: "Cards",
      description: "Each item is its own bordered card. Good for settings groups.",
      Preview: () => (
        <div className="w-full max-w-md">
          <Accordion type="multiple" variant="card" defaultValue={["item-0"]}>
            {faq.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ),
      code: `<Accordion type="multiple" variant="card" defaultValue={["free"]}>
  <AccordionItem value="free">…</AccordionItem>
  <AccordionItem value="react">…</AccordionItem>
</Accordion>`,
    },
  ],
  props: [
    {
      component: "Accordion",
      props: [
        { name: "type", type: '"single" | "multiple"', description: "Required. single opens one item at a time; multiple lets several stay open." },
        { name: "collapsible", type: "boolean", default: "false", description: "With type single, lets the open item close again." },
        { name: "variant", type: '"line" | "card"', default: '"line"', description: "Hairline rows, or separate bordered cards." },
        { name: "value / defaultValue", type: "string | string[]", description: "Open item(s); an array with type multiple." },
        { name: "onValueChange", type: "(value) => void", description: "Called when items open or close." },
      ],
    },
    {
      component: "AccordionItem",
      props: [
        { name: "value", type: "string", description: "Required. Identifies the item." },
        { name: "disabled", type: "boolean", description: "Can't be opened or closed." },
      ],
    },
    {
      component: "AccordionTrigger",
      props: [
        { name: "headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", description: "Heading level wrapping the trigger, for a correct document outline." },
        { name: "classNames", type: "{ heading?, icon? }", description: "Class overrides for the heading and chevron." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Enter"], action: "Opens or closes the focused section." },
    { keys: ["Space"], action: "Same as Enter." },
    { keys: ["↓", "↑"], action: "Moves between section headers." },
    { keys: ["Home", "End"], action: "Jumps to the first or last header." },
  ],
  a11y: [
    "Each trigger is a button inside a heading, with aria-expanded and aria-controls.",
    "Pick headingLevel so the headings fit the page outline.",
    "The open and close animation follows the motion switch.",
    "Closed content isn't searchable with the browser's find in the installed version; the semantic <details> version is.",
  ],
};
