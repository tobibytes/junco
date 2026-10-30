import type * as React from "react";
import { FAKE_NOW } from "../lib/fake";
import {
  ChartIcon,
  GitBranchIcon,
  LayersIcon,
  ShieldIcon,
  SparklesIcon,
  ZapIcon,
  type IconComponent,
} from "./icons";
import type { Action, Brand, NavLink } from "./layout";

/**
 * Default content for the marketing blocks: a believable product called Orbit, a calm issue
 * tracker. Every block and page falls back to this when you don't pass data.
 */

export const defaultBrand: Brand = { name: "Orbit", href: "/" };

export const defaultNav: NavLink[] = [
  { label: "Product", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Changelog", href: "/changelog" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
];

export const defaultPrimaryAction: Action = { label: "Start for free", href: "/signup" };
export const defaultSecondaryAction: Action = { label: "Book a demo", href: "/demo" };

export interface Feature {
  icon?: IconComponent;
  title: string;
  description: string;
}

export const defaultFeatures: Feature[] = [
  { icon: ZapIcon, title: "Fast by default", description: "Every view loads in under 100ms and works offline. No spinners between you and the work." },
  { icon: LayersIcon, title: "Cycles and roadmaps", description: "Plan two weeks or two quarters. Issues roll up into projects, projects into goals." },
  { icon: GitBranchIcon, title: "Built around Git", description: "Branches, pull requests and deploys update issues for you, so status is never stale." },
  { icon: SparklesIcon, title: "AI that stays quiet", description: "Triage, duplicate detection and summaries that suggest, never shout." },
  { icon: ChartIcon, title: "Insights you'll read", description: "Velocity, cycle time and scope creep on one calm page, ready for the Monday sync." },
  { icon: ShieldIcon, title: "Secure from day one", description: "SSO, SCIM, audit logs and data residency in the EU or US. SOC 2 Type II." },
];

export interface SpotlightItem {
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  /** The visual. Defaults to the product mock. */
  media?: React.ReactNode;
}

export const defaultSpotlight: SpotlightItem[] = [
  {
    eyebrow: "Plan",
    title: "A roadmap the whole company can read",
    description: "Turn a pile of requests into a plan in an afternoon. Drag projects across quarters and Orbit keeps dates and owners honest.",
    bullets: ["Timeline and board views", "Dependencies that warn before they slip", "Share a read-only link with anyone"],
  },
  {
    eyebrow: "Build",
    title: "Status updates that write themselves",
    description: "Orbit watches your repos. Open a branch and the issue moves to In progress; merge it and it's Done.",
    bullets: ["GitHub and GitLab", "Automatic cycle rollover", "Slack digests your team won't mute"],
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  avatar?: string;
}

export const defaultTestimonials: Testimonial[] = [
  { quote: "We moved 40 engineers over in a weekend. Nobody asked to go back, which has never happened with a tool change.", name: "Maya Chen", title: "VP Engineering, Northwind" },
  { quote: "It's the first tracker our designers open on purpose.", name: "Leo Okafor", title: "Design Lead, Globex" },
  { quote: "Cycle time dropped from nine days to four. Mostly because we can finally see where work waits.", name: "Amara Adeyemi", title: "Head of Product, Hooli" },
  { quote: "The keyboard shortcuts alone saved me an hour a week. The Git sync saved our standups.", name: "Kenji Nakamura", title: "Staff Engineer, Initech" },
  { quote: "Setup took twelve minutes. I timed it because I didn't believe it.", name: "Ines Costa", title: "CTO, Pied Piper" },
  { quote: "Calm is the right word. It shows you what matters and gets out of the way.", name: "Ravi Patel", title: "Engineering Manager, Umbrella" },
];

export const defaultLogos = ["Northwind", "Globex", "Initech", "Umbrella", "Hooli", "Pied Piper", "Stark Labs", "Wonka"];

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  /** Per seat per month. `null` means "talk to us". */
  price: { monthly: number | null; yearly: number | null };
  /** What follows the price. Default "per seat / month". */
  unit?: string;
  features: string[];
  cta: Action;
  isHighlighted?: boolean;
  badge?: string;
}

export const defaultPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "For side projects and small teams getting started.",
    price: { monthly: 0, yearly: 0 },
    unit: "forever",
    features: ["Up to 3 members", "Unlimited issues", "GitHub sync", "7-day history"],
    cta: { label: "Start for free", href: "/signup" },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that ship every week.",
    price: { monthly: 12, yearly: 10 },
    features: ["Unlimited members", "Cycles and roadmaps", "Insights", "AI triage", "Unlimited history"],
    cta: { label: "Start 14-day trial", href: "/signup?plan=pro" },
    isHighlighted: true,
    badge: "Most popular",
  },
  {
    id: "business",
    name: "Business",
    description: "For companies with many teams and real security needs.",
    price: { monthly: 24, yearly: 20 },
    features: ["Everything in Pro", "SSO and SCIM", "Audit log", "Private teams", "Priority support"],
    cta: { label: "Start 14-day trial", href: "/signup?plan=business" },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs.",
    price: { monthly: null, yearly: null },
    features: ["Everything in Business", "Data residency", "Custom contract and SLA", "Dedicated success manager"],
    cta: { label: "Talk to sales", href: "/contact" },
  },
];

export interface ComparisonGroup {
  group: string;
  rows: { label: string; values: Record<string, boolean | string> }[];
}

export const defaultComparison: ComparisonGroup[] = [
  {
    group: "Core",
    rows: [
      { label: "Members", values: { free: "3", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" } },
      { label: "Issues and projects", values: { free: true, pro: true, business: true, enterprise: true } },
      { label: "Cycles and roadmaps", values: { free: false, pro: true, business: true, enterprise: true } },
      { label: "History", values: { free: "7 days", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" } },
    ],
  },
  {
    group: "Automation",
    rows: [
      { label: "GitHub and GitLab sync", values: { free: true, pro: true, business: true, enterprise: true } },
      { label: "AI triage and summaries", values: { free: false, pro: true, business: true, enterprise: true } },
      { label: "API rate limit", values: { free: "1k / hour", pro: "10k / hour", business: "50k / hour", enterprise: "Custom" } },
    ],
  },
  {
    group: "Security",
    rows: [
      { label: "SSO (SAML, OIDC)", values: { free: false, pro: false, business: true, enterprise: true } },
      { label: "SCIM provisioning", values: { free: false, pro: false, business: true, enterprise: true } },
      { label: "Audit log", values: { free: false, pro: false, business: true, enterprise: true } },
      { label: "Data residency", values: { free: false, pro: false, business: false, enterprise: true } },
    ],
  },
];

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export const defaultFaq: FaqItem[] = [
  { question: "Can I try Orbit before paying?", answer: "Yes. The Free plan has no time limit, and Pro and Business come with a 14-day trial. No card needed." },
  { question: "How does per-seat billing work?", answer: "You pay for members who can edit. Guests and read-only viewers are free, and we prorate when people join or leave." },
  { question: "Can I import from Jira or Linear?", answer: "Our importer brings over issues, comments, attachments, labels and history. Most teams finish in under an hour." },
  { question: "Where is my data stored?", answer: "In the US by default. Business can pick the EU, and Enterprise can choose a dedicated region." },
  { question: "Do you offer discounts?", answer: "Nonprofits and schools get 50% off, and early-stage startups get a year of Pro free. Write to us." },
];

export const defaultStats = [
  { value: 12000, suffix: "+", label: "teams ship with Orbit" },
  { value: 99.99, suffix: "%", label: "uptime over the last year" },
  { value: 4, suffix: " days", label: "median cycle time" },
  { value: 82, suffix: "ms", label: "average page load" },
];

export const defaultIntegrations = ["GitHub", "Slack", "Figma", "Sentry", "Notion", "Zendesk"];

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export const defaultFooterColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "API", href: "/docs/api" },
      { label: "Status", href: "/status" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "DPA", href: "/dpa" },
    ],
  },
];

export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  summary?: string;
  /** Rich body. Rendered in prose. */
  body?: React.ReactNode;
  tags?: string[];
  image?: React.ReactNode;
}

const day = (n: number) => new Date(FAKE_NOW - n * 86_400_000).toISOString().slice(0, 10);

export const defaultChangelog: ChangelogItem[] = [
  {
    version: "2.8",
    date: day(3),
    title: "Roadmap timelines, rebuilt",
    summary: "Drag projects across quarters, see dependencies, and share a read-only link.",
    tags: ["New", "Roadmaps"],
    body: (
      <>
        <p>
          The timeline view is rebuilt from scratch. It renders 5,000 projects at 60 frames per second and finally handles
          dependencies the way you'd expect.
        </p>
        <ul>
          <li>Drag the edge of a project to change its dates. Dependent projects shift with it.</li>
          <li>A red line marks any project that will slip because something before it did.</li>
          <li>Share a read-only link with people outside your workspace.</li>
        </ul>
      </>
    ),
  },
  {
    version: "2.7",
    date: day(17),
    title: "AI triage for incoming issues",
    summary: "New issues get a suggested team, label and priority. You stay in charge.",
    tags: ["New", "AI"],
    body: (
      <>
        <p>
          Triage suggestions appear on every new issue in your inbox. Accept them with <code>Enter</code> or ignore them; we
          never apply anything on our own.
        </p>
        <p>Suggestions learn from how your team triages, and you can turn them off per team in settings.</p>
      </>
    ),
  },
  {
    version: "2.6",
    date: day(34),
    title: "Faster search, and 31 fixes",
    summary: "Search results now show up as you type, across issues, docs and comments.",
    tags: ["Improved", "Fixes"],
    body: (
      <>
        <p>Search moved to a new index. Results arrive in about 20ms and include comments and docs.</p>
        <ul>
          <li>Fixed: cycle burndown counted canceled issues.</li>
          <li>Fixed: the Slack digest sometimes posted twice.</li>
          <li>Improved: keyboard focus now returns to the list after closing an issue.</li>
        </ul>
      </>
    ),
  },
];

export interface BlogAuthor {
  name: string;
  title?: string;
  avatar?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  author: BlogAuthor;
  tags: string[];
  /** Cover image. Without one, generated art is used. */
  cover?: React.ReactNode;
}

export const defaultPosts: BlogPost[] = [
  {
    slug: "calm-software",
    title: "The case for calm software",
    excerpt: "Most tools compete for your attention. We think the best ones earn it by asking for less.",
    date: day(2),
    readingTime: "6 min read",
    author: { name: "Jordan Reyes", title: "Co-founder" },
    tags: ["Design"],
  },
  {
    slug: "cycle-time",
    title: "How we cut our cycle time in half",
    excerpt: "We measured where work waited, not where it moved. The answer surprised everyone.",
    date: day(9),
    readingTime: "8 min read",
    author: { name: "Maya Chen", title: "Engineering" },
    tags: ["Engineering", "Process"],
  },
  {
    slug: "sync-engine",
    title: "Inside Orbit's sync engine",
    excerpt: "Local-first, conflict-free, and fast on a train in a tunnel. Here's how it works.",
    date: day(16),
    readingTime: "12 min read",
    author: { name: "Kenji Nakamura", title: "Infrastructure" },
    tags: ["Engineering"],
  },
  {
    slug: "roadmaps-that-dont-lie",
    title: "Roadmaps that don't lie",
    excerpt: "Dates are promises. A good roadmap shows you which ones are about to break.",
    date: day(24),
    readingTime: "5 min read",
    author: { name: "Amara Adeyemi", title: "Product" },
    tags: ["Product"],
  },
  {
    slug: "ai-triage",
    title: "Designing AI that suggests, not decides",
    excerpt: "Our rules for putting AI in a tool people trust with their work.",
    date: day(31),
    readingTime: "7 min read",
    author: { name: "Zara Silva", title: "Design" },
    tags: ["Design", "AI"],
  },
  {
    slug: "remote-standups",
    title: "We stopped doing standups",
    excerpt: "An async update that takes two minutes and gets read. Templates included.",
    date: day(45),
    readingTime: "4 min read",
    author: { name: "Leo Okafor", title: "Design" },
    tags: ["Process"],
  },
];

export const defaultPostBody = (
  <>
    <p>
      Open any app on your phone and count the things asking for your attention. Badges, banners, a dot on a tab you
      never use. Most software is built to be <em>noticed</em>. We want Orbit to be <strong>trusted</strong>, which is a
      different goal with different rules.
    </p>
    <h2 id="less-is-a-feature">Less is a feature</h2>
    <p>
      Every notification is a small loan against your focus. A good tool pays it back with something useful. A bad one
      just keeps borrowing. So before we add any alert, we ask one question: would you thank us for it?
    </p>
    <ul>
      <li>Notifications are off by default, except mentions and assignments.</li>
      <li>Digests replace pings. One message at 9am beats twenty during the day.</li>
      <li>Nothing in Orbit is red unless something is actually wrong.</li>
    </ul>
    <h2 id="speed-is-calm">Speed is calm</h2>
    <p>
      Waiting is stressful in a way that's easy to miss. A spinner that shows up thirty times a day trains you to expect
      friction. That's why every view in Orbit renders from a local copy first and syncs in the background.
    </p>
    <blockquote>The fastest request is the one you never have to wait for.</blockquote>
    <h2 id="what-we-measure">What we measure</h2>
    <p>
      We don't track time-in-app. We track how quickly people find what they came for and leave. If that number goes
      down, we did our job. You can read more about our approach in <a href="/blog/ai-triage">how we design AI features</a>.
    </p>
    <pre>
      <code>{`orbit issues list --mine --status "In progress"`}</code>
    </pre>
    <p>Calm software isn't minimal for the sake of it. It's software that respects the person using it.</p>
  </>
);

export const defaultPostToc = [
  { id: "less-is-a-feature", label: "Less is a feature" },
  { id: "speed-is-calm", label: "Speed is calm" },
  { id: "what-we-measure", label: "What we measure" },
];

