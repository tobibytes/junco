import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from "@junco/react";
import { DataTable, type ColumnDef } from "@junco/react/data-table";
import { money } from "../../lib/fake";
import { renderSlot, type Slots } from "../../lib/slots";
import { ActivityFeed, NowProvider, PageContainer, PageHeader, StatRow, useMediaQuery, usePageNow } from "../blocks";
import { AreaChart, BarChart } from "../charts";
import {
  fakeActivity,
  fakeDashboardStats,
  fakeRevenue,
  fakeSignups,
  fakeTopCustomers,
  type ActivityItem,
  type ChartPoint,
  type DashboardCustomer,
  type DashboardStat,
} from "../fake-data";
import { DownloadIcon } from "../icons";

export type DashboardRange = "7d" | "30d" | "90d";

const rangeDays: Record<DashboardRange, number> = { "7d": 7, "30d": 30, "90d": 90 };
const rangeLabel: Record<DashboardRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

export type DashboardSlots = {
  header: { title: string; range: DashboardRange; onRangeChange: (r: DashboardRange) => void };
  stats: { stats: DashboardStat[] };
  revenue: { data: ChartPoint[]; range: DashboardRange };
  signups: { data: ChartPoint[] };
  customers: { customers: DashboardCustomer[]; allHref: string | null };
  activity: { items: ActivityItem[] };
};

export interface DashboardPageProps {
  title?: string;
  stats?: DashboardStat[];
  /** Daily revenue. When omitted, fake data matching the selected range. */
  revenue?: ChartPoint[];
  signups?: ChartPoint[];
  customers?: DashboardCustomer[];
  /** Where "View all" on the customers card goes. null hides the link. */
  customersHref?: string | null;
  activity?: ActivityItem[];
  range?: DashboardRange;
  defaultRange?: DashboardRange;
  onRangeChange?: (range: DashboardRange) => void;
  /** "default": charts + table beside an activity column. "focused": no activity, charts full width. */
  variant?: "default" | "focused";
  /** Clock for relative times. Defaults to real time with real activity, the fake clock otherwise. */
  now?: number;
  slots?: Slots<DashboardSlots>;
  className?: string;
}

function Header({ title, range, onRangeChange }: DashboardSlots["header"]) {
  return (
    <PageHeader
      title={title}
      description="How the business is doing, at a glance."
      actions={
        <>
          <Select value={range} onValueChange={(v) => onRangeChange(v as DashboardRange)}>
            <SelectTrigger aria-label="Date range" className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(rangeLabel) as DashboardRange[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {rangeLabel[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() =>
              toast.promise(new Promise((r) => setTimeout(r, 900)), {
                loading: "Preparing export…",
                success: "Report exported",
                error: "Export failed",
              })
            }
          >
            <DownloadIcon className="size-4" />
            Export
          </Button>
        </>
      }
    />
  );
}

function Stats({ stats }: DashboardSlots["stats"]) {
  return <StatRow stats={stats} />;
}

function Revenue({ data, range }: DashboardSlots["revenue"]) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Revenue</CardTitle>
        <CardDescription>{rangeLabel[range]}</CardDescription>
        <CardAction>
          <span className="text-lg font-semibold tabular-nums">{money(total)}</span>
        </CardAction>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={data}
          label={`Daily revenue, ${rangeLabel[range].toLowerCase()}`}
          formatValue={(v) => money(v)}
          xTicks={range === "7d" ? 7 : 5}
        />
      </CardContent>
    </Card>
  );
}

function Signups({ data }: DashboardSlots["signups"]) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Signups</CardTitle>
        <CardDescription>New accounts per month</CardDescription>
      </CardHeader>
      <CardContent>
        <BarChart data={data} label="New accounts per month, last 12 months" xTicks={6} />
      </CardContent>
    </Card>
  );
}

const planColor = { Starter: "neutral", Pro: "primary", Business: "success", Enterprise: "warning" } as const;

const customerColumns: ColumnDef<DashboardCustomer>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <Badge variant="outline" color={planColor[row.original.plan as keyof typeof planColor] ?? "neutral"}>
        {row.original.plan}
      </Badge>
    ),
  },
  {
    accessorKey: "seats",
    header: "Seats",
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="tabular-nums">{getValue<number>()}</span>,
  },
  {
    accessorKey: "mrr",
    header: "MRR",
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="tabular-nums">{money(getValue<number>())}</span>,
  },
];

function Customers({ customers, allHref }: DashboardSlots["customers"]) {
  // On phones, drop Seats so MRR (the number that matters) fits without scrolling sideways.
  const isPhone = useMediaQuery("(max-width: 639px)");
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Top customers</CardTitle>
        <CardDescription>By monthly recurring revenue</CardDescription>
        {allHref !== null && (
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <a href={allHref}>View all</a>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={customerColumns}
          data={customers}
          getRowId={(r) => r.id}
          caption="Top customers"
          pageSize={false}
          density="compact"
          isStickyHeader={false}
          defaultSorting={[{ id: "mrr", desc: true }]}
          columnVisibility={{ seats: !isPhone }}
        />
      </CardContent>
    </Card>
  );
}

function Activity({ items }: DashboardSlots["activity"]) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Activity</CardTitle>
        <CardDescription>What your team did today</CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityFeed items={items} />
      </CardContent>
    </Card>
  );
}

/** Analytics overview: key numbers, revenue trend, signups, top customers and team activity. */
export function DashboardPage({
  title = "Overview",
  stats,
  revenue,
  signups,
  customers,
  customersHref = "#/users",
  activity,
  range: rangeProp,
  defaultRange = "30d",
  onRangeChange,
  variant = "default",
  now: nowProp,
  slots,
  className,
}: DashboardPageProps) {
  const now = usePageNow(nowProp, activity !== undefined);
  const [innerRange, setInnerRange] = React.useState<DashboardRange>(defaultRange);
  const range = rangeProp ?? innerRange;
  const setRange = (r: DashboardRange) => {
    if (rangeProp === undefined) setInnerRange(r);
    onRangeChange?.(r);
  };
  const revenueData = React.useMemo(() => revenue ?? fakeRevenue(rangeDays[range]), [revenue, range]);
  const statsData = React.useMemo(() => stats ?? fakeDashboardStats(), [stats]);
  const signupData = React.useMemo(() => signups ?? fakeSignups(), [signups]);
  const customerData = React.useMemo(() => customers ?? fakeTopCustomers(), [customers]);
  const activityData = React.useMemo(() => activity ?? fakeActivity(6), [activity]);

  const activityNode = variant === "default" ? renderSlot(slots, "activity", Activity, { items: activityData }) : null;

  return (
    <NowProvider value={now}>
      <PageContainer className={className}>
        {renderSlot(slots, "header", Header, { title, range, onRangeChange: setRange })}
        {renderSlot(slots, "stats", Stats, { stats: statsData })}
        <div className={cn("grid gap-6", variant === "default" && "lg:grid-cols-5")}>
          <div className={cn("grid min-w-0 gap-6", variant === "default" && activityNode !== null && "lg:col-span-3")}>
            {renderSlot(slots, "revenue", Revenue, { data: revenueData, range })}
            {renderSlot(slots, "customers", Customers, { customers: customerData, allHref: customersHref })}
          </div>
          <div
            className={cn(
              "grid min-w-0 content-start gap-6",
              variant === "default" && "lg:col-span-2",
              variant === "focused" && "lg:grid-cols-2",
            )}
          >
            {renderSlot(slots, "signups", Signups, { data: signupData })}
            {activityNode}
          </div>
        </div>
      </PageContainer>
    </NowProvider>
  );
}
