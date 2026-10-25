import {
  ApiKeysPage,
  AppShell,
  DashboardPage,
  EmptyWorkspacePage,
  ForgotPasswordPage,
  LogInPage,
  NotificationsPage,
  OnboardingPage,
  SettingsBillingPage,
  SettingsProfilePage,
  SignUpPage,
  TeamMembersPage,
  UserDetailPage,
  UsersPage,
} from "@junco/blocks/app";
import { BellIcon } from "@junco/blocks/app";
import { Button, toast, Tooltip } from "junco";
import type * as React from "react";
import type { PreviewRoute } from "./routes";

function Shell({
  href,
  children,
  variant,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "inset";
}) {
  return (
    <AppShell
      activeHref={href}
      variant={variant}
      onSearch={() => toast("Search opens here (wire it to CommandDialog)")}
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

const app = (path: string, title: string, element: React.ReactNode, href = `#${path}`): PreviewRoute => ({
  path,
  title,
  group: "App",
  element: <Shell href={href}>{element}</Shell>,
});

export const appRoutes: PreviewRoute[] = [
  { path: "/log-in", title: "Log in", group: "Auth", element: <LogInPage /> },
  { path: "/log-in/split", title: "Log in (split)", group: "Auth", element: <LogInPage variant="split" /> },
  { path: "/sign-up", title: "Sign up", group: "Auth", element: <SignUpPage /> },
  { path: "/sign-up/split", title: "Sign up (split)", group: "Auth", element: <SignUpPage variant="split" /> },
  { path: "/forgot-password", title: "Forgot password", group: "Auth", element: <ForgotPasswordPage /> },
  { path: "/onboarding", title: "Onboarding", group: "Auth", element: <OnboardingPage /> },
  {
    path: "/onboarding/split",
    title: "Onboarding (split)",
    group: "Auth",
    element: <OnboardingPage variant="split" />,
  },

  app("/dashboard", "Dashboard", <DashboardPage />),
  {
    path: "/dashboard/inset",
    title: "Dashboard (inset shell, focused)",
    group: "App",
    element: (
      <Shell href="#/dashboard" variant="inset">
        <DashboardPage variant="focused" />
      </Shell>
    ),
  },
  app("/users", "Users", <UsersPage />),
  app("/users/cards", "Users (cards)", <UsersPage variant="cards" />, "#/users"),
  app("/users/usr_1", "User detail", <UserDetailPage />, "#/users"),
  app("/settings/profile", "Settings: profile", <SettingsProfilePage />),
  app(
    "/settings/profile/sidebar",
    "Settings: profile (side nav)",
    <SettingsProfilePage variant="sidebar" />,
    "#/settings/profile",
  ),
  app("/settings/billing", "Settings: billing", <SettingsBillingPage />),
  app("/settings/team", "Settings: team", <TeamMembersPage />),
  app("/settings/api-keys", "Settings: API keys", <ApiKeysPage />),
  app("/settings/notifications", "Settings: notifications", <NotificationsPage />),
  app("/empty", "Empty workspace", <EmptyWorkspacePage />, "#/dashboard"),
  app("/empty/minimal", "Empty workspace (minimal)", <EmptyWorkspacePage variant="minimal" />, "#/dashboard"),
];
