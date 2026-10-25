import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type TableOptions,
  type VisibilityState,
} from "@tanstack/react-table";
import { tv } from "tailwind-variants";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { EmptyState } from "../components/empty-state";
import { Input } from "../components/input";
import { Pagination } from "../components/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select";
import { Skeleton } from "../components/skeleton";
import { cn } from "../lib/cn";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, InboxIcon, SearchIcon } from "../lib/icons";

export const dataTableVariants = tv({
  slots: {
    root: "grid gap-3",
    toolbar: "flex flex-wrap items-center gap-2",
    container: "relative w-full overflow-auto rounded-card border border-border bg-surface",
    table: "w-full caption-bottom border-separate border-spacing-0 text-sm",
    thead: "",
    headerCell: [
      "h-10 border-b border-border bg-surface px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground",
      "first:pl-4 last:pr-4",
    ],
    row: "transition-colors duration-fast ease-standard hover:bg-muted/50 data-[state=selected]:bg-accent",
    cell: "border-b border-border px-3 py-2.5 align-middle first:pl-4 last:pr-4 [tr:last-child>&]:border-b-0",
    footer: "flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground",
  },
  variants: {
    density: {
      compact: { cell: "py-1.5", headerCell: "h-9" },
      normal: {},
      relaxed: { cell: "py-3.5", headerCell: "h-11" },
    },
    isStickyHeader: {
      true: { headerCell: "sticky top-0 z-sticky" },
    },
  },
  defaultVariants: { density: "normal", isStickyHeader: true },
});

type Slots = keyof ReturnType<typeof dataTableVariants>;

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** Stable row ids (recommended with selection). Defaults to the row index. */
  getRowId?: (row: TData, index: number) => string;

  /** Shows skeleton rows and sets aria-busy. */
  isLoading?: boolean;
  /** Skeleton rows while loading. Defaults to the page size (max 10). */
  loadingRows?: number;

  /** Adds a checkbox column. */
  enableRowSelection?: boolean | ((row: TData) => boolean);
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;

  /** Shows a search box that filters across all columns. */
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  searchPlaceholder?: string;

  /** Shows a "Columns" menu to hide and show columns. */
  enableColumnVisibility?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;

  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  defaultSorting?: SortingState;

  /** Rows per page. Set `false` to show every row. Default 10. */
  pageSize?: number | false;
  pageSizeOptions?: number[];
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Server-side data: sorting, filtering and paging happen outside; pass the total page count. */
  manual?: boolean;
  pageCount?: number;
  /** Total rows on the server, for the footer when `manual`. */
  rowCount?: number;

  /** Shown when there are no rows. */
  emptyState?: React.ReactNode;
  /** Extra controls on the right of the toolbar (filters, buttons). */
  toolbar?: React.ReactNode;
  /** Accessible table name, also shown visually hidden as the caption. */
  caption?: string;
  /** Max height of the scroll area, e.g. "24rem". The header stays visible while scrolling. */
  maxHeight?: string;
  density?: "compact" | "normal" | "relaxed";
  isStickyHeader?: boolean;
  /** Escape hatch for anything else TanStack Table supports. */
  tableOptions?: Partial<TableOptions<TData>>;
  /** Receives the table instance (for custom toolbars or bulk actions). */
  onTableReady?: (table: TanstackTable<TData>) => void;
  className?: string;
  classNames?: Partial<Record<Slots, string>>;
}

function useControllable<T>(value: T | undefined, onChange: ((v: T) => void) | undefined, initial: T) {
  const [inner, setInner] = React.useState<T>(initial);
  const current = value ?? inner;
  const set = React.useCallback(
    (updater: T | ((old: T) => T)) => {
      const next = typeof updater === "function" ? (updater as (old: T) => T)(current) : updater;
      if (value === undefined) setInner(next);
      onChange?.(next);
    },
    [current, value, onChange],
  );
  return [current, set] as const;
}

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  if (dir === "asc") return <ArrowUpIcon aria-hidden className="size-3.5" />;
  if (dir === "desc") return <ArrowDownIcon aria-hidden className="size-3.5" />;
  return <ArrowUpDownIcon aria-hidden className="size-3.5 opacity-50" />;
}

function headerText(column: { columnDef: { header?: unknown }; id: string }) {
  return typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;
}

/**
 * A full data table on TanStack Table: sorting, selection, search, column visibility, pagination,
 * loading and empty states. Pass `manual` for server-side data.
 *
 *   import { DataTable, type ColumnDef } from "junco/data-table";
 */
export function DataTable<TData>({
  columns,
  data,
  getRowId,
  isLoading = false,
  loadingRows,
  enableRowSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  enableGlobalFilter = false,
  globalFilter: globalFilterProp,
  onGlobalFilterChange,
  searchPlaceholder = "Search…",
  enableColumnVisibility = false,
  columnVisibility: columnVisibilityProp,
  onColumnVisibilityChange,
  sorting: sortingProp,
  onSortingChange,
  defaultSorting = [],
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  pagination: paginationProp,
  onPaginationChange,
  manual = false,
  pageCount,
  rowCount,
  emptyState,
  toolbar,
  caption,
  maxHeight,
  density,
  isStickyHeader,
  tableOptions,
  onTableReady,
  className,
  classNames,
}: DataTableProps<TData>) {
  const styles = dataTableVariants({ density, isStickyHeader });
  const pageSizeLabelId = `${React.useId()}-page-size`;
  const paged = pageSize !== false;

  const [sorting, setSorting] = useControllable(sortingProp, onSortingChange, defaultSorting);
  const [rowSelection, setRowSelection] = useControllable(rowSelectionProp, onRowSelectionChange, {});
  const [globalFilter, setGlobalFilter] = useControllable(globalFilterProp, onGlobalFilterChange, "");
  const [columnVisibility, setColumnVisibility] = useControllable(columnVisibilityProp, onColumnVisibilityChange, {});
  const [pagination, setPagination] = useControllable(paginationProp, onPaginationChange, {
    pageIndex: 0,
    pageSize: paged ? pageSize : Number.MAX_SAFE_INTEGER,
  });

  const allColumns = React.useMemo<ColumnDef<TData, any>[]>(() => {
    if (!enableRowSelection) return columns;
    const select: ColumnDef<TData, any> = {
      id: "__select",
      enableSorting: false,
      enableHiding: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all rows on this page"
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(v) => row.toggleSelected(v === true)}
        />
      ),
      meta: { className: "w-10" },
    };
    return [select, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable<TData>({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, rowSelection, globalFilter, columnVisibility, pagination },
    enableRowSelection:
      typeof enableRowSelection === "function" ? (row) => enableRowSelection(row.original) : enableRowSelection,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(manual
      ? { manualSorting: true, manualFiltering: true, manualPagination: true, pageCount: pageCount ?? -1, rowCount }
      : {
          getSortedRowModel: getSortedRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: paged ? getPaginationRowModel() : undefined,
        }),
    autoResetPageIndex: false,
    // TanStack sorts numbers descending first and text ascending first; one rule is easier to predict.
    sortDescFirst: false,
    ...tableOptions,
  });

  React.useEffect(() => {
    onTableReady?.(table);
  }, [onTableReady, table]);

  // When filtering shrinks the data, don't leave the user on a page that no longer exists.
  const totalPages = Math.max(1, table.getPageCount());
  React.useEffect(() => {
    if (paged && pagination.pageIndex > totalPages - 1) setPagination({ ...pagination, pageIndex: totalPages - 1 });
  }, [paged, pagination, totalPages, setPagination]);

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const skeletonCount = loadingRows ?? Math.min(paged ? pagination.pageSize : 5, 10);
  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;
  const filteredCount = manual ? (rowCount ?? data.length) : table.getFilteredRowModel().rows.length;
  const hideableColumns = table.getAllLeafColumns().filter((c) => c.getCanHide());
  const showToolbar = enableGlobalFilter || enableColumnVisibility || toolbar;

  return (
    <div data-slot="data-table" className={styles.root({ className: cn(classNames?.root, className) })}>
      {showToolbar && (
        <div className={styles.toolbar({ className: classNames?.toolbar })}>
          {enableGlobalFilter && (
            <div className="relative w-full max-w-xs">
              <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                aria-label="Search table"
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {toolbar}
            {enableColumnVisibility && hideableColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Columns</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                  {hideableColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(v) => column.toggleVisibility(v === true)}
                      // keep the menu open so several columns can be toggled in a row
                      onSelect={(e) => e.preventDefault()}
                    >
                      {headerText(column)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div
        className={styles.container({ className: classNames?.container })}
        style={maxHeight ? { maxHeight } : undefined}
        // Lets keyboard users scroll a table wider or taller than its box.
        tabIndex={0}
        // Only a named landmark when there's a caption; unnamed duplicates would clutter the landmark list.
        role={caption ? "region" : undefined}
        aria-label={caption}
      >
        <table className={styles.table({ className: classNames?.table })} aria-busy={isLoading || undefined}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className={styles.thead({ className: classNames?.thead })}>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  const meta = header.column.columnDef.meta as { className?: string; align?: "left" | "right" | "center" } | undefined;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      colSpan={header.colSpan}
                      aria-sort={canSort ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined}
                      className={styles.headerCell({
                        className: cn(meta?.className, meta?.align === "right" && "text-right", classNames?.headerCell),
                      })}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "-mx-1.5 inline-flex h-7 items-center gap-1 rounded-xs px-1.5 transition-colors duration-fast ease-standard",
                            "hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
                            dir && "text-foreground",
                            meta?.align === "right" && "flex-row-reverse",
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon dir={dir} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonCount }, (_, i) => (
                <tr key={`skeleton-${i}`} className={styles.row({ className: classNames?.row })}>
                  {visibleColumns.map((column, j) => (
                    <td key={column.id} className={styles.cell({ className: classNames?.cell })}>
                      <Skeleton className={cn("h-4", column.id === "__select" ? "size-4" : j % 3 === 0 ? "w-3/4" : "w-1/2")} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length || 1} className="p-0">
                  {emptyState ?? (
                    <EmptyState
                      size="sm"
                      icon={<InboxIcon />}
                      title={globalFilter ? "No matching results" : "No results"}
                      description={globalFilter ? `Nothing matches “${globalFilter}”. Try a different search.` : undefined}
                    />
                  )}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  aria-selected={enableRowSelection ? row.getIsSelected() : undefined}
                  className={styles.row({ className: classNames?.row })}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string; align?: "left" | "right" | "center" } | undefined;
                    return (
                      <td
                        key={cell.id}
                        className={styles.cell({
                          className: cn(meta?.className, meta?.align === "right" && "text-right tabular-nums", classNames?.cell),
                        })}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paged && (
        <div className={styles.footer({ className: classNames?.footer })}>
          <p aria-live="polite" className="tabular-nums">
            {enableRowSelection && selectedCount > 0
              ? `${selectedCount} of ${filteredCount} selected`
              : `${filteredCount} ${filteredCount === 1 ? "row" : "rows"}`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {pageSizeOptions.length > 1 && (
              <div className="flex items-center gap-2">
                <span id={pageSizeLabelId} className="whitespace-nowrap">
                  Rows per page
                </span>
                <Select
                  value={String(pagination.pageSize)}
                  onValueChange={(v) => setPagination({ pageIndex: 0, pageSize: Number(v) })}
                >
                  <SelectTrigger size="sm" className="w-18" aria-labelledby={pageSizeLabelId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Pagination
              size="sm"
              page={pagination.pageIndex + 1}
              pageCount={totalPages}
              onPageChange={(p) => setPagination({ ...pagination, pageIndex: p - 1 })}
              label={caption ? `${caption} pages` : "Table pages"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
