import * as React from "react";
import { Avatar, Badge, cn, Sparkline } from "junco";
import { fakeSeries } from "../lib/fake";
import { ChartIcon, GitBranchIcon, InboxIcon, LayersIcon, SearchIcon, UsersIcon } from "./icons";
import { BrandMark } from "./layout";

const issues = [
  { id: "ORB-214", title: "Speed up first load on the board view", status: "In progress", color: "warning", who: "Maya Chen" },
  { id: "ORB-209", title: "Keyboard shortcuts for moving cards", status: "Done", color: "success", who: "Leo Okafor" },
  { id: "ORB-221", title: "Sync labels with GitHub", status: "Todo", color: "neutral", who: "Ada Lovelace" },
  { id: "ORB-198", title: "Dark mode for embedded docs", status: "Done", color: "success", who: "Zara Silva" },
] as const;

const projects = [
  { name: "Timeline rebuild", start: 0, span: 3.2, color: "var(--chart-1)", progress: 0.8 },
  { name: "AI triage", start: 1.4, span: 2.6, color: "var(--chart-2)", progress: 0.55 },
  { name: "Mobile app", start: 2.2, span: 3.6, color: "var(--chart-4)", progress: 0.2, isLate: true },
  { name: "SSO for Business", start: 3.4, span: 1.8, color: "var(--chart-5)", progress: 0 },
  { name: "Search index v2", start: 0.6, span: 1.6, color: "var(--chart-3)", progress: 1 },
];
const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const activity = [
  { who: "Maya Chen", what: "opened pull request", target: "#482 Speed up board view", status: "In progress", color: "warning", time: "2m" },
  { who: "Orbit", what: "moved", target: "ORB-209 to Done after #479 merged", status: "Done", color: "success", time: "14m" },
  { who: "Leo Okafor", what: "created branch", target: "leo/orb-221-label-sync", status: "In progress", color: "warning", time: "1h" },
  { who: "Orbit", what: "posted the daily digest to", target: "#eng-orbit", status: "Sent", color: "neutral", time: "3h" },
] as const;

export interface ProductMockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Which screen to draw. Default "issues". */
  view?: "issues" | "roadmap" | "activity";
  /** Accessible description of the picture. Defaults to one per view. */
  label?: string;
}

const labels = {
  issues: "Preview of the Orbit app: a list of issues with velocity and cycle progress",
  roadmap: "Preview of the Orbit roadmap: projects laid out across six months, one marked as running late",
  activity: "Preview of Orbit's activity feed: pull requests and branches updating issues automatically",
};

function Sidebar({ active }: { active: number }) {
  return (
    <aside className="hidden w-48 shrink-0 flex-col gap-0.5 border-r border-border bg-background/60 p-3 @2xl:flex">
      <div className="mb-3 flex items-center gap-2 px-2 font-medium">
        <BrandMark className="size-5" /> Orbit
      </div>
      {(
        [
          [InboxIcon, "Inbox", "3"],
          [LayersIcon, "Issues", ""],
          [ChartIcon, "Roadmap", ""],
          [UsersIcon, "Team", ""],
        ] as const
      ).map(([Icon, label, count], i) => (
        <div
          key={label}
          className={cn("flex h-8 items-center gap-2 rounded-control px-2 text-muted-foreground", i === active && "bg-accent text-foreground")}
        >
          <Icon className="size-4" />
          <span className="flex-1">{label}</span>
          {count && <span className="font-mono text-[11px]">{count}</span>}
        </div>
      ))}
      <p className="mt-5 px-2 text-[11px] font-medium text-muted-foreground">Cycles</p>
      {["Cycle 24", "Cycle 25"].map((c, i) => (
        <div key={c} className="flex h-8 items-center gap-2 px-2 text-muted-foreground">
          <span className={cn("size-2 rounded-pill", i ? "bg-border-strong" : "bg-primary")} />
          {c}
        </div>
      ))}
    </aside>
  );
}

function TopBar({ title, crumb }: { title: string; crumb: string }) {
  return (
    <div className="flex h-11 items-center gap-3 border-b border-border px-4">
      <span className="font-medium">{title}</span>
      <span className="text-muted-foreground">/</span>
      <span className="text-muted-foreground">{crumb}</span>
      <div className="ml-auto hidden h-7 w-40 items-center gap-2 rounded-control border border-border px-2 text-muted-foreground @md:flex">
        <SearchIcon className="size-3.5" /> Search
      </div>
    </div>
  );
}

function IssuesView() {
  const velocity = React.useMemo(() => fakeSeries(16, { seed: 9, start: 40, volatility: 0.18, trend: 0.03 }), []);
  return (
    <>
      <TopBar title="Issues" crumb="Cycle 24" />
      <div className="grid grid-cols-2 gap-3 border-b border-border p-4 @lg:grid-cols-3">
        <div className="rounded-card border border-border p-3">
          <p className="text-muted-foreground">Velocity</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">48 pts</p>
          <Sparkline data={velocity} className="mt-2 h-8 w-full text-primary" />
        </div>
        <div className="rounded-card border border-border p-3">
          <p className="text-muted-foreground">Cycle progress</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">72%</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-pill bg-muted">
            <div className="h-full w-[72%] rounded-pill bg-primary" />
          </div>
        </div>
        <div className="hidden rounded-card border border-border p-3 @lg:block">
          <p className="text-muted-foreground">Open issues</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">31</p>
          <p className="mt-3 text-success-text">↓ 6 since Monday</p>
        </div>
      </div>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id} className="flex h-11 items-center gap-3 border-b border-border px-4 last:border-b-0">
            <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">{issue.id}</span>
            <span className="min-w-0 flex-1 truncate">{issue.title}</span>
            <Badge variant="outline" color={issue.color} hasDot className="hidden @md:inline-flex">
              {issue.status}
            </Badge>
            <Avatar name={issue.who} size="xs" />
          </li>
        ))}
      </ul>
    </>
  );
}

function RoadmapView() {
  const unit = 100 / months.length;
  return (
    <>
      <TopBar title="Roadmap" crumb="H2 2026" />
      <div className="relative px-4 pt-3 pb-4">
        <div className="grid grid-cols-6 border-b border-border pb-2 text-[11px] text-muted-foreground">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-3 left-4 right-4 grid grid-cols-6">
          {months.map((m) => (
            <span key={m} className="border-l border-border/60 first:border-l-0" />
          ))}
        </div>
        <div className="absolute top-3 bottom-4 w-px bg-primary" style={{ left: `calc(1rem + (100% - 2rem) * ${(3.3 * unit) / 100})` }}>
          <span className="absolute -top-0.5 -left-1 size-2 rounded-pill bg-primary" />
        </div>
        <ul className="relative mt-3 grid gap-2.5">
          {projects.map((p) => (
            <li key={p.name} className="relative h-8">
              <div
                className="absolute inset-y-0 flex items-center gap-2 overflow-hidden rounded-control border px-2"
                style={{
                  left: `${p.start * unit}%`,
                  width: `${p.span * unit}%`,
                  borderColor: `color-mix(in srgb, ${p.color} 45%, transparent)`,
                  background: `color-mix(in srgb, ${p.color} 14%, var(--card))`,
                }}
              >
                <span className="size-2 shrink-0 rounded-pill" style={{ background: p.color }} />
                <span className="truncate font-medium">{p.name}</span>
                {p.isLate && <span className="ml-auto shrink-0 text-[11px] font-medium text-destructive-text">At risk</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ActivityView() {
  return (
    <>
      <TopBar title="Activity" crumb="Today" />
      <ul className="p-2">
        {activity.map((a) => (
          <li key={a.target} className="flex items-start gap-3 rounded-control px-2 py-2.5">
            {a.who === "Orbit" ? (
              <span className="grid size-6 shrink-0 place-items-center rounded-pill border border-border bg-surface">
                <BrandMark className="size-4" />
              </span>
            ) : (
              <Avatar name={a.who} size="xs" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-pretty">
                <span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span>{" "}
                <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                  {a.what.includes("branch") && <GitBranchIcon className="size-3.5" />}
                  {a.target}
                </span>
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="outline" color={a.color} hasDot>
                  {a.status}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{a.time} ago</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * A believable product screen drawn with real Junco components, for heroes and feature sections
 * when you don't have screenshots yet. It adapts to the width it's given (container queries), not
 * the screen. It's a picture: one accessible name, nothing focusable.
 */
export function ProductMock({ view = "issues", label, className, ...props }: ProductMockProps) {
  return (
    <div
      role="img"
      aria-label={label ?? labels[view]}
      className={cn(
        "@container overflow-hidden rounded-[calc(var(--radius)*1.5)] border border-border bg-card text-left shadow-overlay select-none",
        className,
      )}
      {...props}
    >
      <div inert className="flex text-[13px]">
        <Sidebar active={view === "roadmap" ? 2 : view === "activity" ? 0 : 1} />
        <div className="min-w-0 flex-1">
          {view === "roadmap" ? <RoadmapView /> : view === "activity" ? <ActivityView /> : <IssuesView />}
        </div>
      </div>
    </div>
  );
}
