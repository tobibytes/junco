// Marketing blocks and pages. Every block takes typed props with realistic defaults (a product
// called Orbit), className + classNames, and every page takes `variant` and `slots`.

// Pages
export { LandingPage, type LandingPageProps, type LandingSlots } from "./landing-page";
export { PricingPage, type PricingPageProps, type PricingSlots } from "./pricing-page";
export { ChangelogPage, SubscribeForm, type ChangelogPageProps, type ChangelogSlots, type SubscribeFormProps } from "./changelog-page";
export { BlogIndexPage, BlogPostPage, type BlogIndexPageProps, type BlogPostPageProps, type BlogSlots } from "./blog-pages";
export {
  NotFoundPage,
  ServerErrorPage,
  WaitlistPage,
  type NotFoundPageProps,
  type ServerErrorPageProps,
  type StatusSlots,
  type WaitlistPageProps,
} from "./status-pages";

// Blocks
export { SiteHeader, type SiteHeaderProps } from "./site-header";
export { SiteFooter, type SiteFooterProps } from "./site-footer";
export { Hero, type HeroProps } from "./hero";
export { LogoCloud, Wordmark, type Logo, type LogoCloudProps } from "./logo-cloud";
export { FeatureGrid, FeatureSpotlight, type FeatureGridProps, type FeatureSpotlightProps } from "./features";
export { Testimonials, TestimonialCard, type TestimonialsProps } from "./testimonials";
export {
  PricingTable,
  PricingComparison,
  type Billing,
  type PricingComparisonProps,
  type PricingTableProps,
} from "./pricing-table";
export { Faq, type FaqProps } from "./faq";
export { CtaSection, type CtaSectionProps } from "./cta-section";
export { StatsBand, IntegrationBeams, type IntegrationBeamsProps, type StatItem, type StatsBandProps } from "./stats-band";
export { ChangelogEntry, BlogCard, formatDate, type BlogCardProps, type ChangelogEntryProps } from "./editorial";

// Building pieces
export { Container, Section, SectionHeading, BrandMark, type Action, type Brand, type NavLink, type SectionHeadingProps } from "./layout";
export { PageShell, type PageShellProps } from "./page-shell";
export { ProductMock, type ProductMockProps } from "./product-mock";
export { CoverArt, type CoverArtProps } from "./cover-art";
export { LinkProvider, MarketingLink, type LinkComponentProps } from "./link";

// Default content, to extend instead of starting from scratch
export {
  defaultBrand,
  defaultChangelog,
  defaultComparison,
  defaultFaq,
  defaultFeatures,
  defaultFooterColumns,
  defaultIntegrations,
  defaultLogos,
  defaultNav,
  defaultPlans,
  defaultPostBody,
  defaultPosts,
  defaultSpotlight,
  defaultStats,
  defaultTestimonials,
  type BlogAuthor,
  type BlogPost,
  type ChangelogItem,
  type ComparisonGroup,
  type FaqItem,
  type Feature,
  type FooterColumn,
  type PricingPlan,
  type SpotlightItem,
  type Testimonial,
} from "./content";
