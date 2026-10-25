import type { Metadata } from "next";
import { AccentPicker } from "@/components/accent-picker";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DocHeader, Note, P, Section } from "@/components/docs/prose";
import { ColorTokenTable, ContrastTable, ScaleTable, TypeScaleTable } from "@/components/docs/token-tables";

export const metadata: Metadata = {
  title: "Theming",
  description: "Junco's tokens, the accent color, and the contrast every pair has to hit.",
};

export default function ThemingPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Theming"
        description="Every design value is a CSS variable with a light and a dark value. Change --primary and the whole app follows. Contrast is checked for you."
      />
      <div className="mt-10 grid gap-14">
        <Section id="accent" title="Pick an accent">
          <P>
            Choose a hue and Junco picks the lightness that keeps text readable at 4.5:1 in both light and dark. The whole site
            re-themes as you drag.
          </P>
          <div className="rounded-card border border-border bg-card p-5">
            <AccentPicker />
          </div>
        </Section>

        <Section id="how" title="How it works">
          <P>
            Tokens live in <C>@junco/tokens</C> as plain CSS variables. Light values sit on <C>:root</C>; dark values on{" "}
            <C>.dark</C> and <C>[data-theme=&quot;dark&quot;]</C>. <C>@junco/tailwind</C> maps each one to a utility, so{" "}
            <C>--muted-foreground</C> becomes <C>text-muted-foreground</C>. Names follow shadcn/ui, so shadcn themes drop straight in.
          </P>
          <CodeBlock
            lang="css"
            title="globals.css"
            code={`@import "tailwindcss";
@import "@junco/tailwind";

:root { --primary: oklch(0.55 0.2 150); }
.dark { --primary: oklch(0.72 0.17 150); }`}
          />
          <P>
            Tokens also ship as a TypeScript object and as W3C design token JSON, for Figma and other tools:
          </P>
          <CodeBlock
            code={`import { tokens } from "@junco/tokens";
tokens.light.primary; // "oklch(0.55 0.2 260)"

// W3C (DTCG) JSON: @junco/tokens/tokens.json`}
          />
        </Section>

        <Section id="colors" title="Color tokens">
          <ColorTokenTable />
        </Section>

        <Section id="contrast" title="Contrast">
          <P>
            Every text and background pair Junco uses is checked by a test at 4.5:1 (WCAG AA) in both modes. If a token change breaks a
            pair, the build fails. Status colors have separate <C>-text</C> tokens for text on the page, because a solid amber that works
            as a fill can never pass as text on white.
          </P>
          <ContrastTable />
        </Section>

        <Section id="type" title="Type">
          <P>
            Geist for UI and headings, Geist Mono for code and numbers. <C>text-sm</C> (14px) is the UI default; body copy is{" "}
            <C>text-base</C>.
          </P>
          <TypeScaleTable />
        </Section>

        <Section id="shape" title="Space, shape and depth">
          <ScaleTable caption="Space, radius, shadow and layer tokens" prefixes={["spacing", "radius", "radius-", "shadow-", "z-"]} />
          <Note>Depth comes from borders. Shadows are only for floating things: menus, popovers, tooltips and toasts.</Note>
        </Section>

        <Section id="motion" title="Motion">
          <ScaleTable caption="Motion tokens" prefixes={["duration-", "ease-", "stagger", "motion-scale"]} />
          <P>
            Every duration is multiplied by <C>--motion-scale</C>, which the <C>data-motion</C> switch and{" "}
            <C>prefers-reduced-motion</C> turn down. See <a className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" href="/docs/dark-mode/">Dark mode and motion</a>.
          </P>
        </Section>
      </div>
      <Pager href="/docs/theming/" />
    </>
  );
}
