import * as React from "react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Kbd,
  useTheme,
  type Motion,
  type Theme,
} from "junco";
import { AddTransactionSheet } from "./add-transaction";
import { ActivityIcon, HomeIcon, MonitorIcon, MoonIcon, PieIcon, PlusIcon, SunIcon, TargetIcon, WalletIcon, type Icon } from "./icons";
import { ActivityPage } from "./pages/activity";
import { BudgetsPage } from "./pages/budgets";
import { GoalsPage } from "./pages/goals";
import { HomePage } from "./pages/home";
import { useLedger } from "./store";

const ROUTES = {
  "/": { label: "Home", icon: HomeIcon, Page: HomePage },
  "/activity": { label: "Activity", icon: ActivityIcon, Page: ActivityPage },
  "/budgets": { label: "Budgets", icon: PieIcon, Page: BudgetsPage },
  "/goals": { label: "Goals", icon: TargetIcon, Page: GoalsPage },
} satisfies Record<string, { label: string; icon: Icon; Page: React.ComponentType }>;
export type Path = keyof typeof ROUTES;
const PATHS = Object.keys(ROUTES) as Path[];

function readPath(): Path {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  return (raw in ROUTES ? raw : "/") as Path;
}

/** Hash routing so the built app works from any subpath (vite base "./"). */
function useHashRoute() {
  const [path, setPath] = React.useState<Path>(readPath);
  React.useEffect(() => {
    const onChange = () => {
      if (!window.location.hash.startsWith("#/") && window.location.hash !== "") return; // e.g. #main
      setPath(readPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

function Logo() {
  return (
    <a href="#/" className="flex items-center gap-2 rounded-control font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <span className="grid size-7 place-items-center rounded-control bg-primary text-primary-foreground" aria-hidden>
        <WalletIcon className="size-4" />
      </span>
      Ledger
    </a>
  );
}

function DisplayMenu({ className }: { className?: string }) {
  const { theme, setTheme, motion, setMotion, resolvedTheme } = useTheme();
  const Icon = theme === "system" ? MonitorIcon : resolvedTheme === "dark" ? MoonIcon : SunIcon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Display settings" className={className}>
          <Icon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
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

function SideNav({ path }: { path: Path }) {
  const { openAdd } = useLedger();
  return (
    <aside aria-label="Sidebar" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 border-r border-border bg-surface p-4 md:flex">
      <div className="flex items-center justify-between px-1">
        <Logo />
        <DisplayMenu />
      </div>
      <Button onClick={openAdd} className="w-full justify-between">
        <span className="flex items-center gap-2">
          <PlusIcon className="size-4" /> Add transaction
        </span>
        <Kbd className="border-primary-foreground/30 bg-transparent text-primary-foreground/80">N</Kbd>
      </Button>
      <nav aria-label="Main">
        <ul className="grid gap-0.5">
          {PATHS.map((p) => {
            const { label, icon: NavIcon } = ROUTES[p];
            const active = p === path;
            return (
              <li key={p}>
                <a
                  href={`#${p}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-fast ease-standard",
                    "hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                    active && "bg-accent text-foreground",
                  )}
                >
                  <NavIcon className="size-4" /> {label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto rounded-card border border-border bg-card p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Synced 2 minutes ago</p>
        <p className="mt-0.5">Chase, Capital One, Axos, Fidelity, Discover</p>
      </div>
    </aside>
  );
}

function BottomNav({ path }: { path: Path }) {
  const { openAdd } = useLedger();
  const items = PATHS.map((p) => ({ p, ...ROUTES[p] }));
  const tab = (item: (typeof items)[number]) => {
    const active = item.p === path;
    const NavIcon = item.icon;
    return (
      <a
        key={item.p}
        href={`#${item.p}`}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 rounded-control py-1.5 text-[11px] font-medium text-muted-foreground",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          active && "text-foreground",
        )}
      >
        <NavIcon className={cn("size-5", active && "text-primary")} />
        {item.label}
      </a>
    );
  };
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-background/90 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center">
        {items.slice(0, 2).map(tab)}
        <div className="flex flex-1 justify-center">
          <Button size="icon" onClick={openAdd} aria-label="Add transaction" className="size-12 -translate-y-3 rounded-pill shadow-float">
            <PlusIcon className="size-5" />
          </Button>
        </div>
        {items.slice(2).map(tab)}
      </div>
    </nav>
  );
}

export function App() {
  const path = useHashRoute();
  const { openAdd, addOpen } = useLedger();
  const { label, Page } = ROUTES[path];

  React.useEffect(() => {
    document.title = `${label} · Ledger`;
  }, [label]);

  // "N" adds a transaction, like most finance apps. Ignored while typing or with a dialog open.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey || addOpen) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      e.preventDefault();
      openAdd();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAdd, addOpen]);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only z-toast rounded-control bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <SideNav path={path} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-sticky flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
          <Logo />
          <DisplayMenu />
        </header>
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 focus:outline-none sm:px-6 md:px-8 md:py-10">
          <Page />
        </main>
      </div>
      <BottomNav path={path} />
      <AddTransactionSheet />
    </div>
  );
}
