import * as React from "react";
import { renderSlot, type Slots } from "../lib/slots";
import { defaultComparison, type ComparisonGroup, type FaqItem, type PricingPlan } from "./content";
import { CtaSection, type CtaSectionProps } from "./cta-section";
import { Faq, type FaqProps } from "./faq";
import type { Brand, NavLink } from "./layout";
import { LogoCloud, type LogoCloudProps } from "./logo-cloud";
import { PageShell } from "./page-shell";
import { PricingComparison, PricingTable, type Billing, type PricingComparisonProps, type PricingTableProps } from "./pricing-table";
import { SiteFooter, type SiteFooterProps } from "./site-footer";
import { SiteHeader, type SiteHeaderProps } from "./site-header";

export type PricingSlots = {
  header: SiteHeaderProps;
  plans: PricingTableProps;
  logos: LogoCloudProps;
  comparison: PricingComparisonProps;
  faq: FaqProps;
  cta: CtaSectionProps;
  footer: SiteFooterProps;
};

export interface PricingPageProps {
  /** "full" adds the comparison table and customer logos; "simple" is plans + FAQ. */
  variant?: "full" | "simple";
  brand?: Brand;
  nav?: NavLink[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  plans?: PricingPlan[];
  comparison?: ComparisonGroup[];
  faq?: FaqItem[];
  defaultBilling?: Billing;
  onBillingChange?: (billing: Billing) => void;
  currency?: string;
  slots?: Slots<PricingSlots>;
  className?: string;
}

/** A pricing page: plans with a billing switch, full comparison, FAQ, closing pitch. */
export function PricingPage({
  variant = "full",
  brand,
  nav,
  title = "Pricing that grows with your team",
  description = "Start free, upgrade when you need more. Every paid plan has a 14-day trial, no card needed.",
  plans,
  comparison = defaultComparison,
  faq,
  defaultBilling,
  onBillingChange,
  currency,
  slots,
  className,
}: PricingPageProps) {
  return (
    <PageShell
      className={className}
      header={renderSlot(slots, "header", SiteHeader, { brand, links: nav, currentHref: "/pricing" })}
      footer={renderSlot(slots, "footer", SiteFooter, { brand })}
    >
      {renderSlot(slots, "plans", PricingTable, {
        title,
        description,
        plans,
        defaultBilling,
        onBillingChange,
        currency,
        headingLevel: 1,
        eyebrow: null,
        className: "pt-16 sm:pt-20",
      })}
      {variant === "full" && renderSlot(slots, "logos", LogoCloud, { variant: "grid", title: "Used by more than 12,000 teams, including" })}
      {variant === "full" && renderSlot(slots, "comparison", PricingComparison, { plans, groups: comparison })}
      {renderSlot(slots, "faq", Faq, { items: faq, title: "Pricing questions" })}
      {renderSlot(slots, "cta", CtaSection, {})}
    </PageShell>
  );
}
