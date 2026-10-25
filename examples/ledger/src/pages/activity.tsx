import * as React from "react";
import {
  Button,
  EmptyState,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "junco";
import { DataTable, type ColumnDef } from "junco/data-table";
import { useMediaQuery } from "@junco/blocks/app";
import { ACCOUNTS, CATEGORIES, dayLabel, usd, type Transaction } from "../data";
import { PlusIcon, SearchIcon } from "../icons";
import { Segmented } from "../segmented";
import { useLedger } from "../store";
import { Amount, CategoryIcon, categoryLabel } from "../ui";

type Kind = "all" | "spending" | "income";
const ALL = "all";
const accountName = (id: string) => ACCOUNTS.find((a) => a.id === id)?.name ?? id;

function Filters({
  query,
  setQuery,
  kind,
  setKind,
  category,
  setCategory,
}: {
  query: string;
  setQuery: (q: string) => void;
  kind: Kind;
  setKind: (k: Kind) => void;
  category: string;
  setCategory: (c: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
      <div className="relative sm:w-72">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transactions" aria-label="Search transactions" className="pl-9" />
      </div>
      <div className="flex gap-2 sm:contents">
        <Segmented
          label="Show"
          value={kind}
          onChange={setKind}
          className="h-9 flex-1 sm:flex-none [&>button]:h-full"
          options={[
            { value: "all", label: "All" },
            { value: "spending", label: "Spending" },
            { value: "income", label: "Income" },
          ]}
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger aria-label="Category" className="w-40 sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function GroupedList({ rows }: { rows: Transaction[] }) {
  const groups = React.useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of rows.slice(0, 80)) map.set(t.date, [...(map.get(t.date) ?? []), t]);
    return [...map.entries()];
  }, [rows]);
  return (
    <div className="grid gap-5">
      {groups.map(([date, list]) => {
        const net = list.reduce((n, t) => n + t.amount, 0);
        return (
          <section key={date} className="grid gap-1.5" aria-label={dayLabel(date)}>
            <div className="flex justify-between px-1 text-xs font-medium text-muted-foreground">
              <span>{dayLabel(date)}</span>
              <span className="tabular-nums">{usd(net, { sign: true })}</span>
            </div>
            <ul className="grid rounded-card border border-border bg-card px-4">
              {list.map((t) => (
                <li key={t.id} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                  <CategoryIcon category={t.category} />
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">{t.description}</span>
                    <span className="truncate text-xs text-muted-foreground">{categoryLabel(t.category)}</span>
                  </span>
                  <Amount value={t.amount} className="text-sm" />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function ActivityPage() {
  const { transactions, openAdd } = useLedger();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState<Kind>("all");
  const [category, setCategory] = React.useState(ALL);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter(
      (t) =>
        (kind === "all" || (kind === "income" ? t.amount > 0 : t.amount < 0)) &&
        (category === ALL || t.category === category) &&
        (!q || t.description.toLowerCase().includes(q) || categoryLabel(t.category).toLowerCase().includes(q)),
    );
  }, [transactions, query, kind, category]);

  const spent = rows.filter((t) => t.amount < 0).reduce((n, t) => n - t.amount, 0);
  const earned = rows.filter((t) => t.amount > 0).reduce((n, t) => n + t.amount, 0);

  const columns = React.useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Transaction",
        cell: ({ row }) => (
          <span className="flex min-w-0 items-center gap-3">
            <CategoryIcon category={row.original.category} className="size-8" />
            <span className="truncate font-medium">{row.original.description}</span>
          </span>
        ),
      },
      { accessorKey: "category", header: "Category", cell: ({ getValue }) => categoryLabel(getValue<Transaction["category"]>()) },
      { accessorKey: "accountId", header: "Account", cell: ({ getValue }) => <span className="text-muted-foreground">{accountName(getValue<string>())}</span> },
      { accessorKey: "date", header: "Date", cell: ({ getValue }) => <span className="tabular-nums text-muted-foreground">{dayLabel(getValue<string>())}</span> },
      { accessorKey: "amount", header: "Amount", meta: { align: "right" }, cell: ({ getValue }) => <Amount value={getValue<number>()} /> },
    ],
    [],
  );

  const empty = (
    <EmptyState
      title="No transactions match"
      description="Try a different search or clear the filters."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setQuery("");
            setKind("all");
            setCategory(ALL);
          }}
        >
          Clear filters
        </Button>
      }
    />
  );

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {rows.length} transactions · <span className="text-foreground">{usd(spent, { cents: false })}</span> out ·{" "}
            <span className="text-success-text">{usd(earned, { cents: false })}</span> in
          </p>
        </div>
        <Button size="sm" onClick={openAdd} className="max-md:hidden">
          <PlusIcon className="size-4" /> Add transaction
        </Button>
      </header>
      <Filters query={query} setQuery={setQuery} kind={kind} setKind={setKind} category={category} setCategory={setCategory} />
      {isDesktop ? (
        <DataTable
          caption="Transactions"
          columns={columns}
          data={rows}
          getRowId={(t) => t.id}
          defaultSorting={[{ id: "date", desc: true }]}
          pageSize={12}
          emptyState={empty}
        />
      ) : rows.length ? (
        <GroupedList rows={rows} />
      ) : (
        empty
      )}
    </div>
  );
}
