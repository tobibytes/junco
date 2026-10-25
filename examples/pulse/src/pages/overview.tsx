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
  toast,
} from "junco";
import { AreaChart, BarChart, PageContainer, PageHeader, StatRow } from "@junco/blocks/app";
import { timeAgo } from "@junco/blocks/fake";
import type { PageProps } from "../app";
import { breakdown, events, NOW, series, stats, topEvents, type Range } from "../data";
import { ArrowRightIcon, DownloadIcon } from "../icons";
import { Segmented } from "../segmented";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function RangePicker({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <Segmented
      label="Date range"
      value={value}
      onChange={onChange}
      options={[
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
        { value: "90d", label: "90 days" },
      ]}
    />
  );
}

/** A ranked list with a soft bar behind each row, like Plausible or Vercel Analytics. */
function RankedList({ rows, format }: { rows: { name: string; value: number }[]; format: (v: number) => string }) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="grid gap-1">
      {rows.map((row) => (
        <li key={row.name} className="relative flex h-8 items-center justify-between gap-3 px-2.5 text-sm">
          <span aria-hidden className="absolute inset-y-0 left-0 rounded-control bg-primary/10" style={{ width: `${(row.value / max) * 100}%` }} />
          <span className="relative truncate">{row.name}</span>
          <span className="relative font-mono text-xs tabular-nums text-muted-foreground">{format(row.value)}</span>
        </li>
      ))}
    </ul>
  );
}

function Breakdown() {
  const [key, setKey] = React.useState<"country" | "device" | "browser">("country");
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Audience</CardTitle>
        <CardDescription>Share of events, last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Segmented
          label="Break down by"
          value={key}
          onChange={setKey}
          className="w-full"
          options={[
            { value: "country", label: "Country" },
            { value: "device", label: "Device" },
            { value: "browser", label: "Browser" },
          ]}
        />
        <RankedList rows={breakdown(key).slice(0, 6).map((r) => ({ name: r.name, value: r.share }))} format={(v) => `${v}%`} />
      </CardContent>
    </Card>
  );
}

function LiveFeed({ onSeeAll }: { onSeeAll: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2">Live events</CardTitle>
        <CardDescription>The newest events across your project.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onSeeAll}>
            View all <ArrowRightIcon className="size-3.5" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className="grid">
          {events.slice(0, 7).map((e) => (
            <li key={e.id} className="flex items-center gap-3 border-b border-border py-2.5 text-sm last:border-b-0">
              <span aria-hidden className="size-1.5 shrink-0 rounded-pill bg-primary" />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{e.name}</span>
                <span className="text-muted-foreground"> · {e.userName}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{timeAgo(e.at, NOW)}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export function OverviewPage({ navigate }: PageProps) {
  const [range, setRange] = React.useState<Range>("30d");
  const data = series(range);
  const label = range === "7d" ? "last 7 days" : range === "30d" ? "last 30 days" : "last 90 days";

  return (
    <PageContainer>
      <PageHeader
        title="Overview"
        description={
          <>
            How people use <span className="font-medium text-foreground">Northwind Docs</span>, {label}.
          </>
        }
        actions={
          <>
            <RangePicker value={range} onChange={setRange} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Report exported", { description: `overview-${range}.pdf is ready.` })}
            >
              <DownloadIcon className="size-4" /> Export
            </Button>
          </>
        }
      />

      <StatRow stats={stats(range)} deltaLabel={`vs previous ${range === "7d" ? "week" : "period"}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle as="h2">Active users</CardTitle>
            <CardDescription>Daily unique users who did anything, {label}.</CardDescription>
            <CardAction>
              <Badge variant="outline" color="success" hasDot>
                Healthy
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <AreaChart data={data.activeUsers} label={`Daily active users, ${label}`} height={240} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h2">Sign-ups</CardTitle>
            <CardDescription>New accounts per day.</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={data.signups.slice(-14)}
              label={`Sign-ups per day, last ${Math.min(14, data.signups.length)} days`}
              height={240}
              xTicks={4}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle as="h2">Top events</CardTitle>
            <CardDescription>Most frequent, last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <RankedList rows={topEvents().slice(0, 7).map((t) => ({ name: t.name, value: t.count }))} format={compact.format} />
          </CardContent>
        </Card>
        <Breakdown />
        <LiveFeed onSeeAll={() => navigate("/events")} />
      </div>
    </PageContainer>
  );
}
