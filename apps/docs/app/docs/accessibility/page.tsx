import type { Metadata } from "next";
import { Pager } from "@/components/docs/pager";
import { C, DocHeader, P, Section } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "What Junco does for accessibility by default, and what's still up to you.",
};

const built = [
  ["Keyboard", "Every interactive component works with the keyboard and follows the matching WAI-ARIA pattern (listbox, tabs, radio group, switch)."],
  ["Focus", "Focus rings use --ring and only show for keyboard focus, so mouse users don't see them and keyboard users always do."],
  ["Contrast", "Every text and background pair is tested at 4.5:1 in light and dark. A token change that breaks a pair fails the build."],
  ["Not color alone", "Status always carries words or a shape: badges have text and an optional dot, checkboxes a check, invalid fields an error message."],
  ["Forms", "Field links label, help text and error to its control with htmlFor and aria-describedby, and marks it invalid and required."],
  ["Motion", "All motion follows prefers-reduced-motion and the data-motion switch. Loading indicators slow down instead of stopping."],
  ["Testing", "Components are tested with Testing Library and run through axe in the test suite."],
];

export default function AccessibilityPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Accessibility"
        description="Accessible by default, so the easy path is the right one. Here is what Junco handles and what's still on you."
      />
      <div className="mt-10 grid gap-12">
        <Section id="built-in" title="Built in">
          <dl className="grid gap-px overflow-hidden rounded-card border border-border bg-border">
            {built.map(([title, body]) => (
              <div key={title} className="grid gap-1 bg-card p-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-sm font-medium">{title}</dt>
                <dd className="text-sm text-muted-foreground">{body}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="yours" title="Still up to you">
          <ul className="grid gap-2 text-[15px] text-muted-foreground">
            {[
              "Label every control. Placeholder text isn't a label.",
              "Give icon-only buttons an aria-label.",
              "Name groups (radio groups, tab lists) with aria-label or aria-labelledby.",
              "Don't put the only copy of important information in a tooltip.",
              "Write error messages that say how to fix the problem.",
              "Check contrast if you add your own colors; the theming page shows how.",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="each" title="Per component">
          <P>
            Every component page has a keyboard map and notes under <C>Accessibility</C>.
          </P>
        </Section>
      </div>
      <Pager href="/docs/accessibility/" />
    </>
  );
}
