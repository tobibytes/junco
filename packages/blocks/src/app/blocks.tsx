import * as React from "react";
import { Avatar, Breadcrumb, Card, cn, Separator, Sparkline, Stat, StatGroup, type BreadcrumbProps } from "junco";
import { tv } from "tailwind-variants";
import { FAKE_NOW, timeAgo } from "../lib/fake";
import type { ActivityItem, DashboardStat } from "./fake-data";

/* ------------------------------------------------------------------ hooks */

/** True while the media query matches. False during SSR and the first render, then real. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

/* ------------------------------------------------------------------ clock */

/**
 * The "now" relative times are measured from. Fake data is anchored to a fixed clock so it
 * renders the same everywhere; real data needs the real clock. Pages pick one and provide it.
 */
const NowContext = React.createContext<number | undefined>(undefined);
export const NowProvider = NowContext.Provider;

/** The current clock: what the nearest NowProvider says, else the fake-data clock. */
export function useNow(): number {
  return React.useContext(NowContext) ?? FAKE_NOW;
}

/**
 * Picks the clock for a page: an explicit `now`, else the real time when the caller passed real
 * data, else the fake-data clock. Fixed for the life of the page so renders stay stable.
 */
export function usePageNow(now: number | undefined, hasRealData: boolean): number {
  const [initial] = React.useState(() => now ?? (hasRealData ? Date.now() : FAKE_NOW));
  return now ?? initial;
}

/** "5m ago", in a <time> element, measured from useNow(). */
export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const now = useNow();
  return (
    <time dateTime={iso} className={className}>
      {timeAgo(iso, now)}
    </time>
  );
}

/* ------------------------------------------------------------------ PageHeader */

export interface PageHeaderTab {
  label: string;
  /** Link target. Without it the tab is a button that calls `onTabChange`. */
  href?: string;
  value?: string;
  isActive?: boolean;
  count?: number;
}

export const pageHeaderVariants = tv({
  slots: {
    root: "grid gap-4",
    top: "flex flex-wrap items-end justify-between gap-x-6 gap-y-3",
    titleGroup: "grid min-w-0 gap-1",
    title: "text-2xl leading-8 font-semibold tracking-tight text-balance text-foreground",
    description: "max-w-2xl text-sm text-muted-foreground text-pretty",
    actions: "flex flex-wrap items-center gap-2",
    tabs: "-mb-px flex gap-4 overflow-x-auto border-b border-border [scrollbar-width:none]",
    tab: [
      "inline-flex h-9 shrink-0 items-center gap-1.5 border-b-2 border-transparent px-0.5 text-sm font-medium whitespace-nowrap text-muted-foreground",
      "transition-colors duration-fast ease-standard hover:text-foreground",
      "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
      "aria-[current=page]:border-foreground aria-[current=page]:text-foreground",
    ],
  },
  variants: {
    size: {
      md: {},
      sm: { title: "text-xl leading-7" },
    },
  },
  defaultVariants: { size: "md" },
});

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: BreadcrumbProps["items"];
  /** Buttons on the right. They wrap under the title on phones. */
  actions?: React.ReactNode;
  tabs?: PageHeaderTab[];
  onTabChange?: (tab: PageHeaderTab) => void;
  size?: "sm" | "md";
  classNames?: Partial<Record<keyof ReturnType<typeof pageHeaderVariants>, string>>;
}

/** Title, description, breadcrumb, actions and section tabs at the top of a page. */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  tabs,
  onTabChange,
  size,
  className,
  classNames,
  ...props
}: PageHeaderProps) {
  const s = pageHeaderVariants({ size });
  return (
    <header data-slot="page-header" className={s.root({ className: cn(classNames?.root, className) })} {...props}>
      {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
      <div className={s.top({ className: classNames?.top })}>
        <div className={s.titleGroup({ className: classNames?.titleGroup })}>
          <h1 className={s.title({ className: classNames?.title })}>{title}</h1>
          {description && <p className={s.description({ className: classNames?.description })}>{description}</p>}
        </div>
        {actions && <div className={s.actions({ className: classNames?.actions })}>{actions}</div>}
      </div>
      {tabs && tabs.length > 0 && (
        <nav aria-label="Sections" className={s.tabs({ className: classNames?.tabs })}>
          {tabs.map((tab) => {
            const inner = (
              <>
                {tab.label}
                {tab.count !== undefined && (
                  <span className="rounded-pill bg-muted px-1.5 text-xs leading-5 tabular-nums text-muted-foreground">
                    {tab.count}
                  </span>
                )}
              </>
            );
            const cls = s.tab({ className: classNames?.tab });
            return tab.href ? (
              <a key={tab.label} href={tab.href} aria-current={tab.isActive ? "page" : undefined} className={cls}>
                {inner}
              </a>
            ) : (
              <button
                key={tab.label}
                type="button"
                aria-current={tab.isActive ? "page" : undefined}
                className={cls}
                onClick={() => onTabChange?.(tab)}
              >
                {inner}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ Page container */

/** Standard page padding and max width, so every page lines up. */
export function PageContainer({
  className,
  size = "lg",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "md" | "lg" | "full" }) {
  return (
    <div
      className={cn(
        "mx-auto grid w-full gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
        size === "md" && "max-w-3xl",
        size === "lg" && "max-w-6xl",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ StatRow */

export interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: DashboardStat[];
  deltaLabel?: React.ReactNode;
  /** "cards": each stat in its own bordered tile. "joined": one bordered strip split by dividers. */
  variant?: "joined" | "cards";
  showSparklines?: boolean;
}

/** A row of key numbers. Wraps to two columns on phones. */
export function StatRow({
  stats,
  deltaLabel = "vs last month",
  variant = "joined",
  showSparklines = true,
  className,
  ...props
}: StatRowProps) {
  const joined = variant === "joined";
  return (
    <div data-slot="stat-row" className={className} {...props}>
      <StatGroup
        className={cn(
          "grid-cols-2 gap-0 lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]",
          joined
            ? "overflow-hidden rounded-card border border-border bg-card [&>*]:border-border [&>*]:p-4 sm:[&>*]:p-5 max-lg:[&>*:nth-child(-n+2)]:border-b max-lg:[&>*:nth-child(odd)]:border-r lg:[&>*:not(:last-child)]:border-r"
            : "gap-3 [&>*]:rounded-card [&>*]:border [&>*]:border-border [&>*]:bg-card [&>*]:p-4 sm:[&>*]:p-5",
        )}
      >
        {stats.map((s) => (
          <Stat
            key={s.label}
            label={s.label}
            value={s.value}
            delta={s.delta}
            isInverse={s.isInverse}
            deltaLabel={deltaLabel}
            chart={showSparklines && s.series ? <Sparkline data={s.series} /> : undefined}
            classNames={{ footer: "max-sm:[&>span:last-child]:hidden" }}
          />
        ))}
      </StatGroup>
    </div>
  );
}

/* ------------------------------------------------------------------ Settings */

export interface SettingsSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons at the bottom (Save). Shown in a footer strip. */
  footer?: React.ReactNode;
  /** "card": rows inside a bordered card. "plain": no container, for a page of only settings. */
  variant?: "card" | "plain";
}

/** A titled group of settings rows. */
export function SettingsSection({
  title,
  description,
  footer,
  variant = "card",
  className,
  children,
  ...props
}: SettingsSectionProps) {
  const id = React.useId();
  const body = (
    <>
      <div className={cn("divide-y divide-border", variant === "card" && "px-4 sm:px-6")}>{children}</div>
      {footer && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-end gap-2",
            variant === "card" ? "border-t border-border bg-muted/40 px-4 py-3 sm:px-6" : "pt-4",
          )}
        >
          {footer}
        </div>
      )}
    </>
  );
  return (
    <section aria-labelledby={`${id}-title`} className={cn("grid gap-4", className)} {...props}>
      <div className="grid gap-1">
        <h2 id={`${id}-title`} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {variant === "card" ? <Card className="overflow-hidden">{body}</Card> : <div>{body}</div>}
    </section>
  );
}

export interface SettingsRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Id of the control, so the title becomes its label. */
  htmlFor?: string;
  /** The control: a Switch, Select, Button... */
  children?: React.ReactNode;
  /** Put the control under the text (for wide inputs). Phones always stack. */
  isStacked?: boolean;
}

/** Label and help text on the left, control on the right; stacks on phones. */
export function SettingsRow({
  title,
  description,
  htmlFor,
  isStacked,
  className,
  children,
  ...props
}: SettingsRowProps) {
  const Title = htmlFor ? "label" : "div";
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4",
        !isStacked && "sm:flex-row sm:items-center sm:justify-between sm:gap-8",
        className,
      )}
      {...props}
    >
      <div className="grid min-w-0 gap-0.5">
        <Title {...(htmlFor ? { htmlFor } : {})} className="text-sm font-medium text-foreground">
          {title}
        </Title>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className={cn("flex shrink-0 items-center gap-2", isStacked && "w-full")}>{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ AuthCard */

export interface AuthProvider {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect?: () => void;
}

export interface AuthCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  logo?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** "Continue with" buttons above the form. */
  providers?: AuthProvider[];
  /** Text on the divider between providers and the form. */
  dividerLabel?: string;
  /** Under the card: "No account? Sign up". */
  footer?: React.ReactNode;
  /** "card": bordered card. "plain": no border (for split layouts). */
  variant?: "card" | "plain";
}

/** Logo, title, provider buttons, a form (children) and a footer link. */
export function AuthCard({
  logo,
  title,
  description,
  providers,
  dividerLabel = "or",
  footer,
  variant = "card",
  className,
  children,
  ...props
}: AuthCardProps) {
  return (
    <div className={cn("grid w-full max-w-sm gap-6", className)} {...props}>
      <div className={cn("grid gap-6", variant === "card" && "rounded-card border border-border bg-card p-6 sm:p-8")}>
        <div className="grid gap-2 text-center">
          {logo && <div className="mb-2 flex justify-center">{logo}</div>}
          <h1 className="text-xl font-semibold tracking-tight text-balance">{title}</h1>
          {description && <p className="text-sm text-muted-foreground text-balance">{description}</p>}
        </div>
        {providers && providers.length > 0 && (
          <>
            <div className={cn("grid gap-2", providers.length > 1 && "sm:grid-cols-2")}>
              {providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={p.onSelect}
                  className={cn(
                    "inline-flex h-9 items-center justify-center gap-2 rounded-control border border-border bg-surface px-3 text-sm font-medium",
                    "transition-colors duration-fast ease-standard hover:bg-accent",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4",
                  )}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Separator className="flex-1" />
              {dividerLabel}
              <Separator className="flex-1" />
            </div>
          </>
        )}
        {children}
      </div>
      {footer && <p className="text-center text-sm text-muted-foreground">{footer}</p>}
    </div>
  );
}

/** The brand mark used by the fake data: a rounded square with the first letter. */
export function LogoMark({ name = "Northwind", className }: { name?: string; className?: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "grid size-9 place-items-center rounded-card bg-primary text-base font-semibold text-primary-foreground",
        className,
      )}
    >
      <span aria-hidden>{name.charAt(0)}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ ActivityFeed */

export interface ActivityFeedProps extends React.HTMLAttributes<HTMLOListElement> {
  items: ActivityItem[];
}

/** A timeline of who did what, newest first. */
export function ActivityFeed({ items, className, ...props }: ActivityFeedProps) {
  return (
    <ol className={cn("grid", className)} {...props}>
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < items.length - 1 && <span aria-hidden className="absolute top-8 bottom-0 left-[15px] w-px bg-border" />}
          <Avatar name={item.actor.name} src={item.actor.avatarUrl} size="sm" />
          <div className="grid min-w-0 gap-0.5 pt-1.5 text-sm">
            <p className="text-pretty text-muted-foreground">
              <span className="font-medium text-foreground">{item.actor.name}</span> {item.action}
              {item.target && (
                <>
                  {" "}
                  <span className="font-medium text-foreground">{item.target}</span>
                </>
              )}
            </p>
            <TimeAgo iso={item.at} className="text-xs text-muted-foreground" />
          </div>
        </li>
      ))}
    </ol>
  );
}
