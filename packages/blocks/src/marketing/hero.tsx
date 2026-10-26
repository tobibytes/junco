import type * as React from "react";
import { Button, cn } from "@junco/react";
import { BorderBeam, MagneticButton, Reveal, TextReveal, Typewriter } from "@junco/motion";
import { defaultPrimaryAction, defaultSecondaryAction } from "./content";
import { ArrowRightIcon } from "./icons";
import { Container, type Action } from "./layout";
import { MarketingLink } from "./link";
import { ProductMock } from "./product-mock";

export interface HeroProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /**
   * - centered: headline and actions centered, media below
   * - split: text on the left, media on the right
   * - bold: oversized headline, rotating words, a lit-up product frame
   */
  variant?: "centered" | "split" | "bold";
  /** A small pill above the headline, e.g. a launch. */
  announcement?: { label: string; href: string; tag?: string } | null;
  /** Plain text so it can animate word by word. */
  title?: string;
  /** Words that cycle at the end of the title in the bold variant. */
  rotatingWords?: string[];
  description?: React.ReactNode;
  primaryAction?: Action | null;
  secondaryAction?: Action | null;
  /** Product screenshot or any visual. Defaults to the product mock; `null` hides it. */
  media?: React.ReactNode | null;
  /** Small print under the actions, e.g. "No card needed". */
  note?: React.ReactNode;
  /** Draw the faint grid and glow behind the hero. Default true. */
  hasBackdrop?: boolean;
  classNames?: { root?: string; title?: string; description?: string; actions?: string; media?: string };
}

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_100%)] opacity-70" />
      <div className="absolute -top-40 left-1/2 h-[36rem] w-[64rem] max-w-[200vw] -translate-x-1/2 rounded-pill [background:radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_18%,transparent),transparent)]" />
    </div>
  );
}

function Announcement({ label, href, tag = "New" }: { label: string; href: string; tag?: string }) {
  return (
    <MarketingLink
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-pill border border-border bg-surface/80 py-1 pr-3 pl-1 text-sm text-muted-foreground backdrop-blur",
        "transition-colors duration-fast ease-standard hover:border-border-strong hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
    >
      <span className="rounded-pill bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">{tag}</span>
      {label}
      <ArrowRightIcon className="size-3.5 transition-transform duration-fast ease-standard group-hover:translate-x-0.5" />
    </MarketingLink>
  );
}

/** The first thing on a landing page: announcement, headline, pitch, actions, product visual. */
export function Hero({
  variant = "centered",
  announcement = { label: "Roadmap timelines, rebuilt", href: "/changelog" },
  title = "Plan, build and ship in one quiet place",
  rotatingWords = ["startups", "design teams", "platform teams", "everyone"],
  description = "Orbit is the issue tracker for teams who'd rather be building. Fast, keyboard-first and synced with your code.",
  primaryAction = defaultPrimaryAction,
  secondaryAction = defaultSecondaryAction,
  media,
  note = "Free for up to 3 people. No card needed.",
  hasBackdrop = true,
  className,
  classNames,
  ...props
}: HeroProps) {
  const isSplit = variant === "split";
  const isBold = variant === "bold";
  const visual = media === undefined ? <ProductMock /> : media;

  const actions = (primaryAction || secondaryAction) && (
    <Reveal delay={240} className={cn("flex flex-wrap items-center gap-3", !isSplit && "justify-center", classNames?.actions)}>
      {primaryAction &&
        (isBold ? (
          <MagneticButton asChild size="lg" className="rounded-pill px-6">
            <MarketingLink href={primaryAction.href}>
              {primaryAction.label}
              <ArrowRightIcon className="size-4" />
            </MarketingLink>
          </MagneticButton>
        ) : (
          <Button asChild size="lg">
            <MarketingLink href={primaryAction.href}>
              {primaryAction.label}
              <ArrowRightIcon className="size-4" />
            </MarketingLink>
          </Button>
        ))}
      {secondaryAction && (
        <Button asChild size="lg" variant="outline" className={cn(isBold && "rounded-pill px-6")}>
          <MarketingLink href={secondaryAction.href}>{secondaryAction.label}</MarketingLink>
        </Button>
      )}
    </Reveal>
  );

  return (
    <section className={cn("relative isolate overflow-hidden", classNames?.root, className)} {...props}>
      {hasBackdrop && <Backdrop />}
      <Container
        className={cn(
          "pt-16 pb-16 sm:pt-24 sm:pb-24",
          isSplit && "sm:pb-12 lg:pb-16",
          isSplit && "grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-10",
          isBold && "pt-20 sm:pt-32",
        )}
      >
        <div className={cn("flex flex-col gap-6", isSplit ? "items-start" : "mx-auto max-w-3xl items-center text-center", isBold && "max-w-4xl")}>
          {announcement && (
            <Reveal>
              <Announcement {...announcement} />
            </Reveal>
          )}
          <h1
            className={cn(
              "font-semibold tracking-tighter text-balance",
              isBold
                ? "text-5xl leading-[1.02] sm:text-6xl lg:text-7xl"
                : isSplit
                  ? "text-4xl leading-[1.08] sm:text-5xl lg:text-[3.5rem]"
                  : "text-4xl leading-[1.08] sm:text-5xl lg:text-6xl",
              classNames?.title,
            )}
          >
            <TextReveal>{title}</TextReveal>
            {isBold && rotatingWords.length > 0 && (
              <>
                {" "}
                <span className="text-muted-foreground">
                  for <Typewriter words={rotatingWords} className="text-primary" />
                </span>
              </>
            )}
          </h1>
          {description && (
            <Reveal
              as="p"
              delay={120}
              className={cn(
                "max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl",
                isSplit && "max-w-xl",
                classNames?.description,
              )}
            >
              {description}
            </Reveal>
          )}
          {actions}
          {note && (
            <Reveal as="p" delay={320} className="text-sm text-muted-foreground">
              {note}
            </Reveal>
          )}
        </div>
        {visual && (
          <Reveal
            delay={isSplit ? 200 : 360}
            distance={32}
            className={cn("relative", !isSplit && "mx-auto mt-16 max-w-5xl sm:mt-20", classNames?.media)}
          >
            {isBold ? (
              <div className="relative rounded-[calc(var(--radius)*2)] border border-border bg-surface/60 p-1.5 sm:p-2">
                {visual}
                <BorderBeam />
              </div>
            ) : (
              visual
            )}
            {!isSplit && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -bottom-px h-1/3 bg-linear-to-t from-background to-transparent"
              />
            )}
          </Reveal>
        )}
      </Container>
    </section>
  );
}
