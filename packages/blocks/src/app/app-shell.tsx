import * as React from "react";
import {
  Avatar,
  Badge,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Kbd,
  Sheet,
  SheetContent,
  SheetTitle,
  Tooltip,
} from "@junco/react";
import { tv } from "tailwind-variants";
import { renderSlot, type Slots } from "../lib/slots";
import {
  BellIcon,
  ChartIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  HelpIcon,
  HomeIcon,
  KeyIcon,
  LogOutIcon,
  MenuIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  type IconComponent,
} from "./icons";

/* ------------------------------------------------------------------ types */

export interface NavItem {
  label: string;
  href?: string;
  icon?: IconComponent;
  /** A count or short label on the right, e.g. 3 or "New". */
  badge?: React.ReactNode;
  /** Marks the current page (sets aria-current). */
  isActive?: boolean;
  /** For items that run an action instead of navigating. */
  onSelect?: () => void;
}

export interface NavGroup {
  /** Optional heading above the group. */
  label?: string;
  items: NavItem[];
}

export interface Workspace {
  id: string;
  name: string;
  /** Shown under the name, e.g. the plan. */
  description?: string;
}

export interface SidebarUser {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface UserMenuItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  icon?: IconComponent;
  shortcut?: string;
}

/** Renders a nav link. Pass one that returns your router's Link (Next, React Router...). */
export type RenderLink = (
  item: NavItem,
  props: { className: string; children: React.ReactNode; "aria-current"?: "page"; onClick?: () => void },
) => React.ReactNode;

const defaultRenderLink: RenderLink = (item, { children, ...props }) => (
  <a href={item.href} {...props}>
    {children}
  </a>
);

/* ------------------------------------------------------------------ fake defaults */

export const defaultNavGroups: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "#/dashboard", icon: HomeIcon },
      { label: "Users", href: "#/users", icon: UsersIcon, badge: 12 },
      { label: "Analytics", href: "#/analytics", icon: ChartIcon },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Profile", href: "#/settings/profile", icon: SettingsIcon },
      { label: "Billing", href: "#/settings/billing", icon: CreditCardIcon },
      { label: "Team", href: "#/settings/team", icon: UsersIcon },
      { label: "API keys", href: "#/settings/api-keys", icon: KeyIcon },
      { label: "Notifications", href: "#/settings/notifications", icon: BellIcon },
    ],
  },
];

export const defaultWorkspaces: Workspace[] = [
  { id: "ws_1", name: "Northwind", description: "Business plan" },
  { id: "ws_2", name: "Side project", description: "Free plan" },
];

export const defaultUser: SidebarUser = { name: "Ada Lovelace", email: "ada@northwind.com" };

/* ------------------------------------------------------------------ Sidebar */

export const sidebarVariants = tv({
  slots: {
    root: "flex h-full min-h-0 flex-col gap-2 text-sm",
    header: "px-2 pt-2",
    nav: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 py-2",
    groupLabel: "px-2 pb-1 text-xs font-medium text-muted-foreground",
    item: [
      "group/item relative flex h-8 w-full items-center gap-2.5 rounded-control px-2 text-left font-medium text-muted-foreground",
      "transition-colors duration-fast ease-standard hover:bg-accent hover:text-foreground",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
      "aria-[current=page]:bg-accent aria-[current=page]:text-foreground",
      "[&>svg]:size-4 [&>svg]:shrink-0",
    ],
    footer: "border-t border-border px-2 py-2",
  },
  variants: {
    isCollapsed: {
      true: { item: "justify-center px-0", groupLabel: "sr-only", header: "flex justify-center" },
    },
  },
});

export interface SidebarProps {
  groups?: NavGroup[];
  workspaces?: Workspace[];
  activeWorkspaceId?: string;
  onWorkspaceChange?: (workspace: Workspace) => void;
  onCreateWorkspace?: () => void;
  user?: SidebarUser;
  userMenu?: UserMenuItem[];
  onSignOut?: () => void;
  /** Icon-only rail. Labels move into tooltips. */
  isCollapsed?: boolean;
  /** Called after any nav item is chosen (the mobile sheet uses it to close). */
  onNavigate?: (item: NavItem) => void;
  renderLink?: RenderLink;
  /** Extra content above the user menu, e.g. an upgrade card. Hidden when collapsed. */
  footer?: React.ReactNode;
  className?: string;
  classNames?: Partial<Record<keyof ReturnType<typeof sidebarVariants>, string>>;
}

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function WorkspaceMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="grid size-6 shrink-0 place-items-center rounded-control bg-primary text-xs font-semibold text-primary-foreground"
    >
      {initial(name)}
    </span>
  );
}

/** Navigation: workspace switcher, grouped links, user menu. Used inside AppShell or on its own. */
export function Sidebar({
  groups = defaultNavGroups,
  workspaces = defaultWorkspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
  user = defaultUser,
  userMenu,
  onSignOut,
  isCollapsed = false,
  onNavigate,
  renderLink = defaultRenderLink,
  footer,
  className,
  classNames,
}: SidebarProps) {
  const styles = sidebarVariants({ isCollapsed });
  const active = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];
  const menuItems: UserMenuItem[] = userMenu ?? [
    { label: "Account settings", href: "#/settings/profile", icon: SettingsIcon },
    { label: "Help and docs", href: "#/help", icon: HelpIcon },
  ];

  const withTooltip = (label: string, node: React.ReactElement) =>
    isCollapsed ? (
      <Tooltip content={label} side="right">
        {node}
      </Tooltip>
    ) : (
      node
    );

  return (
    <div
      data-slot="sidebar"
      data-collapsed={isCollapsed || undefined}
      className={styles.root({ className: cn(classNames?.root, className) })}
    >
      {active && (
        <div className={styles.header({ className: classNames?.header })}>
          <DropdownMenu>
            {withTooltip(
              active.name,
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={isCollapsed ? `Workspace: ${active.name}` : undefined}
                  className={cn(
                    "flex h-10 w-full items-center gap-2 rounded-control px-2 text-left",
                    "transition-colors duration-fast ease-standard hover:bg-accent",
                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                    isCollapsed && "size-10 justify-center px-0",
                  )}
                >
                  <WorkspaceMark name={active.name} />
                  {!isCollapsed && (
                    <>
                      <span className="grid min-w-0 flex-1 leading-tight">
                        <span className="truncate font-semibold text-foreground">{active.name}</span>
                        {active.description && (
                          <span className="truncate text-xs text-muted-foreground">{active.description}</span>
                        )}
                      </span>
                      <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>,
            )}
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((w) => (
                <DropdownMenuItem key={w.id} onSelect={() => onWorkspaceChange?.(w)}>
                  <WorkspaceMark name={w.name} />
                  <span className="flex-1 truncate">{w.name}</span>
                  {w.id === active.id && <CheckIcon className="size-4" aria-label="Current workspace" />}
                </DropdownMenuItem>
              ))}
              {onCreateWorkspace && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onCreateWorkspace}>
                    <PlusIcon className="size-4" />
                    New workspace
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <nav aria-label="Main" className={styles.nav({ className: classNames?.nav })}>
        {groups.map((group, gi) => (
          <div key={group.label ?? gi} role="group" aria-label={group.label}>
            {group.label && (
              <div className={styles.groupLabel({ className: classNames?.groupLabel })}>{group.label}</div>
            )}
            <ul className="grid gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    {Icon && <Icon />}
                    <span className={cn("flex-1 truncate", isCollapsed && "sr-only")}>{item.label}</span>
                    {item.badge !== undefined && !isCollapsed && (
                      <Badge className="h-5 min-w-5 justify-center px-1.5 tabular-nums">{item.badge}</Badge>
                    )}
                    {item.badge !== undefined && isCollapsed && (
                      <span aria-hidden className="absolute top-1 right-1 size-1.5 rounded-pill bg-primary" />
                    )}
                  </>
                );
                const className = styles.item({ className: classNames?.item });
                const select = () => {
                  item.onSelect?.();
                  onNavigate?.(item);
                };
                const node = item.href ? (
                  renderLink(item, {
                    className,
                    children: content,
                    "aria-current": item.isActive ? "page" : undefined,
                    onClick: select,
                  })
                ) : (
                  <button
                    type="button"
                    className={className}
                    aria-current={item.isActive ? "page" : undefined}
                    onClick={select}
                  >
                    {content}
                  </button>
                );
                return <li key={item.label}>{withTooltip(item.label, node as React.ReactElement)}</li>;
              })}
            </ul>
          </div>
        ))}
      </nav>

      {footer && !isCollapsed && <div className="px-2">{footer}</div>}

      <div className={styles.footer({ className: classNames?.footer })}>
        <DropdownMenu>
          {withTooltip(
            user.name,
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                // Expanded, the visible name and email are the label (voice control users say what
                // they see); collapsed there's no text, so name it.
                aria-label={isCollapsed ? `Account menu for ${user.name}` : undefined}
                className={cn(
                  "flex h-11 w-full items-center gap-2 rounded-control px-2 text-left",
                  "transition-colors duration-fast ease-standard hover:bg-accent",
                  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <span aria-hidden className="contents">
                  <Avatar name={user.name} src={user.avatarUrl} size="sm" className="size-7" />
                </span>
                {!isCollapsed && (
                  <>
                    <span className="grid min-w-0 flex-1 leading-tight">
                      <span className="truncate font-medium text-foreground">{user.name}</span>{" "}
                      {user.email && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
                    </span>
                    <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>,
          )}
          <DropdownMenuContent align="start" side={isCollapsed ? "right" : "top"} className="w-56">
            <DropdownMenuLabel className="grid font-normal">
              <span className="truncate text-sm font-medium text-foreground">{user.name}</span>
              {user.email && <span className="truncate">{user.email}</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuItems.map((m) => {
              const Icon = m.icon;
              return m.href ? (
                <DropdownMenuItem key={m.label} asChild shortcut={m.shortcut}>
                  <a href={m.href}>
                    {Icon && <Icon className="size-4" />}
                    {m.label}
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={m.label} onSelect={m.onSelect} shortcut={m.shortcut}>
                  {Icon && <Icon className="size-4" />}
                  {m.label}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onSignOut}>
              <LogOutIcon className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Topbar */

export interface TopbarProps {
  /** Opens the mobile nav sheet. */
  onOpenMobileNav: () => void;
  /** Toggles the desktop rail. */
  onToggleCollapsed: () => void;
  isCollapsed: boolean;
  /** Shows a search button that calls this (wire it to a CommandDialog). */
  onSearch?: () => void;
  /** Right side of the bar: buttons, notifications, etc. */
  actions?: React.ReactNode;
  /** Left side after the toggles, e.g. a breadcrumb. */
  start?: React.ReactNode;
}

export function Topbar({ onOpenMobileNav, onToggleCollapsed, isCollapsed, onSearch, actions, start }: TopbarProps) {
  return (
    <header
      data-slot="topbar"
      className="sticky top-0 z-sticky flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-4"
    >
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" onClick={onOpenMobileNav}>
        <MenuIcon className="size-4" />
      </Button>
      <Tooltip content={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} shortcut="⌘B">
        <Button
          variant="ghost"
          size="icon"
          className="max-md:hidden"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={isCollapsed}
          onClick={onToggleCollapsed}
        >
          <PanelLeftIcon className="size-4" />
        </Button>
      </Tooltip>
      <div className="flex min-w-0 flex-1 items-center gap-2">{start}</div>
      {onSearch && (
        <Button
          variant="outline"
          onClick={onSearch}
          aria-keyshortcuts="Meta+K Control+K"
          className="h-8 gap-2 px-2.5 text-muted-foreground sm:w-56 sm:justify-start"
        >
          <SearchIcon className="size-4" />
          {/* The visible text is the accessible name (no aria-label that differs from it); on phones it
              stays for screen readers. The shortcut is announced via aria-keyshortcuts. */}
          <span className="max-sm:sr-only">Search…</span>
          <Kbd aria-hidden className="ml-auto max-sm:hidden">
            ⌘K
          </Kbd>
        </Button>
      )}
      {actions}
    </header>
  );
}

/* ------------------------------------------------------------------ AppShell */

// A type alias (not an interface) so it satisfies Slots' Record constraint.
export type AppShellSlots = {
  sidebar: SidebarProps;
  topbar: TopbarProps;
};

export interface AppShellProps {
  children?: React.ReactNode;
  /** Everything the sidebar shows. Fake data when omitted. */
  sidebar?: SidebarProps;
  /** Href of the current page; marks the matching nav item active. */
  activeHref?: string;
  /** "default": sidebar beside the page. "inset": the page sits in a raised panel next to the sidebar. */
  variant?: "default" | "inset";
  isCollapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onSearch?: TopbarProps["onSearch"];
  topbarActions?: React.ReactNode;
  topbarStart?: React.ReactNode;
  slots?: Slots<AppShellSlots>;
  className?: string;
  classNames?: Partial<Record<"root" | "sidebar" | "main" | "content", string>>;
}

function markActive(groups: NavGroup[], activeHref?: string): NavGroup[] {
  if (!activeHref) return groups;
  return groups.map((g) => ({
    ...g,
    items: g.items.map((i) => ({ ...i, isActive: i.isActive ?? i.href === activeHref })),
  }));
}

/**
 * Sidebar + topbar + content. On desktop the sidebar collapses to an icon rail (⌘B / Ctrl+B);
 * on phones it becomes a sheet. Includes a "Skip to content" link.
 */
export function AppShell({
  children,
  sidebar,
  activeHref,
  variant = "default",
  isCollapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  onSearch,
  topbarActions,
  topbarStart,
  slots,
  className,
  classNames,
}: AppShellProps) {
  const [innerCollapsed, setInnerCollapsed] = React.useState(defaultCollapsed);
  const isCollapsed = collapsedProp ?? innerCollapsed;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (collapsedProp === undefined) setInnerCollapsed(next);
      onCollapsedChange?.(next);
    },
    [collapsedProp, onCollapsedChange],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "b") {
        // Leave Ctrl+B alone while typing (it's bold in many editors). The target can be window.
        const target = e.target;
        if (target instanceof Element && target.closest("input, textarea, [contenteditable=true]")) return;
        e.preventDefault();
        setCollapsed(!isCollapsed);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCollapsed, setCollapsed]);

  const sidebarProps: SidebarProps = {
    ...sidebar,
    groups: markActive(sidebar?.groups ?? defaultNavGroups, activeHref),
  };
  const isInset = variant === "inset";

  return (
    <div
      data-slot="app-shell"
      data-variant={variant}
      className={cn(
        "flex min-h-dvh bg-background text-foreground",
        isInset && "bg-muted/40",
        classNames?.root,
        className,
      )}
    >
      <a
        href="#main-content"
        className="sr-only z-toast rounded-control bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <aside
        aria-label="Sidebar"
        className={cn(
          "sticky top-0 h-dvh shrink-0 max-md:hidden",
          "transition-[width] duration-base ease-standard",
          isCollapsed ? "w-14" : "w-60",
          !isInset && "border-r border-border bg-surface",
          classNames?.sidebar,
        )}
      >
        {renderSlot(slots, "sidebar", Sidebar, { ...sidebarProps, isCollapsed })}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" mobileSide="same" showClose={false} className="w-72 p-0 md:hidden">
          <SheetTitle isHidden>Navigation</SheetTitle>
          {renderSlot(slots, "sidebar", Sidebar, {
            ...sidebarProps,
            isCollapsed: false,
            onNavigate: (item) => {
              sidebarProps.onNavigate?.(item);
              setMobileOpen(false);
            },
          })}
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isInset && "md:my-2 md:mr-2 md:overflow-hidden md:rounded-card md:border md:border-border md:bg-background",
          classNames?.main,
        )}
      >
        {renderSlot(slots, "topbar", Topbar, {
          onOpenMobileNav: () => setMobileOpen(true),
          onToggleCollapsed: () => setCollapsed(!isCollapsed),
          isCollapsed,
          onSearch,
          actions: topbarActions,
          start: topbarStart,
        })}
        <main id="main-content" tabIndex={-1} className={cn("min-w-0 flex-1 focus:outline-none", classNames?.content)}>
          {children}
        </main>
      </div>
    </div>
  );
}
