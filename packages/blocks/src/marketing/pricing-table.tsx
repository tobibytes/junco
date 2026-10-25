import * as React from "react";
import { Badge, Button, cn, Tabs, TabsContent, TabsList, TabsTrigger } from "@junco/react";
import { BorderBeam, Reveal } from "@junco/motion";
import { defaultComparison, defaultPlans, type ComparisonGroup, type PricingPlan } from "./content";
import { CheckIcon, MinusIcon } from "./icons";
import { Container, Section, SectionHeading } from "./layout";
import { MarketingLink } from "./link";

export type Billing = "monthly" | "yearly";

export interface PricingTableProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  plans?: PricingPlan[];
  /** Controlled billing period. */
  billing?: Billing;
  defaultBilling?: Billing;
  onBillingChange?: (billing: Billing) => void;
  /** Shown next to "Yearly", e.g. "Save 17%". Computed from the plans when omitted. */
  yearlyNote?: string | null;
  currency?: string;
  /** Use h1 for the title on a dedicated pricing page. Default 2. */
  headingLevel?: 1 | 2;
  classNames?: { root?: string; grid?: string; card?: string; highlighted?: string };
}

function yearlySaving(plans: PricingPlan[]) {
  const ratios = plans
    .filter((p) => p.price.monthly && p.price.yearly)
    .map((p) => 1 - (p.price.yearly as number) / (p.price.monthly as number));
  if (!ratios.length) return null;
  return `Save ${Math.round(Math.max(...ratios) * 100)}%`;
}

function Price({ plan, billing, currency }: { plan: PricingPlan; billing: Billing; currency: string }) {
  const value = plan.price[billing];
  const amount =
    value === null
      ? "Custom"
      : new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
  // Two fixed caption lines keep every card's button at the same height.
  const unit = value === null ? "Volume pricing" : (plan.unit ?? "per seat / month");
  const note =
    value === null ? "Annual contract" : value === 0 ? "No card needed" : billing === "yearly" ? "billed yearly" : "billed monthly";
  return (
    <div>
      <p className="text-4xl font-semibold tracking-tighter tabular-nums">{amount}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {unit}
        <br />
        {note}
      </p>
    </div>
  );
}

function PlanCard({
  plan,
  billing,
  currency,
  headingLevel,
  className,
  highlightedClassName,
}: {
  plan: PricingPlan;
  billing: Billing;
  currency: string;
  headingLevel: 2 | 3;
  className?: string;
  highlightedClassName?: string;
}) {
  const titleId = React.useId();
  const H = `h${headingLevel}` as "h3";
  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "relative flex flex-col rounded-card border border-border bg-card p-6",
        plan.isHighlighted && "border-primary/40 bg-surface ring-1 ring-primary/30",
        plan.isHighlighted && highlightedClassName,
        className,
      )}
    >
      {plan.isHighlighted && <BorderBeam />}
      <div className="flex items-center justify-between gap-2">
        <H id={titleId} className="text-base font-semibold">
          {plan.name}
        </H>
        {plan.badge && <Badge color={plan.isHighlighted ? "primary" : "neutral"}>{plan.badge}</Badge>}
      </div>
      <p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.description}</p>
      <div className="mt-6">
        <Price plan={plan} billing={billing} currency={currency} />
      </div>
      <Button asChild variant={plan.isHighlighted ? "solid" : "outline"} className="mt-6 w-full">
        <MarketingLink href={plan.cta.href}>
          {plan.cta.label}{" "}
          <span className="sr-only">on the {plan.name} plan</span>
        </MarketingLink>
      </Button>
      <ul className="mt-8 grid gap-3 border-t border-border pt-6 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.25} />
            {f}
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Plans side by side with a monthly/yearly switch. The highlighted plan gets a ring and a moving
 * border light. Each period is its own tab panel, so screen readers hear which prices they're on.
 */
export function PricingTable({
  eyebrow = "Pricing",
  title = "Simple pricing that scales with your team",
  description = "Start free. Upgrade when you need cycles, insights and SSO. Cancel anytime.",
  plans = defaultPlans,
  billing: billingProp,
  defaultBilling = "yearly",
  onBillingChange,
  yearlyNote,
  currency = "USD",
  headingLevel = 2,
  className,
  classNames,
  ...props
}: PricingTableProps) {
  const [uncontrolled, setUncontrolled] = React.useState<Billing>(defaultBilling);
  const billing = billingProp ?? uncontrolled;
  const setBilling = (value: string) => {
    const next = value as Billing;
    if (billingProp === undefined) setUncontrolled(next);
    onBillingChange?.(next);
  };
  const note = yearlyNote === undefined ? yearlySaving(plans) : yearlyNote;
  const cols = plans.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <Section id="pricing" className={cn(classNames?.root, className)} {...props}>
      <Container>
        {title && <SectionHeading eyebrow={eyebrow} title={title} description={description} level={headingLevel} />}
        <Tabs value={billing} onValueChange={setBilling} variant="segmented" className="mt-10 flex flex-col items-center">
          <TabsList aria-label="Billing period">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              {note && <span className="ml-1 text-xs font-medium text-primary">{note}</span>}
            </TabsTrigger>
          </TabsList>
          {(["monthly", "yearly"] as const).map((period) => (
            <TabsContent key={period} value={period} className="mt-10 w-full">
              <Reveal stagger className={cn("grid gap-4", cols, classNames?.grid)}>
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    billing={period}
                    currency={currency}
                    headingLevel={title && headingLevel === 2 ? 3 : 2}
                    className={classNames?.card}
                    highlightedClassName={classNames?.highlighted}
                  />
                ))}
              </Reveal>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </Section>
  );
}

export interface PricingComparisonProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  plans?: PricingPlan[];
  groups?: ComparisonGroup[];
  classNames?: { root?: string; table?: string };
}

function Cell({ value }: { value: boolean | string | undefined }) {
  if (value === true)
    return (
      <>
        <CheckIcon className="mx-auto size-4 text-primary" strokeWidth={2.25} />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false || value === undefined)
    return (
      <>
        <MinusIcon className="mx-auto size-4 text-muted-foreground" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span>{value}</span>;
}

/** Every feature by plan, in a real table. Scrolls sideways on phones with the first column pinned. */
export function PricingComparison({
  title = "Compare plans",
  plans = defaultPlans,
  groups = defaultComparison,
  className,
  classNames,
  ...props
}: PricingComparisonProps) {
  return (
    <Section className={cn(classNames?.root, className)} {...props}>
      <Container>
        {title && <h2 className="text-center text-2xl font-semibold tracking-tighter sm:text-3xl">{title}</h2>}
        <div className="relative mt-10 overflow-x-auto rounded-card border border-border" tabIndex={0} role="region" aria-label="Plan comparison">
          <table className={cn("w-full min-w-[40rem] border-collapse text-sm", classNames?.table)}>
            <caption className="sr-only">Features included in each plan</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="sticky left-0 bg-card p-4 text-left font-medium text-muted-foreground">
                  Feature
                </th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className={cn("bg-card p-4 text-center font-semibold", p.isHighlighted && "text-primary")}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.group}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={plans.length + 1}
                    className="sticky left-0 bg-muted px-4 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    {g.group}
                  </th>
                </tr>
                {g.rows.map((row) => (
                  <tr key={row.label} className="border-t border-border">
                    <th scope="row" className="sticky left-0 bg-card p-4 text-left font-normal">
                      {row.label}
                    </th>
                    {plans.map((p) => (
                      <td key={p.id} className="bg-card p-4 text-center text-muted-foreground">
                        <Cell value={row.values[p.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Container>
    </Section>
  );
}
