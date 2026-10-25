import * as React from "react";
import {
  Avatar,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  toast,
} from "junco";
import { DataTable, type ColumnDef } from "junco/data-table";
import { PageContainer, PageHeader, StatRow } from "@junco/blocks/app";
import { timeAgo } from "@junco/blocks/fake";
import type { PageProps } from "../app";
import { events, NOW, PLANS, users, type Plan, type PulseUser } from "../data";
import { MoreIcon } from "../icons";

const ALL = "all";
const nf = new Intl.NumberFormat("en-US");

const planColor: Record<Plan, "neutral" | "primary" | "success" | "warning"> = {
  Free: "neutral",
  Pro: "primary",
  Team: "success",
  Enterprise: "warning",
};

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <Badge variant="outline" color={planColor[plan]}>
      {plan}
    </Badge>
  );
}

function UserProfile({ user, onClose }: { user: PulseUser | null; onClose: () => void }) {
  const recent = user ? events.filter((e) => e.userId === user.id).slice(0, 6) : [];
  return (
    <Sheet open={user !== null} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        {user && (
          <>
            <SheetHeader className="flex items-center gap-3 [grid-template-columns:auto_1fr]">
              <Avatar name={user.name} size="lg" />
              <div className="grid gap-0.5">
                <SheetTitle>{user.name}</SheetTitle>
                <SheetDescription>{user.email}</SheetDescription>
              </div>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-border bg-border text-center">
              {[
                ["Sessions", nf.format(user.sessions)],
                ["Events", nf.format(user.events)],
                ["Plan", user.plan],
              ].map(([k, v]) => (
                <div key={k} className="bg-card p-3">
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className="mt-0.5 font-semibold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
            <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Company</dt>
              <dd>{user.company}</dd>
              <dt className="text-muted-foreground">Country</dt>
              <dd>{user.country}</dd>
              <dt className="text-muted-foreground">Device</dt>
              <dd>{user.device}</dd>
              <dt className="text-muted-foreground">First seen</dt>
              <dd>{timeAgo(user.firstSeen, NOW)}</dd>
              <dt className="text-muted-foreground">Last seen</dt>
              <dd>{timeAgo(user.lastSeen, NOW)}</dd>
            </dl>
            <section className="grid gap-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Recent activity</h3>
              {recent.length ? (
                <ol className="grid">
                  {recent.map((e) => (
                    <li key={e.id} className="flex justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0">
                      <span className="truncate">{e.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{timeAgo(e.at, NOW)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No events in the last 7 days.</p>
              )}
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function UsersPage(_: PageProps) {
  const [plan, setPlan] = React.useState<string>(ALL);
  const [profile, setProfile] = React.useState<PulseUser | null>(null);
  const rows = React.useMemo(() => users.filter((u) => plan === ALL || u.plan === plan), [plan]);

  const columns = React.useMemo<ColumnDef<PulseUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setProfile(row.original)}
            className="flex min-w-0 items-center gap-3 rounded-control text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Avatar name={row.original.name} size="sm" />
            <span className="grid min-w-0">
              <span className="truncate font-medium">{row.original.name}</span>
              <span className="truncate text-xs text-muted-foreground">{row.original.email}</span>
            </span>
          </button>
        ),
      },
      { accessorKey: "plan", header: "Plan", cell: ({ getValue }) => <PlanBadge plan={getValue<Plan>()} /> },
      { accessorKey: "country", header: "Country" },
      { accessorKey: "sessions", header: "Sessions", meta: { align: "right" }, cell: ({ getValue }) => <span className="tabular-nums">{nf.format(getValue<number>())}</span> },
      { accessorKey: "events", header: "Events", meta: { align: "right" }, cell: ({ getValue }) => <span className="tabular-nums">{nf.format(getValue<number>())}</span> },
      {
        accessorKey: "lastSeen",
        header: "Last seen",
        sortingFn: (a, b) => Date.parse(a.original.lastSeen) - Date.parse(b.original.lastSeen),
        cell: ({ getValue }) => <span className="text-muted-foreground tabular-nums">{timeAgo(getValue<string>(), NOW)}</span>,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        enableHiding: false,
        meta: { align: "right", className: "w-12" },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${row.original.name}`}>
                <MoreIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{row.original.name}</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setProfile(row.original)}>View profile</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  void navigator.clipboard?.writeText(row.original.id).catch(() => {});
                  toast.success("User ID copied", { description: row.original.id });
                }}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toast("Export queued", { description: `We'll email ${row.original.name}'s data export.` })}>
                Export their data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="danger"
                onSelect={() =>
                  toast.warning("Deletion scheduled", {
                    description: `${row.original.name}'s events will be deleted in 24 hours.`,
                    action: { label: "Undo", onClick: () => toast.success("Deletion cancelled") },
                  })
                }
              >
                Delete their data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const paying = users.filter((u) => u.plan !== "Free").length;

  return (
    <PageContainer>
      <PageHeader title="Users" description="Everyone who used Northwind Docs in the last 90 days." />
      <StatRow
        variant="cards"
        showSparklines={false}
        deltaLabel="vs last month"
        stats={[
          { label: "Tracked users", value: nf.format(users.length * 412), delta: 8.4 },
          { label: "Paying", value: `${Math.round((paying / users.length) * 100)}%`, delta: 2.1 },
          { label: "Events per user", value: nf.format(Math.round(users.reduce((n, u) => n + u.events, 0) / users.length)), delta: -1.3 },
        ]}
      />
      <DataTable
        caption="Users"
        columns={columns}
        data={rows}
        getRowId={(u) => u.id}
        enableRowSelection
        enableGlobalFilter
        searchPlaceholder="Search people and companies…"
        defaultSorting={[{ id: "lastSeen", desc: true }]}
        pageSize={10}
        toolbar={
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger aria-label="Plan" size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All plans</SelectItem>
              {PLANS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <UserProfile user={profile} onClose={() => setProfile(null)} />
    </PageContainer>
  );
}
