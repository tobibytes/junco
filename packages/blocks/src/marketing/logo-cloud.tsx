import * as React from "react";
import { cn } from "junco";
import { Marquee, Reveal } from "@junco/motion";
import { createRandom } from "../lib/fake";
import { defaultLogos } from "./content";
import { Container } from "./layout";

export type Logo = string | { name: string; logo: React.ReactNode };

export interface LogoCloudProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  /** Names render as simple wordmarks; pass `{ name, logo }` for real logos. */
  logos?: Logo[];
  /** "marquee" scrolls endlessly (still with motion off); "grid" sits in rows. Default "marquee". */
  variant?: "marquee" | "grid";
  classNames?: { root?: string; title?: string; logo?: string };
}

/** A stand-in wordmark: a small geometric glyph + the name, so fake logos look intentional. */
export function Wordmark({ name, className }: { name: string; className?: string }) {
  const r = createRandom([...name].reduce((a, c) => a + c.charCodeAt(0), 0));
  const glyph = r.int(0, 3);
  return (
    <span className={cn("inline-flex items-center gap-2 text-lg font-semibold tracking-tight whitespace-nowrap", className)}>
      <svg viewBox="0 0 20 20" className="size-5" aria-hidden focusable={false}>
        {glyph === 0 && <circle cx="10" cy="10" r="8" fill="currentColor" />}
        {glyph === 1 && <rect x="2" y="2" width="16" height="16" rx="4" fill="currentColor" />}
        {glyph === 2 && <path d="M10 1 19 18H1z" fill="currentColor" />}
        {glyph === 3 && (
          <>
            <circle cx="7" cy="10" r="6" fill="currentColor" />
            <circle cx="13" cy="10" r="6" fill="currentColor" opacity="0.5" />
          </>
        )}
      </svg>
      {name}
    </span>
  );
}

/** "Trusted by" logos under a hero. */
export function LogoCloud({
  title = "Trusted by fast-moving teams at",
  logos = defaultLogos,
  variant = "marquee",
  className,
  classNames,
  ...props
}: LogoCloudProps) {
  const items = logos.map((logo) => {
    const name = typeof logo === "string" ? logo : logo.name;
    return (
      <li key={name} className={cn("flex items-center text-muted-foreground", classNames?.logo)}>
        {typeof logo === "string" ? <Wordmark name={logo} /> : <span role="img" aria-label={name}>{logo.logo}</span>}
      </li>
    );
  });

  return (
    <section aria-label="Customers" className={cn("py-12 sm:py-16", classNames?.root, className)} {...props}>
      <Container>
        {title && <p className={cn("mb-8 text-center text-sm text-muted-foreground", classNames?.title)}>{title}</p>}
        {variant === "marquee" ? (
          <Marquee duration={45} gap="3.5rem">
            <ul className="flex shrink-0 items-center gap-14 [[data-static]_&]:shrink [[data-static]_&]:flex-wrap [[data-static]_&]:justify-center [[data-static]_&]:gap-y-8">{items}</ul>
          </Marquee>
        ) : (
          <Reveal as="ul" className="mx-auto grid max-w-4xl grid-cols-2 place-items-center gap-x-8 gap-y-8 sm:grid-cols-4">
            {items}
          </Reveal>
        )}
      </Container>
    </section>
  );
}
