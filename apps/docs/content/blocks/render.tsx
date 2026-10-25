"use client";

import {
  ActivityFeed,
  ApiKeysPage,
  AppShell,
  AreaChart,
  AuthCard,
  BarChart,
  BellIcon,
  DashboardPage,
  defaultAuthProviders,
  EmptyWorkspacePage,
  fakeActivity,
  fakeDashboardStats,
  fakeRevenue,
  fakeSignups,
  ForgotPasswordPage,
  LogInPage,
  LogoMark,
  NotificationsPage,
  OnboardingPage,
  PageContainer,
  PageHeader,
  SettingsBillingPage,
  SettingsProfilePage,
  SettingsRow,
  SettingsSection,
  SignUpPage,
  StatRow,
  TeamMembersPage,
  UserDetailPage,
  UsersPage,
} from "@junco/blocks/app";
import {
  BlogIndexPage,
  BlogPostPage,
  ChangelogPage,
  CtaSection,
  Faq,
  FeatureGrid,
  FeatureSpotlight,
  Hero,
  IntegrationBeams,
  LandingPage,
  LogoCloud,
  NotFoundPage,
  PricingPage,
  PricingTable,
  ServerErrorPage,
  SiteFooter,
  SiteHeader,
  StatsBand,
  Testimonials,
  WaitlistPage,
} from "@junco/blocks/marketing";
import { Button, Checkbox, Field, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, toast, Tooltip } from "junco";
import type * as React from "react";

type Render = (variant: string) => React.ReactNode;

function Shell({ href, variant, children }: { href: string; variant?: "default" | "inset"; children: React.ReactNode }) {
  return (
    <AppShell
      activeHref={href}
      variant={variant}
      onSearch={() => toast("Search opens here. Wire it to CommandDialog.")}
      topbarActions={
        <Tooltip content="Notifications">
          <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => toast("No new notifications")}>
            <BellIcon className="size-4" />
          </Button>
        </Tooltip>
      }
    >
      {children}
    </AppShell>
  );
}

/** A section block on its own needs a little air around it in the frame. */
function Section({ children, pad = true }: { children: React.ReactNode; pad?: boolean }) {
  return <div className={pad ? "bg-background py-6" : "bg-background"}>{children}</div>;
}

function AppBlock({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-background p-4 sm:p-8">{children}</div>;
}

const settings = (v: string) => v as "tabs" | "sidebar";
const auth = (v: string) => v as "centered" | "split";

const renders: Record<string, Render> = {
  // Marketing pages
  "landing-page": (v) => <LandingPage variant={v as "product" | "bold" | "minimal"} />,
  "pricing-page": (v) => <PricingPage variant={v as "full" | "simple"} />,
  "changelog-page": (v) => <ChangelogPage variant={v as "timeline" | "compact"} />,
  "blog-index-page": (v) => <BlogIndexPage variant={v as "grid" | "list"} />,
  "blog-post-page": (v) => <BlogPostPage variant={v as "with-toc" | "centered"} />,
  "waitlist-page": (v) => <WaitlistPage variant={v as "centered" | "split"} />,
  "not-found-page": (v) => <NotFoundPage variant={v as "illustrated" | "simple"} />,
  "server-error-page": (v) => <ServerErrorPage variant={v as "illustrated" | "simple"} />,

  // App pages
  "dashboard-page": (v) => (
    <Shell href="#/dashboard">
      <DashboardPage variant={v as "default" | "focused"} />
    </Shell>
  ),
  "users-page": (v) => (
    <Shell href="#/users">
      <UsersPage variant={v as "table" | "cards"} />
    </Shell>
  ),
  "user-detail-page": () => (
    <Shell href="#/users">
      <UserDetailPage />
    </Shell>
  ),
  "settings-profile-page": (v) => (
    <Shell href="#/settings/profile">
      <SettingsProfilePage variant={settings(v)} />
    </Shell>
  ),
  "settings-billing-page": (v) => (
    <Shell href="#/settings/billing">
      <SettingsBillingPage variant={settings(v)} />
    </Shell>
  ),
  "team-members-page": (v) => (
    <Shell href="#/settings/team">
      <TeamMembersPage variant={settings(v)} />
    </Shell>
  ),
  "api-keys-page": (v) => (
    <Shell href="#/settings/api-keys">
      <ApiKeysPage variant={settings(v)} />
    </Shell>
  ),
  "notifications-page": (v) => (
    <Shell href="#/settings/notifications">
      <NotificationsPage variant={settings(v)} />
    </Shell>
  ),
  "empty-workspace-page": (v) => (
    <Shell href="#/dashboard">
      <EmptyWorkspacePage variant={v as "cards" | "minimal"} />
    </Shell>
  ),

  // Auth pages
  "log-in-page": (v) => <LogInPage variant={auth(v)} />,
  "sign-up-page": (v) => <SignUpPage variant={auth(v)} />,
  "forgot-password-page": (v) => <ForgotPasswordPage variant={auth(v)} />,
  "onboarding-page": (v) => <OnboardingPage variant={auth(v)} />,

  // Marketing blocks
  hero: (v) => (
    <Section pad={false}>
      <Hero variant={v as "centered" | "split" | "bold"} />
    </Section>
  ),
  "logo-cloud": (v) => (
    <Section>
      <LogoCloud variant={v as "marquee" | "grid"} />
    </Section>
  ),
  "feature-grid": (v) => (
    <Section>
      <FeatureGrid variant={v as "lines" | "cards" | "plain"} />
    </Section>
  ),
  "feature-spotlight": () => (
    <Section>
      <FeatureSpotlight />
    </Section>
  ),
  "stats-band": () => (
    <Section>
      <StatsBand />
    </Section>
  ),
  "integration-beams": () => (
    <Section>
      <IntegrationBeams />
    </Section>
  ),
  testimonials: (v) => (
    <Section>
      <Testimonials variant={v as "grid" | "marquee"} />
    </Section>
  ),
  "pricing-table": () => (
    <Section>
      <PricingTable />
    </Section>
  ),
  faq: (v) => (
    <Section>
      <Faq variant={v as "split" | "centered"} />
    </Section>
  ),
  "cta-section": (v) => (
    <Section>
      <CtaSection variant={v as "card" | "simple" | "split"} />
    </Section>
  ),
  "site-header": () => (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
    </div>
  ),
  "site-footer": (v) => (
    <Section pad={false}>
      <SiteFooter variant={v as "full" | "minimal"} />
    </Section>
  ),

  // App blocks
  "app-shell": (v) => (
    <Shell href="#/dashboard" variant={v as "default" | "inset"}>
      <PageContainer>
        <PageHeader title="Dashboard" description="Your content goes here." />
      </PageContainer>
    </Shell>
  ),
  "page-header": () => (
    <AppBlock>
      <PageHeader
        title="Team members"
        description="Invite people and manage what they can do."
        breadcrumb={[{ label: "Settings", href: "#" }, { label: "Team" }]}
        actions={
          <>
            <Button variant="outline">Export</Button>
            <Button>Invite people</Button>
          </>
        }
        tabs={[
          { label: "Members", isActive: true, count: 12 },
          { label: "Pending", count: 3 },
          { label: "Roles" },
        ]}
      />
    </AppBlock>
  ),
  "stat-row": (v) => (
    <AppBlock>
      <StatRow stats={fakeDashboardStats()} variant={v as "joined" | "cards"} deltaLabel="vs last month" showSparklines />
    </AppBlock>
  ),
  charts: (v) => (
    <AppBlock>
      {v === "bar" ? (
        <BarChart data={fakeSignups()} label="Signups per month" />
      ) : (
        <AreaChart data={fakeRevenue()} label="Revenue, last 30 days" formatValue={(n) => `$${Math.round(n / 100) / 10}k`} />
      )}
    </AppBlock>
  ),
  "settings-section": (v) => (
    <AppBlock>
      <SettingsSection
        variant={v as "card" | "plain"}
        title="Workspace"
        description="How your workspace looks to members."
        footer={<Button onClick={() => toast.success("Saved")}>Save</Button>}
      >
        <SettingsRow title="Name" description="Shown in the sidebar and emails." htmlFor="ws-name">
          <Input id="ws-name" defaultValue="Northwind" className="sm:w-64" />
        </SettingsRow>
        <SettingsRow title="Default role" description="For people who join with a link.">
          <Select defaultValue="member">
            <SelectTrigger aria-label="Default role" className="sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </SettingsRow>
        <SettingsRow title="Public profile" description="Let anyone with the link see your roadmap." htmlFor="ws-public">
          <Switch id="ws-public" defaultChecked />
        </SettingsRow>
      </SettingsSection>
    </AppBlock>
  ),
  "auth-card": (v) => (
    <div className="grid min-h-dvh place-items-center bg-background p-4">
      <AuthCard
        variant={v as "card" | "plain"}
        logo={<LogoMark />}
        title="Welcome back"
        description="Log in to Northwind"
        providers={defaultAuthProviders}
        footer={
          <>
            No account? <a href="#" className="font-medium text-foreground underline underline-offset-4">Sign up</a>
          </>
        }
        className="w-full max-w-sm"
      >
        <form className="grid gap-4" onSubmit={(e) => (e.preventDefault(), toast("Submitted"))}>
          <Field label="Email">
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <div className="flex items-center gap-2">
            <Checkbox id="remember" defaultChecked />
            <label htmlFor="remember" className="text-sm">
              Remember me
            </label>
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
      </AuthCard>
    </div>
  ),
  "activity-feed": () => (
    <AppBlock>
      <ActivityFeed items={fakeActivity(6)} className="max-w-xl" />
    </AppBlock>
  ),
};

export function renderBlock(slug: string, variant: string): React.ReactNode {
  const render = renders[slug];
  return render ? render(variant) : null;
}
