import * as React from "react";
import { Button, cn } from "junco";
import { BorderBeam, Reveal } from "@junco/motion";
import { defaultPrimaryAction, defaultSecondaryAction } from "./content";
import { ArrowRightIcon } from "./icons";
import { Container, Section, type Action } from "./layout";
import { MarketingLink } from "./link";

export interface CtaSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  primaryAction?: Action | null;
  secondaryAction?: Action | null;
  /**
   * - card: a bordered panel with a soft glow and border light. The default.
   * - simple: centered text, no panel.
   * - split: text left, actions right.
   */
  variant?: "card" | "simple" | "split";
  classNames?: { root?: string; panel?: string; title?: string };
}

/** The closing pitch near the end of a page. */
export function CtaSection({
  title = "Give your team a calmer way to ship",
  description = "Set up in minutes. Import from Jira, Linear or GitHub Issues in one click.",
  primaryAction = defaultPrimaryAction,
  secondaryAction = defaultSecondaryAction,
  variant = "card",
  className,
  classNames,
  ...props
}: CtaSectionProps) {
  const actions = (
    <div className={cn("flex flex-wrap gap-3", variant !== "split" && "justify-center")}>
      {primaryAction && (
        <Button asChild size="lg">
          <MarketingLink href={primaryAction.href}>
            {primaryAction.label}
            <ArrowRightIcon className="size-4" />
          </MarketingLink>
        </Button>
      )}
      {secondaryAction && (
        <Button asChild size="lg" variant="outline">
          <MarketingLink href={secondaryAction.href}>{secondaryAction.label}</MarketingLink>
        </Button>
      )}
    </div>
  );
  const text = (
    <div className={cn("flex flex-col gap-3", variant !== "split" && "items-center text-center")}>
      <h2 className={cn("max-w-2xl text-3xl font-semibold tracking-tighter text-balance sm:text-4xl", classNames?.title)}>{title}</h2>
      {description && <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  );

  return (
    <Section className={cn(classNames?.root, className)} {...props}>
      <Container>
        <Reveal
          className={cn(
            "relative isolate flex flex-col gap-8",
            variant === "card" &&
              "overflow-hidden rounded-[calc(var(--radius)*2)] border border-border bg-card px-6 py-16 sm:px-12 sm:py-20",
            variant === "split" && "rounded-[calc(var(--radius)*2)] border border-border bg-card p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between",
            classNames?.panel,
          )}
        >
          {variant === "card" && (
            <>
              <div
                aria-hidden
                className="absolute inset-x-0 -bottom-1/2 -z-10 mx-auto h-full max-w-3xl rounded-pill [background:radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_16%,transparent),transparent)]"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]"
              />
              <BorderBeam />
            </>
          )}
          {text}
          {actions}
        </Reveal>
      </Container>
    </Section>
  );
}
