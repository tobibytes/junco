import type * as React from "react";
import { cn } from "@junco/react";
import { Reveal, SpotlightCard } from "@junco/motion";
import { defaultFeatures, defaultSpotlight, type Feature, type SpotlightItem } from "./content";
import { CheckIcon } from "./icons";
import { Container, Section, SectionHeading } from "./layout";
import { ProductMock } from "./product-mock";

export interface FeatureGridProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  features?: Feature[];
  /**
   * - lines: a hairline grid, no boxes (Linear-style). The default.
   * - cards: each feature in a card with a pointer spotlight.
   * - plain: icon and text only, lots of air.
   */
  variant?: "lines" | "cards" | "plain";
  columns?: 2 | 3;
  classNames?: { root?: string; grid?: string; item?: string; icon?: string };
}

function FeatureIcon({ icon: Icon, className }: { icon?: Feature["icon"]; className?: string }) {
  if (!Icon) return null;
  return (
    <span className={cn("grid size-9 place-items-center rounded-control border border-border bg-surface text-foreground", className)}>
      <Icon className="size-[18px]" />
    </span>
  );
}

/** What the product does, in a grid. */
export function FeatureGrid({
  eyebrow = "Features",
  title = "Everything a product team needs. Nothing it doesn't.",
  description = "Orbit replaces the tracker, the roadmap spreadsheet and the standup doc with one fast, quiet tool.",
  features = defaultFeatures,
  variant = "lines",
  columns = 3,
  className,
  classNames,
  ...props
}: FeatureGridProps) {
  const cols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  // Feature titles sit one level under the section title, or at h2 when there's no section title.
  const H = title ? "h3" : "h2";
  return (
    <Section id="features" className={cn(classNames?.root, className)} {...props}>
      <Container>
        {title && <SectionHeading eyebrow={eyebrow} title={title} description={description} />}
        <Reveal
          as="ul"
          stagger
          className={cn(
            "mt-14 grid sm:mt-16",
            cols,
            variant === "lines" &&
              "overflow-hidden rounded-card border border-border [&>li]:border-border max-sm:[&>li+li]:border-t sm:gap-px sm:bg-border",
            variant === "cards" && "gap-4",
            variant === "plain" && "gap-x-10 gap-y-12",
            classNames?.grid,
          )}
        >
          {features.map((feature) => {
            const body = (
              <>
                <FeatureIcon icon={feature.icon} className={classNames?.icon} />
                <H className="mt-5 text-base font-semibold tracking-tight">{feature.title}</H>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </>
            );
            return (
              <li key={feature.title} className={cn(variant === "lines" && "bg-background p-6 sm:p-8", classNames?.item)}>
                {variant === "cards" ? <SpotlightCard className="h-full p-6">{body}</SpotlightCard> : body}
              </li>
            );
          })}
        </Reveal>
      </Container>
    </Section>
  );
}

export interface FeatureSpotlightProps extends React.HTMLAttributes<HTMLElement> {
  items?: SpotlightItem[];
  classNames?: { root?: string; item?: string; media?: string };
}

/** Big feature stories, text and visual side by side, alternating sides. */
export function FeatureSpotlight({ items = defaultSpotlight, className, classNames, ...props }: FeatureSpotlightProps) {
  return (
    <Section className={cn(classNames?.root, className)} {...props}>
      <Container className="grid gap-24 sm:gap-32">
        {items.map((item, i) => (
          <div
            key={item.title}
            className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-16", classNames?.item)}
          >
            <Reveal className={cn("flex flex-col gap-4", i % 2 === 1 && "lg:order-2")}>
              <p className="text-sm font-medium text-primary">{item.eyebrow}</p>
              <h2 className="text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">{item.title}</h2>
              <p className="text-base text-pretty text-muted-foreground sm:text-lg">{item.description}</p>
              {item.bullets && (
                <ul className="mt-2 grid gap-3">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill bg-primary/12 text-primary">
                        <CheckIcon className="size-3" strokeWidth={2.5} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
            <Reveal delay={120} distance={24} className={cn("min-w-0", classNames?.media)}>
              {item.media ?? <ProductMock view={i % 2 === 0 ? "roadmap" : "activity"} />}
            </Reveal>
          </div>
        ))}
      </Container>
    </Section>
  );
}
