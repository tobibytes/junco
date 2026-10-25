import type { Metadata } from "next";
import Link from "next/link";
import { Pager } from "@/components/docs/pager";
import { C, DocHeader, Note, P, Section } from "@/components/docs/prose";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Introduction",
  description: "What Junco is, how it's built and how to use it.",
};

const cards = [
  { href: "/docs/installation/", title: "Install", body: "Next.js, Vite or plain HTML in a couple of minutes." },
  { href: "/docs/levels/", title: "The four levels", body: "Semantic classes, utilities, copy-in and installed components." },
  { href: "/docs/theming/", title: "Theming", body: "Change one variable, re-theme the app. Contrast checked." },
  { href: "/components/", title: "Components", body: "Every component with live previews and props." },
];

export default function IntroPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Introduction"
        description="A free, open source design system for React, Tailwind v4 and SwiftUI. Tokens, components, pages, motion and 3D."
      />
      <div className="mt-10 grid gap-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group grid gap-1 rounded-card border border-border bg-card p-4 transition-colors duration-fast ease-standard hover:border-input hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex items-center justify-between text-sm font-medium">
                {card.title}
                <ArrowRightIcon className="text-muted-foreground transition-transform duration-fast group-hover:translate-x-0.5" />
              </span>
              <span className="text-sm text-muted-foreground">{card.body}</span>
            </Link>
          ))}
        </div>

        <Section id="why" title="Why Junco">
          <P>
            Most UI libraries make you pick one way of working. daisyUI gives you classes but no accessible behavior. shadcn/ui gives
            you the source, but copied code drifts. HeroUI gives you polished components you can&apos;t easily fork. Junco gives you all
            of those, reading <strong>the same tokens</strong>, so you can mix them in one app and move between them as a project grows.
          </P>
          <ul className="grid gap-2 text-[15px] text-muted-foreground">
            {[
              "Four ways to use it from one set of tokens.",
              "Copied code that can still be updated with junco diff and junco update.",
              "Every text color pair is tested at 4.5:1 contrast in light and dark.",
              "Motion as a token-driven layer with one global switch that respects reduced motion.",
              "Built for AI agents: an MCP server, llms.txt and registry JSON.",
              "Everything free under MIT. No pro tier.",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="look" title="The look">
          <P>
            Clean and minimal, in the spirit of Linear and Vercel. Neutrals do almost all the work, and one accent,{" "}
            <C>--primary</C>, marks primary actions and the current item. Depth comes from borders, not shadows; shadows are only for
            floating things like menus and tooltips. Type sets the hierarchy. Cards and inputs get an 8px radius, small controls 6px,
            and spacing runs on a 4px scale.
          </P>
        </Section>

        <Section id="status" title="Status">
          <Note title="Early, moving fast">
            Junco is pre-1.0. Tokens, primitives and form controls are ready; overlays, data components, blocks, pages and templates are
            in progress. The roadmap lives in the repo under <C>docs/ROADMAP.md</C>.
          </Note>
        </Section>
      </div>
      <Pager href="/docs/" />
    </>
  );
}
