import * as React from "react";
import { cn } from "@junco/react";
import { AnimatedBeam, NumberTicker, Reveal } from "@junco/motion";
import { defaultIntegrations, defaultStats } from "./content";
import { BrandMark, Container, Section, SectionHeading } from "./layout";
import { Wordmark } from "./logo-cloud";

export interface StatItem {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface StatsBandProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  stats?: StatItem[];
  classNames?: { root?: string; value?: string; label?: string };
}

/** A row of big numbers that count up as they scroll in. */
export function StatsBand({ title, stats = defaultStats, className, classNames, ...props }: StatsBandProps) {
  return (
    <Section spacing="sm" className={cn("border-y border-border", classNames?.root, className)} {...props}>
      <Container>
        {title && <h2 className="mb-10 text-center text-sm font-medium text-muted-foreground">{title}</h2>}
        <Reveal as="dl" stagger className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-1 text-center">
              <dt className={cn("text-sm text-muted-foreground", classNames?.label)}>{s.label}</dt>
              <dd className={cn("text-4xl font-semibold tracking-tighter sm:text-5xl", classNames?.value)}>
                {s.prefix}
                <NumberTicker value={s.value} />
                {s.suffix}
              </dd>
            </div>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}

export interface IntegrationBeamsProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Tools on the left that feed into your product. Up to 6 look best. */
  integrations?: string[];
  /** The hub in the middle. Defaults to the brand mark. */
  hub?: React.ReactNode;
  classNames?: { root?: string; diagram?: string };
}

const Node = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative z-10 grid place-items-center rounded-card border border-border bg-card px-3 py-2 text-sm", className)}
    {...props}
  />
));
Node.displayName = "IntegrationNode";

/** A diagram of tools flowing into your product, with light traveling along the lines. */
export function IntegrationBeams({
  eyebrow = "Integrations",
  title = "Works with the tools you already use",
  description = "Orbit listens to your code, chat and design tools, so updates land in the right issue without anyone copying links around.",
  integrations = defaultIntegrations,
  hub,
  className,
  classNames,
  ...props
}: IntegrationBeamsProps) {
  const container = React.useRef<HTMLDivElement>(null);
  const hubRef = React.useRef<HTMLDivElement>(null);
  const outRef = React.useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: one ref per integration, so new refs only when the count changes
  const refs = React.useMemo(
    () => integrations.map(() => React.createRef<HTMLDivElement>()),
    [integrations.length],
  );

  return (
    <Section className={cn(classNames?.root, className)} {...props}>
      <Container>
        {title && <SectionHeading eyebrow={eyebrow} title={title} description={description} />}
        <Reveal
          ref={container}
          role="img"
          aria-label={`${integrations.join(", ")} connect to Orbit, which keeps your team up to date`}
          className={cn("relative mx-auto mt-14 grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-6 sm:mt-16", classNames?.diagram)}
        >
          <div className="grid gap-3 justify-self-start" aria-hidden>
            {integrations.map((name, i) => (
              <Node key={name} ref={refs[i]} className="text-muted-foreground">
                <Wordmark name={name} className="text-sm [&_svg]:size-4" />
              </Node>
            ))}
          </div>
          <Node ref={hubRef} aria-hidden className="size-20 rounded-[calc(var(--radius)*2)] shadow-float">
            {hub ?? <BrandMark className="size-10" />}
          </Node>
          <Node ref={outRef} aria-hidden className="justify-self-end px-4 py-3 text-muted-foreground">
            Your team
          </Node>
          {refs.map((ref, i) => (
            <AnimatedBeam
              key={i}
              containerRef={container}
              fromRef={ref}
              toRef={hubRef}
              curvature={(i - (refs.length - 1) / 2) * -14}
              delay={i * 0.35}
            />
          ))}
          <AnimatedBeam containerRef={container} fromRef={hubRef} toRef={outRef} delay={1.2} />
        </Reveal>
      </Container>
    </Section>
  );
}
