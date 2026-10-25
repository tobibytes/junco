import * as React from "react";
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
  useTheme,
  type Motion,
  type Theme,
} from "junco";
import { AppShell, type NavGroup } from "@junco/blocks/app";
import { users } from "./data";
import {
  BookIcon,
  FunnelIcon,
  GaugeIcon,
  ListIcon,
  MonitorIcon,
  MoonIcon,
  PulseIcon,
  SettingsIcon,
  SunIcon,
  UsersIcon,
} from "./icons";
import { EventsPage } from "./pages/events";
import { FunnelsPage } from "./pages/funnels";
import { OverviewPage } from "./pages/overview";
import { SettingsPage } from "./pages/settings";
import { UsersPage } from "./pages/users";

const ROUTES = {
  "/": { title: "Overview", Page: OverviewPage },
  "/events": { title: "Events", Page: EventsPage },
  "/funnels": { title: "Funnels", Page: FunnelsPage },
  "/users": { title: "Users", Page: UsersPage },
  "/settings": { title: "Settings", Page: SettingsPage },
} as const;
type Path = keyof typeof ROUTES;

function readPath(): Path {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  return (raw in ROUTES ? raw : "/") as Path;
}

/** A tiny hash router: the built app works from any subpath (base "./"). */
function useHashRoute(): [Path, (path: Path) => void] {
  const [path, setPath] = React.useState<Path>(readPath);
  React.useEffect(() => {
    const onChange = () => {
      // The skip link sets #main-content; that isn't a route, so leave the page alone.
      if (window.location.hash.startsWith("#/") || window.location.hash === "") {
        setPath(readPath());
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const navigate = React.useCallback((next: Path) => {
    window.location.hash = next;
  }, []);
  return [path, navigate];
}

const NAV: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "#/", icon: GaugeIcon },
      { label: "Events", href: "#/events", icon: ListIcon, badge: "Live" },
      { label: "Funnels", href: "#/funnels", icon: FunnelIcon },
      { label: "Users", href: "#/users", icon: UsersIcon },
    ],
  },
  {
    label: "Project",
    items: [
      { label: "Settings", href: "#/settings", icon: SettingsIcon },
      { label: "Docs", href: "https://junco.madebytobi.com", icon: BookIcon },
    ],
  },
];

function DisplayMenu() {
  const { theme, setTheme, motion, setMotion, resolvedTheme } = useTheme();
  const Icon = theme === "system" ? MonitorIcon : resolvedTheme === "dark" ? MoonIcon : SunIcon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Display settings">
          <Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Motion</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={motion} onValueChange={(v) => setMotion(v as Motion)}>
          <DropdownMenuRadioItem value="full">Full</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="subtle">Subtle</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground max-sm:hidden">
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-pill bg-success opacity-60 [animation-duration:calc(1.6s/max(var(--motion-scale),0.01))] motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-pill bg-success" />
      </span>
      <span>
        <span className="font-medium text-foreground tabular-nums">128</span> people online now
      </span>
    </span>
  );
}

export function App() {
  const [path, navigate] = useHashRoute();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { title, Page } = ROUTES[path];

  React.useEffect(() => {
    document.title = `${title} · Pulse`;
  }, [title]);

  const go = (p: Path) => {
    setSearchOpen(false);
    navigate(p);
  };

  return (
    <>
      <AppShell
        activeHref={`#${path}`}
        onSearch={() => setSearchOpen(true)}
        topbarStart={<LiveBadge />}
        topbarActions={<DisplayMenu />}
        sidebar={{
          groups: NAV,
          workspaces: [
            { id: "docs", name: "Northwind Docs", description: "Team plan · 4 sites" },
            { id: "store", name: "Northwind Store", description: "Pro plan" },
          ],
          activeWorkspaceId: "docs",
          onWorkspaceChange: (ws) => toast(`Switched to ${ws.name}`, { description: "Demo data stays the same." }),
          onCreateWorkspace: () => toast.info("New projects are disabled in the demo"),
          user: { name: "Tobi Olajide", email: "tobi@northwind.dev" },
          onSignOut: () => toast("Signed out", { description: "Just kidding, this is a demo." }),
          footer: (
            <div className="rounded-card border border-border bg-card p-3 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <PulseIcon className="size-3.5 text-primary" /> 82% of event quota
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-muted" role="progressbar" aria-valuenow={82} aria-valuemin={0} aria-valuemax={100} aria-label="Event quota used">
                <div className="h-full w-[82%] rounded-pill bg-primary" />
              </div>
              <p className="mt-2 text-muted-foreground">8.2M of 10M events this month.</p>
            </div>
          ),
        }}
      >
        <Page navigate={navigate} />
      </AppShell>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Jump to a page, user or action…" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandGroup heading="Pages">
            {(Object.keys(ROUTES) as Path[]).map((p) => (
              <CommandItem key={p} onSelect={() => go(p)}>
                {ROUTES[p].title}
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
            <CommandItem
              onSelect={() => {
                setSearchOpen(false);
                toast.success("Export started", { description: "events-last-7-days.csv will download shortly." });
              }}
            >
              Export events as CSV
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Users">
            {users.slice(0, 6).map((u) => (
              <CommandItem key={u.id} value={`${u.name} ${u.email}`} onSelect={() => go("/users")}>
                {u.name}
                <span className="ml-auto truncate text-xs text-muted-foreground">{u.company}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export type Navigate = (path: Path) => void;
export interface PageProps {
  navigate: Navigate;
}
