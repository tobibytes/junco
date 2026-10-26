import * as React from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  useTheme,
} from "@junco/react";
import {
  ApiKeysPage,
  AppShell,
  ChartIcon,
  DashboardPage,
  fakeUsers,
  KeyIcon,
  NotificationsPage,
  SettingsIcon,
  SettingsProfilePage,
  TeamMembersPage,
  UserDetailPage,
  UsersIcon,
  UsersPage,
  type NavGroup,
} from "@junco/blocks/app";
import { app } from "../config";
import { RequireAuth, useAuth } from "../lib/auth";
import { renderLink } from "../lib/links";
import { ThemeToggle } from "../theme-toggle";
import { NotFound } from "./errors";

/*
 * The admin panel. Every page runs on realistic fake data and handles its own actions (with a
 * toast) until you wire it up: fetch data here (React Router loaders, TanStack Query, plain
 * fetch), pass it in as props, and handle changes with the on* callbacks, e.g. onUsersChange.
 */

/** Stand-in for your users API. */
const people = fakeUsers(48);
const userHref = (user: { id: string }) => `/users/${user.id}`;

const nav: NavGroup[] = [
  {
    items: [
      { label: "Overview", href: "/", icon: ChartIcon },
      { label: "Users", href: "/users", icon: UsersIcon, badge: people.length },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Settings", href: "/settings/profile", icon: SettingsIcon },
      { label: "API keys", href: "/settings/api-keys", icon: KeyIcon },
    ],
  },
];

const settingsTabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Team", href: "/settings/team" },
  { label: "API keys", href: "/settings/api-keys" },
  { label: "Notifications", href: "/settings/notifications" },
];

const pages = [
  { label: "Overview", href: "/" },
  { label: "Users", href: "/users" },
  ...settingsTabs.map((t) => ({ label: `Settings: ${t.label}`, href: t.href })),
];

/** The admin shell: sidebar, topbar, ⌘K palette and the current page. Signed-out visitors go to /login. */
export function AdminLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const go = (href: string) => {
    setSearchOpen(false);
    navigate(href);
  };
  // Mark "Users" active on /users/:id too.
  const activeHref = pathname.startsWith("/users") ? "/users" : pathname;

  return (
    <RequireAuth>
      <AppShell
        variant="inset"
        activeHref={activeHref}
        onSearch={() => setSearchOpen(true)}
        topbarActions={<ThemeToggle />}
        sidebar={{
          groups: nav,
          workspaces: [{ id: "acme", name: app.workspace, description: "Admin" }],
          user: user ?? undefined,
          userMenu: [{ label: "Settings", href: "/settings/profile", icon: SettingsIcon }],
          // RequireAuth then sends you to /login, and back here once you sign in again.
          onSignOut: signOut,
          renderLink,
        }}
      >
        <Outlet />
      </AppShell>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Jump to a page or person…" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((p) => (
              <CommandItem key={p.href} onSelect={() => go(p.href)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="People">
            {people.map((u) => (
              <CommandItem key={u.id} value={`${u.name} ${u.email}`} onSelect={() => go(userHref(u))}>
                {u.name}
                <span className="ml-auto truncate text-xs text-muted-foreground">{u.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                setSearchOpen(false);
              }}
            >
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </RequireAuth>
  );
}

export function Overview() {
  return <DashboardPage variant="focused" customersHref="/users" />;
}

export function Users() {
  return <UsersPage users={people} userHref={userHref} />;
}

export function UserDetail() {
  const { id } = useParams();
  const user = people.find((u) => u.id === id);
  if (!user) return <NotFound />;
  return <UserDetailPage key={user.id} user={user} backHref="/users" />;
}

export function Profile() {
  const { user } = useAuth();
  return <SettingsProfilePage tabs={settingsTabs} profile={user ? { name: user.name, email: user.email } : undefined} />;
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
