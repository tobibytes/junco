/**
 * Every block and page in the gallery. Plain data (no JSX) so server code can use it for static
 * params, nav and search. The live render for each slug lives in `render.tsx`.
 */

export type BlockCategory = "Marketing pages" | "App pages" | "Auth pages" | "Marketing blocks" | "App blocks";

export const blockCategories: BlockCategory[] = [
  "Marketing pages",
  "App pages",
  "Auth pages",
  "Marketing blocks",
  "App blocks",
];

export interface BlockVariant {
  value: string;
  label: string;
}

export interface BlockEntry {
  slug: string;
  title: string;
  category: BlockCategory;
  description: string;
  /** Exported component name. */
  component: string;
  importFrom: "@junco/blocks/app" | "@junco/blocks/marketing";
  /** First one is the default. */
  variants: BlockVariant[];
  /** App pages render inside <AppShell> in the preview, the way an app uses them. */
  inShell?: boolean;
  /** Preview height at desktop width (px). Sections are shorter than pages. */
  height?: number;
  /** Extra usage example (props, slots). The basic import snippet is generated. */
  example?: string;
}

const v = (...values: string[]): BlockVariant[] =>
  values.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ") }));

export const blocks: BlockEntry[] = [
  // Marketing pages
  {
    slug: "landing-page",
    title: "Landing page",
    category: "Marketing pages",
    description: "A full landing page from marketing blocks: hero, logos, features, pricing, FAQ and CTA. Every section can be replaced or dropped.",
    component: "LandingPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("product", "bold", "minimal"),
    example: `<LandingPage
  variant="bold"
  brand={{ name: "Acme" }}
  hero={{ title: "Ship faster with Acme", description: "The issue tracker your team will actually enjoy." }}
  slots={{
    testimonials: null,          // drop a section
    footer: MyFooter,            // or replace it with your own
  }}
/>`,
  },
  {
    slug: "pricing-page",
    title: "Pricing page",
    category: "Marketing pages",
    description: "Plans with a monthly/yearly switch, a highlighted plan, a feature comparison and FAQ.",
    component: "PricingPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("full", "simple"),
  },
  {
    slug: "changelog-page",
    title: "Changelog",
    category: "Marketing pages",
    description: "Release notes as a timeline or a compact list, with a subscribe form.",
    component: "ChangelogPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("timeline", "compact"),
  },
  {
    slug: "blog-index-page",
    title: "Blog index",
    category: "Marketing pages",
    description: "Posts as a grid or a list, with a featured post and tag filters.",
    component: "BlogIndexPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("grid", "list"),
  },
  {
    slug: "blog-post-page",
    title: "Blog post",
    category: "Marketing pages",
    description: "A long-form article with token-driven prose, author, reading time and a table of contents.",
    component: "BlogPostPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("with-toc", "centered"),
  },
  {
    slug: "waitlist-page",
    title: "Waitlist",
    category: "Marketing pages",
    description: "A focused sign-up page for a launch, centered or split with a product shot.",
    component: "WaitlistPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("centered", "split"),
  },
  {
    slug: "not-found-page",
    title: "404",
    category: "Marketing pages",
    description: "A friendly not-found page with search and helpful links.",
    component: "NotFoundPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("illustrated", "simple"),
  },
  {
    slug: "server-error-page",
    title: "500",
    category: "Marketing pages",
    description: "A server error page with a retry and a status link.",
    component: "ServerErrorPage",
    importFrom: "@junco/blocks/marketing",
    variants: v("illustrated", "simple"),
  },

  // App pages
  {
    slug: "dashboard-page",
    title: "Dashboard",
    category: "App pages",
    description: "Analytics overview: stats with sparklines, revenue and signup charts, top customers and activity.",
    component: "DashboardPage",
    importFrom: "@junco/blocks/app",
    variants: v("default", "focused"),
    inShell: true,
    example: `<DashboardPage
  title="Overview"
  stats={stats}                  // your data; omit to show fake data
  defaultRange="30d"
  onRangeChange={(range) => refetch(range)}
  slots={{ activity: null }}     // hide the activity column
/>`,
  },
  {
    slug: "users-page",
    title: "Users",
    category: "App pages",
    description: "A searchable, sortable user table with role filter, invite dialog, row actions and undo.",
    component: "UsersPage",
    importFrom: "@junco/blocks/app",
    variants: v("table", "cards"),
    inShell: true,
    example: `<UsersPage
  users={users}
  onUsersChange={setUsers}
  onInvite={async ({ emails, role }) => {
    await api.invite(emails, role); // throw to show an error in the dialog
  }}
  userHref={(user) => \`/users/\${user.id}\`}
/>`,
  },
  {
    slug: "user-detail-page",
    title: "User detail",
    category: "App pages",
    description: "A person's details, activity and sessions, with suspend and reactivate behind a confirmation.",
    component: "UserDetailPage",
    importFrom: "@junco/blocks/app",
    variants: v("default"),
    inShell: true,
  },
  {
    slug: "settings-profile-page",
    title: "Settings: profile",
    category: "App pages",
    description: "Profile form with unsaved-change tracking, photo upload and a danger zone.",
    component: "SettingsProfilePage",
    importFrom: "@junco/blocks/app",
    variants: v("tabs", "sidebar"),
    inShell: true,
  },
  {
    slug: "settings-billing-page",
    title: "Settings: billing",
    category: "App pages",
    description: "Current plan, usage meters, payment method and invoices.",
    component: "SettingsBillingPage",
    importFrom: "@junco/blocks/app",
    variants: v("tabs", "sidebar"),
    inShell: true,
  },
  {
    slug: "team-members-page",
    title: "Team members",
    category: "App pages",
    description: "Members and pending invites with roles and a seat limit.",
    component: "TeamMembersPage",
    importFrom: "@junco/blocks/app",
    variants: v("tabs", "sidebar"),
    inShell: true,
  },
  {
    slug: "api-keys-page",
    title: "API keys",
    category: "App pages",
    description: "Create keys (the secret is shown once, with copy) and revoke them behind a confirmation.",
    component: "ApiKeysPage",
    importFrom: "@junco/blocks/app",
    variants: v("tabs", "sidebar"),
    inShell: true,
  },
  {
    slug: "notifications-page",
    title: "Notifications",
    category: "App pages",
    description: "A channel-by-event switch matrix with pause-all, saved only after a change.",
    component: "NotificationsPage",
    importFrom: "@junco/blocks/app",
    variants: v("tabs", "sidebar"),
    inShell: true,
  },
  {
    slug: "empty-workspace-page",
    title: "Empty workspace",
    category: "App pages",
    description: "The first screen of a new workspace, with next steps.",
    component: "EmptyWorkspacePage",
    importFrom: "@junco/blocks/app",
    variants: v("cards", "minimal"),
    inShell: true,
  },

  // Auth pages
  {
    slug: "log-in-page",
    title: "Log in",
    category: "Auth pages",
    description: "Email and password with providers, Zod validation and errors from your onSubmit.",
    component: "LogInPage",
    importFrom: "@junco/blocks/app",
    variants: v("centered", "split"),
    example: `<LogInPage
  appName="Acme"
  variant="split"
  providers={[]}                 // hide the provider buttons
  onSubmit={async ({ email, password }) => {
    const res = await signIn(email, password);
    if (!res.ok) throw new Error("Wrong email or password"); // shown on the form
  }}
/>`,
  },
  {
    slug: "sign-up-page",
    title: "Sign up",
    category: "Auth pages",
    description: "Account creation with a password strength meter and terms.",
    component: "SignUpPage",
    importFrom: "@junco/blocks/app",
    variants: v("centered", "split"),
  },
  {
    slug: "forgot-password-page",
    title: "Forgot password",
    category: "Auth pages",
    description: "Request a reset link, then a clear check-your-email state.",
    component: "ForgotPasswordPage",
    importFrom: "@junco/blocks/app",
    variants: v("centered", "split"),
  },
  {
    slug: "onboarding-page",
    title: "Onboarding",
    category: "Auth pages",
    description: "Three validated steps: workspace, team and plan, with focus moved to each step.",
    component: "OnboardingPage",
    importFrom: "@junco/blocks/app",
    variants: v("centered", "split"),
  },

  // Marketing blocks
  {
    slug: "hero",
    title: "Hero",
    category: "Marketing blocks",
    description: "Headline, description, actions and media. Centered, split, or bold with rotating words.",
    component: "Hero",
    importFrom: "@junco/blocks/marketing",
    variants: v("centered", "split", "bold"),
    height: 760,
  },
  {
    slug: "logo-cloud",
    title: "Logo cloud",
    category: "Marketing blocks",
    description: "Customer logos as a marquee or a grid.",
    component: "LogoCloud",
    importFrom: "@junco/blocks/marketing",
    variants: v("marquee", "grid"),
    height: 260,
  },
  {
    slug: "feature-grid",
    title: "Feature grid",
    category: "Marketing blocks",
    description: "Features as lines, cards or plain text.",
    component: "FeatureGrid",
    importFrom: "@junco/blocks/marketing",
    variants: v("lines", "cards", "plain"),
    height: 640,
  },
  {
    slug: "feature-spotlight",
    title: "Feature spotlight",
    category: "Marketing blocks",
    description: "Alternating text and product shots for feature stories.",
    component: "FeatureSpotlight",
    importFrom: "@junco/blocks/marketing",
    variants: v("default"),
    height: 900,
  },
  {
    slug: "stats-band",
    title: "Stats band",
    category: "Marketing blocks",
    description: "Big numbers that count up when they scroll into view.",
    component: "StatsBand",
    importFrom: "@junco/blocks/marketing",
    variants: v("default"),
    height: 320,
  },
  {
    slug: "integration-beams",
    title: "Integration beams",
    category: "Marketing blocks",
    description: "Animated beams connecting your product to its integrations.",
    component: "IntegrationBeams",
    importFrom: "@junco/blocks/marketing",
    variants: v("default"),
    height: 560,
  },
  {
    slug: "testimonials",
    title: "Testimonials",
    category: "Marketing blocks",
    description: "Customer quotes as a grid or a marquee.",
    component: "Testimonials",
    importFrom: "@junco/blocks/marketing",
    variants: v("grid", "marquee"),
    height: 640,
  },
  {
    slug: "pricing-table",
    title: "Pricing table",
    category: "Marketing blocks",
    description: "Plan cards with a monthly/yearly switch and a highlighted plan.",
    component: "PricingTable",
    importFrom: "@junco/blocks/marketing",
    variants: v("default"),
    height: 820,
  },
  {
    slug: "faq",
    title: "FAQ",
    category: "Marketing blocks",
    description: "Questions in an accessible accordion, split or centered.",
    component: "Faq",
    importFrom: "@junco/blocks/marketing",
    variants: v("split", "centered"),
    height: 620,
  },
  {
    slug: "cta-section",
    title: "Call to action",
    category: "Marketing blocks",
    description: "A closing pitch with one or two actions.",
    component: "CtaSection",
    importFrom: "@junco/blocks/marketing",
    variants: v("card", "simple", "split"),
    height: 420,
  },
  {
    slug: "site-header",
    title: "Site header",
    category: "Marketing blocks",
    description: "Logo, nav and CTA. Collapses into a sheet menu on phones.",
    component: "SiteHeader",
    importFrom: "@junco/blocks/marketing",
    variants: v("default"),
    height: 200,
  },
  {
    slug: "site-footer",
    title: "Site footer",
    category: "Marketing blocks",
    description: "Link columns, tagline and legal links, full or minimal.",
    component: "SiteFooter",
    importFrom: "@junco/blocks/marketing",
    variants: v("full", "minimal"),
    height: 420,
  },

  // App blocks
  {
    slug: "app-shell",
    title: "App shell",
    category: "App blocks",
    description: "Sidebar, topbar and content. The sidebar collapses to icons (⌘B) and becomes a sheet on phones.",
    component: "AppShell",
    importFrom: "@junco/blocks/app",
    variants: v("default", "inset"),
    height: 680,
  },
  {
    slug: "page-header",
    title: "Page header",
    category: "App blocks",
    description: "Breadcrumb, title, description, actions and section tabs.",
    component: "PageHeader",
    importFrom: "@junco/blocks/app",
    variants: v("default"),
    height: 260,
  },
  {
    slug: "stat-row",
    title: "Stat row",
    category: "App blocks",
    description: "Key numbers with deltas and sparklines, joined or as cards.",
    component: "StatRow",
    importFrom: "@junco/blocks/app",
    variants: v("joined", "cards"),
    height: 240,
  },
  {
    slug: "charts",
    title: "Charts",
    category: "App blocks",
    description: "Dependency-free area and bar charts in token colors, with a screen-reader table.",
    component: "AreaChart",
    importFrom: "@junco/blocks/app",
    variants: v("area", "bar"),
    height: 380,
  },
  {
    slug: "settings-section",
    title: "Settings section",
    category: "App blocks",
    description: "Label and description on the left, control on the right. Stacks on phones.",
    component: "SettingsSection",
    importFrom: "@junco/blocks/app",
    variants: v("card", "plain"),
    height: 440,
  },
  {
    slug: "auth-card",
    title: "Auth card",
    category: "App blocks",
    description: "Logo, title, provider buttons, a form and a footer link.",
    component: "AuthCard",
    importFrom: "@junco/blocks/app",
    variants: v("card", "plain"),
    height: 640,
  },
  {
    slug: "activity-feed",
    title: "Activity feed",
    category: "App blocks",
    description: "Who did what, when, with avatars and relative times.",
    component: "ActivityFeed",
    importFrom: "@junco/blocks/app",
    variants: v("default"),
    height: 480,
  },
];

export function getBlock(slug: string): BlockEntry | undefined {
  return blocks.find((b) => b.slug === slug);
}

export const isPage = (b: BlockEntry) => b.category.endsWith("pages");

/** The import + minimal usage snippet for an entry and variant. */
export function usageCode(entry: BlockEntry, variant = entry.variants[0]!.value): string {
  const isDefault = variant === entry.variants[0]!.value;
  const variantProp = entry.variants.length > 1 && !isDefault ? ` variant="${variant}"` : "";
  if (entry.inShell) {
    return `import { AppShell, ${entry.component} } from "${entry.importFrom}";

export default function Page() {
  return (
    <AppShell activeHref="/${entry.slug.replace(/-page$/, "")}">
      <${entry.component}${variantProp} />
    </AppShell>
  );
}`;
  }
  return `import { ${entry.component} } from "${entry.importFrom}";

export default function Page() {
  return <${entry.component}${variantProp} />;
}`;
}

export const setupCss = `/* app.css */
@import "tailwindcss";
@import "@junco/tailwind";

/* Let Tailwind see the classes the packages use. */
@source "../node_modules/@junco/react/dist";
@source "../node_modules/@junco/blocks/dist";
@source "../node_modules/@junco/motion/dist";`;

export const installCommand = "npm i @junco/react @junco/tailwind @junco/blocks @junco/motion";
