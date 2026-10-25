import * as React from "react";
import { renderSlot, type Slots } from "../lib/slots";
import type { Feature, FaqItem, FooterColumn, PricingPlan, SpotlightItem, Testimonial } from "./content";
import { CtaSection, type CtaSectionProps } from "./cta-section";
import { Faq, type FaqProps } from "./faq";
import { FeatureGrid, FeatureSpotlight, type FeatureGridProps, type FeatureSpotlightProps } from "./features";
import { Hero, type HeroProps } from "./hero";
import type { Brand, NavLink } from "./layout";
import { LogoCloud, type Logo, type LogoCloudProps } from "./logo-cloud";
import { PageShell } from "./page-shell";
import { PricingTable, type PricingTableProps } from "./pricing-table";
import { SiteFooter, type SiteFooterProps } from "./site-footer";
import { SiteHeader, type SiteHeaderProps } from "./site-header";
import { IntegrationBeams, StatsBand, type IntegrationBeamsProps, type StatItem, type StatsBandProps } from "./stats-band";
import { Testimonials, type TestimonialsProps } from "./testimonials";

export type LandingSlots = {
  header: SiteHeaderProps;
  hero: HeroProps;
  logos: LogoCloudProps;
  stats: StatsBandProps;
  features: FeatureGridProps;
  spotlight: FeatureSpotlightProps;
  integrations: IntegrationBeamsProps;
  testimonials: TestimonialsProps;
  pricing: PricingTableProps;
  faq: FaqProps;
  cta: CtaSectionProps;
  footer: SiteFooterProps;
};

export interface LandingPageProps {
  /**
   * - minimal: text hero, feature list, closing pitch. Fast to read.
   * - product: split hero with the product, customers, feature stories, pricing, FAQ.
   * - bold: oversized type, motion, live numbers and an integrations diagram.
   */
  variant?: "minimal" | "product" | "bold";
  brand?: Brand;
  nav?: NavLink[];
  /** Overrides for the hero (title, description, actions, media...). */
  hero?: Partial<HeroProps>;
  logos?: Logo[];
  stats?: StatItem[];
  features?: Feature[];
  spotlight?: SpotlightItem[];
  integrations?: string[];
  testimonials?: Testimonial[];
  plans?: PricingPlan[];
  faq?: FaqItem[];
  cta?: Partial<CtaSectionProps>;
  footerColumns?: FooterColumn[];
  /** Replace any section with your own component, or pass `null` to drop it. */
  slots?: Slots<LandingSlots>;
  className?: string;
}

/** A full landing page assembled from Junco marketing blocks. Every section is overridable. */
export function LandingPage({
  variant = "product",
  brand,
  nav,
  hero,
  logos,
  stats,
  features,
  spotlight,
  integrations,
  testimonials,
  plans,
  faq,
  cta,
  footerColumns,
  slots,
  className,
}: LandingPageProps) {
  const header = renderSlot(slots, "header", SiteHeader, { brand, links: nav });
  const footer = renderSlot(slots, "footer", SiteFooter, { brand, columns: footerColumns });

  if (variant === "minimal") {
    return (
      <PageShell header={header} footer={footer} className={className}>
        {renderSlot(slots, "hero", Hero, { variant: "centered", media: null, ...hero })}
        {renderSlot(slots, "features", FeatureGrid, { features, variant: "plain", eyebrow: null, title: null })}
        {renderSlot(slots, "cta", CtaSection, { variant: "simple", ...cta })}
      </PageShell>
    );
  }

  if (variant === "bold") {
    return (
      <PageShell header={header} footer={footer} className={className}>
        {renderSlot(slots, "hero", Hero, { variant: "bold", ...hero })}
        {renderSlot(slots, "logos", LogoCloud, { logos, variant: "marquee" })}
        {renderSlot(slots, "stats", StatsBand, { stats })}
        {renderSlot(slots, "features", FeatureGrid, { features, variant: "cards" })}
        {renderSlot(slots, "integrations", IntegrationBeams, { integrations })}
        {renderSlot(slots, "testimonials", Testimonials, { testimonials, variant: "marquee" })}
        {renderSlot(slots, "faq", Faq, { items: faq, variant: "centered" })}
        {renderSlot(slots, "cta", CtaSection, { variant: "card", ...cta })}
      </PageShell>
    );
  }

  return (
    <PageShell header={header} footer={footer} className={className}>
      {renderSlot(slots, "hero", Hero, { variant: "split", ...hero })}
      {renderSlot(slots, "logos", LogoCloud, { logos, variant: "grid" })}
      {renderSlot(slots, "features", FeatureGrid, { features, variant: "lines" })}
      {renderSlot(slots, "spotlight", FeatureSpotlight, { items: spotlight })}
      {renderSlot(slots, "testimonials", Testimonials, { testimonials, variant: "grid" })}
      {renderSlot(slots, "pricing", PricingTable, { plans })}
      {renderSlot(slots, "faq", Faq, { items: faq })}
      {renderSlot(slots, "cta", CtaSection, { variant: "card", ...cta })}
    </PageShell>
  );
}
