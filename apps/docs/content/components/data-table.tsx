"use client";

import { Badge, Button, toast } from "@junco/react";
import { DataTable, type ColumnDef, type Table } from "@junco/react/data-table";
import * as React from "react";
import type { ComponentDoc } from "./types";

type Customer = { name: string; plan: "Starter" | "Pro" | "Business" | "Enterprise"; seats: number; mrr: number; status: "Active" | "Past due" };

const customers: Customer[] = [
  { name: "Northwind", plan: "Business", seats: 24, mrr: 1280, status: "Active" },
  { name: "Acme Co", plan: "Pro", seats: 9, mrr: 640, status: "Active" },
  { name: "Globex", plan: "Business", seats: 41, mrr: 2115, status: "Past due" },
  { name: "Initech", plan: "Starter", seats: 3, mrr: 89, status: "Active" },
  { name: "Umbrella", plan: "Pro", seats: 7, mrr: 512, status: "Active" },
  { name: "Hooli", plan: "Enterprise", seats: 160, mrr: 8400, status: "Active" },
  { name: "Stark Labs", plan: "Business", seats: 33, mrr: 1650, status: "Past due" },
  { name: "Wayne Tech", plan: "Enterprise", seats: 220, mrr: 11200, status: "Active" },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const columns: ColumnDef<Customer>[] = [
  { accessorKey: "name", header: "Customer" },
  { accessorKey: "plan", header: "Plan" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<Customer["status"]>();
      return (
        <Badge variant="outline" hasDot color={status === "Active" ? "success" : "warning"}>
          {status}
        </Badge>
      );
    },
  },
  { accessorKey: "seats", header: "Seats", meta: { align: "right" } },
  { accessorKey: "mrr", header: "MRR", meta: { align: "right" }, cell: ({ getValue }) => money.format(getValue<number>()) },
];

function BulkActions() {
  const [table, setTable] = React.useState<Table<Customer>>();
  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={customers}
        caption="Customers with bulk actions"
        getRowId={(r) => r.name}
        pageSize={5}
        enableRowSelection
        onTableReady={setTable}
        toolbar={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const count = table?.getSelectedRowModel().rows.length ?? 0;
              if (count) toast.success(`Exported ${count} customer${count === 1 ? "" : "s"}`);
              else toast("Select some rows first");
            }}
          >
            Export selected
          </Button>
        }
      />
    </div>
  );
}

export const doc: ComponentDoc = {
  imports: ["DataTable", "type ColumnDef"],
  importFrom: "@junco/react/data-table",
  installExtra: ["@tanstack/react-table"],
  playground: {
    controls: [
      { name: "enableRowSelection", label: "selection", type: "boolean", default: true },
      { name: "enableGlobalFilter", label: "search", type: "boolean", default: true },
      { name: "enableColumnVisibility", label: "columns menu", type: "boolean", default: true },
      { name: "density", type: "select", options: ["compact", "normal", "relaxed"], default: "normal" },
      { name: "isLoading", type: "boolean", default: false },
    ],
    render: (v) => (
      <div className="w-full">
        <DataTable
          columns={columns}
          data={customers}
          caption="Customers"
          getRowId={(r) => r.name}
          pageSize={5}
          enableRowSelection={v.enableRowSelection as boolean}
          enableGlobalFilter={v.enableGlobalFilter as boolean}
          enableColumnVisibility={v.enableColumnVisibility as boolean}
          density={v.density as "normal"}
          isLoading={v.isLoading as boolean}
        />
      </div>
    ),
    code: (v) => {
      const attrs = [
        "columns={columns}",
        "data={customers}",
        'caption="Customers"',
        "getRowId={(row) => row.name}",
        "pageSize={5}",
        v.enableRowSelection && "enableRowSelection",
        v.enableGlobalFilter && "enableGlobalFilter",
        v.enableColumnVisibility && "enableColumnVisibility",
        v.density !== "normal" && `density="${v.density}"`,
        v.isLoading && "isLoading",
      ].filter(Boolean);
      return `<DataTable\n  ${attrs.join("\n  ")}\n/>`;
    },
  },
  usage: {
    installed: `const columns: ColumnDef<Customer>[] = [
  { accessorKey: "name", header: "Customer" },
  { accessorKey: "plan", header: "Plan" },
  { accessorKey: "mrr", header: "MRR", meta: { align: "right" }, cell: ({ getValue }) => money(getValue()) },
];

<DataTable
  columns={columns}
  data={customers}
  caption="Customers"
  enableRowSelection
  enableGlobalFilter
  enableColumnVisibility
/>`,
    semantic: `<!-- .table styles a plain table. Sorting, selection and paging need JS: use DataTable. -->
<div class="table-container">
  <table class="table table-hover">
    <caption>Customers</caption>
    <thead>
      <tr><th>Customer</th><th>Plan</th><th class="numeric">MRR</th></tr>
    </thead>
    <tbody>
      <tr><td>Northwind</td><td>Business</td><td class="numeric">$1,280</td></tr>
      <tr><td>Acme Co</td><td>Pro</td><td class="numeric">$640</td></tr>
    </tbody>
  </table>
</div>`,
  },
  examples: [
    {
      title: "Toolbar and bulk actions",
      description: "Put your own controls in the toolbar. onTableReady gives you the table instance for bulk actions.",
      Preview: BulkActions,
      code: `const [table, setTable] = useState<Table<Customer>>();

<DataTable
  columns={columns}
  data={customers}
  caption="Customers"
  enableRowSelection
  onTableReady={setTable}
  toolbar={
    <Button size="sm" variant="outline" onClick={() => exportRows(table.getSelectedRowModel().rows)}>
      Export selected
    </Button>
  }
/>`,
    },
    {
      title: "Empty",
      Preview: () => (
        <div className="w-full">
          <DataTable columns={columns} data={[]} caption="No customers" pageSize={5} />
        </div>
      ),
      code: `<DataTable columns={columns} data={[]} caption="No customers" />`,
    },
  ],
  props: [
    {
      component: "DataTable",
      description: "Imported from junco/data-table. Needs @tanstack/react-table (an optional peer, so the core bundle stays small).",
      props: [
        { name: "columns", type: "ColumnDef<TData>[]", description: "Required. TanStack column definitions. meta.align: \"right\" right-aligns numbers." },
        { name: "data", type: "TData[]", description: "Required. The rows." },
        { name: "caption", type: "string", description: "Accessible table name (visually hidden caption). Strongly recommended." },
        { name: "getRowId", type: "(row, index) => string", description: "Stable row ids; recommended with selection." },
        { name: "enableRowSelection", type: "boolean | (row) => boolean", description: "Adds a checkbox column, with a partial \"select all\" state." },
        { name: "enableGlobalFilter", type: "boolean", description: "Shows a search box that filters across all columns." },
        { name: "enableColumnVisibility", type: "boolean", description: "Shows a Columns menu to hide and show columns." },
        { name: "pageSize", type: "number | false", default: "10", description: "Rows per page; false shows every row." },
        { name: "pageSizeOptions", type: "number[]", description: "Choices for the rows-per-page control." },
        { name: "isLoading / loadingRows", type: "boolean / number", description: "Skeleton rows and aria-busy while data loads." },
        { name: "manual / pageCount / rowCount", type: "boolean / number / number", description: "Server-side mode: sort, filter and page outside, pass the totals." },
        { name: "sorting, rowSelection, globalFilter, columnVisibility, pagination", type: "state + on…Change", description: "Each piece of state can be controlled." },
        { name: "defaultSorting", type: "SortingState", description: "Initial sort when uncontrolled." },
        { name: "toolbar", type: "ReactNode", description: "Extra controls on the right of the toolbar." },
        { name: "emptyState", type: "ReactNode", description: "Shown when there are no rows." },
        { name: "density", type: '"compact" | "normal" | "relaxed"', default: '"normal"', description: "Row height." },
        { name: "isStickyHeader / maxHeight", type: "boolean / string", default: "true", description: "Keep the header visible while the body scrolls." },
        { name: "onTableReady", type: "(table) => void", description: "Receives the TanStack table instance." },
        { name: "tableOptions", type: "Partial<TableOptions>", description: "Escape hatch for anything else TanStack supports." },
        { name: "classNames", type: "Partial<Record<slot, string>>", description: "Class overrides: root, toolbar, container, table, headerCell, row, cell, footer." },
      ],
    },
  ],
  keyboard: [
    { keys: ["Tab"], action: "Moves through the search box, sortable headers, row checkboxes and paging controls." },
    { keys: ["Enter"], action: "Sorts by the focused column header (ascending, then descending, then off)." },
    { keys: ["Space"], action: "Toggles the focused row checkbox." },
  ],
  a11y: [
    "A real <table> with a caption, so screen readers can navigate it by rows and columns.",
    "Sortable headers are buttons, and the sorted column has aria-sort.",
    "Selected rows are marked with aria-selected, and \"select all\" shows a partial state when some rows are picked.",
    "While loading, the table has aria-busy and shows skeleton rows instead of going blank.",
  ],
};
