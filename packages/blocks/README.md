# @junco/blocks

Blocks and full pages built only from [Junco](https://junco.madebytobi.com) components. Every page takes typed data, falls back to realistic fake data, offers layout `variant`s, and lets you replace or hide any region with `slots`.

```bash
npm i @junco/blocks junco @junco/tailwind
```

```css
@import "tailwindcss";
@import "@junco/tailwind";
@source "../node_modules/junco/dist";
@source "../node_modules/@junco/blocks/dist";
@source "../node_modules/@junco/motion/dist";
```

```tsx
import { AppShell, DashboardPage } from "@junco/blocks/app";
import { LandingPage } from "@junco/blocks/marketing";

<AppShell>
  <DashboardPage stats={myStats} slots={{ activity: null }} />
</AppShell>

<LandingPage variant="bold" />
```

| Import | Pages | Blocks |
| --- | --- | --- |
| `@junco/blocks/app` | LogInPage, SignUpPage, ForgotPasswordPage, OnboardingPage, DashboardPage, UsersPage, UserDetailPage, SettingsProfilePage, SettingsBillingPage, TeamMembersPage, ApiKeysPage, NotificationsPage, EmptyWorkspacePage | AppShell, Sidebar, Topbar, PageHeader, StatRow, SettingsSection, SettingsRow, AuthCard, ActivityFeed, AreaChart, BarChart, InviteDialog, ConfirmDialog |
| `@junco/blocks/marketing` | LandingPage, PricingPage, ChangelogPage, BlogIndexPage, BlogPostPage, WaitlistPage, NotFoundPage, ServerErrorPage | SiteHeader, Hero, LogoCloud, FeatureGrid, FeatureSpotlight, Testimonials, PricingTable, Faq, CtaSection, SiteFooter |
| `@junco/blocks/fake` | Seeded fake data: people, companies, series, dates | |

[Blocks gallery](https://junco.madebytobi.com/blocks) · [GitHub](https://github.com/tobibytes/junco) · MIT
