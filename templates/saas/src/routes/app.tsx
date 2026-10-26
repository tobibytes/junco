import { Outlet, useLocation } from "react-router";
import {
  ApiKeysPage,
  AppShell,
  ChartIcon,
  CreditCardIcon,
  DashboardPage,
  NotificationsPage,
  SettingsBillingPage,
  SettingsIcon,
  SettingsProfilePage,
  TeamMembersPage,
  UsersIcon,
  UsersPage,
  type NavGroup,
} from "@junco/blocks/app";
import { app, settingsTabs } from "../config";
import { RequireAuth, useAuth } from "../lib/auth";
import { renderLink } from "../lib/links";
import { ThemeToggle } from "../theme-toggle";

/*
 * The signed-in app. Every page runs on realistic fake data and handles its own actions (with a
 * toast) until you wire it up: fetch data here (React Router loaders, TanStack Query, plain
 * fetch), pass it in as props, and handle saves with the on* callbacks, e.g. onSave, onInvite.
 */

/** The signed-in app's sidebar. */
export const appNav: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/app", icon: ChartIcon },
      { label: "Customers", href: "/app/customers", icon: UsersIcon },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Settings", href: "/app/settings/profile", icon: SettingsIcon },
      { label: "Billing", href: "/app/settings/billing", icon: CreditCardIcon },
    ],
  },
];

/** The signed-in app: sidebar, topbar and the current page. Signed-out visitors go to /login. */
export function AppLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  return (
    <RequireAuth>
      <AppShell
        activeHref={pathname}
        topbarActions={<ThemeToggle />}
        sidebar={{
          groups: appNav,
          workspaces: [{ id: "acme", name: app.name, description: "Pro plan" }],
          user: user ?? undefined,
          userMenu: [{ label: "Settings", href: "/app/settings/profile", icon: SettingsIcon }],
          // RequireAuth then sends you to /login, and back here once you sign in again.
          onSignOut: signOut,
          renderLink,
        }}
      >
        <Outlet />
      </AppShell>
    </RequireAuth>
  );
}

export function Dashboard() {
  return <DashboardPage customersHref="/app/customers" />;
}

export function Customers() {
  return <UsersPage title="Customers" userHref={null} />;
}

export function Profile() {
  const { user } = useAuth();
  return <SettingsProfilePage tabs={settingsTabs} profile={user ? { name: user.name, email: user.email } : undefined} />;
}

export function Billing() {
  return <SettingsBillingPage tabs={settingsTabs} />;
}

export function Team() {
  return <TeamMembersPage tabs={settingsTabs} />;
}

export function ApiKeys() {
  return <ApiKeysPage tabs={settingsTabs} />;
}

export function Notifications() {
  return <NotificationsPage tabs={settingsTabs} />;
}
