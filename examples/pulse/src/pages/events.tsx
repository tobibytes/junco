import * as React from "react";
import {
  Badge,
  Button,
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
} from "@junco/react";
import { DataTable, type ColumnDef } from "@junco/react/data-table";
import { PageContainer, PageHeader } from "@junco/blocks/app";
import { timeAgo } from "@junco/blocks/fake";
import type { PageProps } from "../app";
import { DEVICES, EVENT_TYPES, events, NOW, type PulseEvent } from "../data";
import { CopyIcon, DownloadIcon } from "../icons";

const ALL = "all";

function EventDetails({ event, onClose }: { event: PulseEvent | null; onClose: () => void }) {
  return (
    <Sheet open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[min(28rem,calc(100vw-3rem))]">
        {event && (
          <>
            <SheetHeader>
              <SheetTitle>{event.name}</SheetTitle>
              <SheetDescription>
                {new Date(event.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC ·{" "}
                {timeAgo(event.at, NOW)}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6">
              <section className="grid gap-2">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Context</h3>
                <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                  {[
                    ["User", event.userName],
                    ["Path", event.path],
                    ["Country", event.country],
                    ["Device", event.device],
                    ["Browser", event.browser],
                    ["Event ID", event.id],
                  ].map(([k, v]) => (
                    <React.Fragment key={k}>
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="truncate font-medium">{v}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </section>
              <section className="grid gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Properties</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard?.writeText(JSON.stringify(event.properties, null, 2)).catch(() => {});
                      toast.success("Properties copied");
                    }}
                  >
                    <CopyIcon className="size-3.5" /> Copy JSON
                  </Button>
                </div>
                <pre className="overflow-x-auto rounded-card border border-border bg-muted/50 p-4 font-mono text-xs leading-5" tabIndex={0}>
                  {JSON.stringify(event.properties, null, 2)}
                </pre>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function EventsPage(_: PageProps) {
  const [type, setType] = React.useState<string>(ALL);
  const [device, setDevice] = React.useState<string>(ALL);
  const [selected, setSelected] = React.useState<PulseEvent | null>(null);

  const rows = React.useMemo(
    () => events.filter((e) => (type === ALL || e.name === type) && (device === ALL || e.device === device)),
    [type, device],
  );

  const columns = React.useMemo<ColumnDef<PulseEvent>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Event",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelected(row.original)}
            className="rounded-xs font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {row.original.name}
          </button>
        ),
      },
      { accessorKey: "userName", header: "User" },
      {
        accessorKey: "path",
        header: "Path",
        cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue<string>()}</span>,
      },
      { accessorKey: "country", header: "Country" },
      {
        accessorKey: "device",
        header: "Device",
        cell: ({ getValue }) => <Badge variant="outline">{getValue<string>()}</Badge>,
      },
      {
        accessorKey: "at",
        header: "Time",
        meta: { align: "right" },
        sortingFn: (a, b) => Date.parse(a.original.at) - Date.parse(b.original.at),
        cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{timeAgo(getValue<string>(), NOW)}</span>,
      },
    ],
    [],
  );

  const filtered = type !== ALL || device !== ALL;

  return (
    <PageContainer>
      <PageHeader
        title="Events"
        description="Every tracked event in the last 7 days. Click an event to see its properties."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Export started", { description: `${rows.length} events will download as CSV.` })}
          >
            <DownloadIcon className="size-4" /> Export CSV
          </Button>
        }
      />
      <DataTable
        caption="Events, last 7 days"
        columns={columns}
        data={rows}
        getRowId={(e) => e.id}
        enableGlobalFilter
        enableColumnVisibility
        searchPlaceholder="Search events, users, paths…"
        defaultSorting={[{ id: "at", desc: true }]}
        pageSize={12}
        toolbar={
          <>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger aria-label="Event type" size="sm" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All events</SelectItem>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.name} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={device} onValueChange={setDevice}>
              <SelectTrigger aria-label="Device" size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All devices</SelectItem>
                {DEVICES.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setType(ALL);
                  setDevice(ALL);
                }}
              >
                Clear
              </Button>
            )}
          </>
        }
      />
      <EventDetails event={selected} onClose={() => setSelected(null)} />
    </PageContainer>
  );
}
