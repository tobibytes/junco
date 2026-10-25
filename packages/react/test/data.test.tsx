import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Breadcrumb,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  getPaginationItems,
  Pagination,
  Stat,
  StatGroup,
} from "../src";
import { DataTable, type ColumnDef } from "../src/data-table";

describe("getPaginationItems", () => {
  it("lists every page when they fit", () => {
    expect(getPaginationItems({ page: 1, pageCount: 5 })).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationItems({ page: 3, pageCount: 7 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses the middle around the current page", () => {
    expect(getPaginationItems({ page: 10, pageCount: 20 })).toEqual([1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20]);
  });

  it("fills the gap instead of an ellipsis that would hide a single page", () => {
    expect(getPaginationItems({ page: 1, pageCount: 20 })).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
    expect(getPaginationItems({ page: 4, pageCount: 20 })).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
    expect(getPaginationItems({ page: 20, pageCount: 20 })).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
  });

  it("keeps the same number of items on every page", () => {
    for (let page = 1; page <= 30; page++) {
      expect(getPaginationItems({ page, pageCount: 30 })).toHaveLength(7);
      expect(getPaginationItems({ page, pageCount: 30, siblings: 2, boundaries: 2 })).toHaveLength(11);
    }
  });

  it("always includes the current page, first and last, and never repeats", () => {
    for (let page = 1; page <= 40; page++) {
      const items = getPaginationItems({ page, pageCount: 40 });
      expect(items).toContain(page);
      expect(items[0]).toBe(1);
      expect(items.at(-1)).toBe(40);
      const nums = items.filter((i) => typeof i === "number");
      expect(new Set(nums).size).toBe(nums.length);
      expect([...nums].sort((a, b) => a - b)).toEqual(nums);
    }
  });

  it("clamps bad input", () => {
    expect(getPaginationItems({ page: 99, pageCount: 3 })).toEqual([1, 2, 3]);
    expect(getPaginationItems({ page: 1, pageCount: 0 })).toEqual([1]);
  });
});

describe("Pagination", () => {
  function Controlled({ initial = 1, pageCount = 10 }) {
    const [page, setPage] = useState(initial);
    return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />;
  }

  it("marks the current page and disables Previous on page 1", () => {
    render(<Controlled />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button", { name: "Previous page" })).toBeNull();
  });

  it("moves pages and keeps keyboard focus on Next", async () => {
    render(<Controlled />);
    const next = screen.getByRole("button", { name: "Next page" });
    next.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveFocus();
  });

  it("renders real links with getHref", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} getHref={(p) => `?page=${p}`} />);
    expect(screen.getByRole("link", { name: "Page 3" })).toHaveAttribute("href", "?page=3");
  });

  it("does not fire for the current page", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

describe("Card", () => {
  it("renders parts and variants", () => {
    render(
      <Card variant="muted" data-testid="card">
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Usage" })).toBeInTheDocument();
    expect(screen.getByTestId("card")).toHaveClass("bg-muted");
  });
});

describe("Stat", () => {
  it("shows direction with sign and screen reader text, not only color", () => {
    render(<Stat label="Revenue" value="$48.2k" delta={12.5} deltaLabel="vs last month" />);
    const list = screen.getByRole("term").closest("dl")!;
    expect(list).toBeInTheDocument();
    expect(within(list).getByText(/\+12.5%/)).toBeInTheDocument();
    expect(within(list).getByText("Up", { exact: false })).toHaveClass("sr-only");
  });

  it("inverts the tone when a rise is bad but keeps the real direction", () => {
    render(<Stat label="Churn" value="3.1%" delta={0.4} isInverse />);
    const delta = screen.getByText(/\+0.4%/).closest("[data-trend]")!;
    expect(delta).toHaveAttribute("data-trend", "up");
    expect(delta).toHaveClass("text-destructive-text");
  });

  it("formats negative deltas with a real minus sign", () => {
    render(<Stat label="Visits" value="1,204" delta={-8} />);
    expect(screen.getByText(/−8%/)).toBeInTheDocument();
  });

  it("is a div inside a StatGroup so the group is the only list", () => {
    const { container } = render(
      <StatGroup>
        <Stat label="A" value="1" />
        <Stat label="B" value="2" />
      </StatGroup>,
    );
    expect(container.querySelectorAll("dl")).toHaveLength(1);
  });
});

describe("EmptyState", () => {
  it("renders title, description and actions", () => {
    render(<EmptyState title="No projects" description="Create one to start." actions={<button>New project</button>} />);
    expect(screen.getByRole("heading", { name: "No projects" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
  });
});

describe("Breadcrumb", () => {
  const items = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Junco", href: "/projects/junco" },
    { label: "Settings" },
  ];

  it("marks the last item as the current page", () => {
    render(<Breadcrumb items={items} />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getAllByRole("link")).toHaveLength(3);
    expect(within(nav).getByText("Settings")).toHaveAttribute("aria-current", "page");
  });

  it("collapses the middle with maxItems", () => {
    render(<Breadcrumb items={items} maxItems={3} />);
    expect(screen.getByText("More pages")).toBeInTheDocument();
    expect(screen.queryByText("Projects")).toBeNull();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Junco")).toBeInTheDocument();
  });
});

type Person = { id: string; name: string; role: string; age: number };

const people: Person[] = Array.from({ length: 25 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Person ${String(i + 1).padStart(2, "0")}`,
  role: i % 3 === 0 ? "Admin" : "Member",
  age: 20 + ((i * 7) % 30),
}));

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "age", header: "Age", meta: { align: "right" } },
];

function bodyRows() {
  const [, body] = screen.getAllByRole("rowgroup");
  return within(body!).getAllByRole("row");
}

describe("DataTable", () => {
  it("paginates client-side and reports the row count", async () => {
    render(<DataTable columns={columns} data={people} getRowId={(p) => p.id} caption="People" />);
    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText("25 rows")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(bodyRows()).toHaveLength(5);
  });

  it("sorts with aria-sort on the header", async () => {
    render(<DataTable columns={columns} data={people} pageSize={false} />);
    const ageHeader = screen.getByRole("columnheader", { name: /Age/ });
    expect(ageHeader).toHaveAttribute("aria-sort", "none");
    await userEvent.click(within(ageHeader).getByRole("button"));
    expect(ageHeader).toHaveAttribute("aria-sort", "ascending");
    const ages = bodyRows().map((r) => Number(within(r).getAllByRole("cell")[2]!.textContent));
    expect(ages).toEqual([...ages].sort((a, b) => a - b));
    await userEvent.click(within(ageHeader).getByRole("button"));
    expect(ageHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("selects rows, with an indeterminate select-all", async () => {
    const onRowSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={people}
        getRowId={(p) => p.id}
        enableRowSelection
        onRowSelectionChange={onRowSelectionChange}
      />,
    );
    const rowBoxes = screen.getAllByRole("checkbox", { name: "Select row" });
    await userEvent.click(rowBoxes[0]!);
    expect(onRowSelectionChange).toHaveBeenLastCalledWith({ p1: true });
    expect(screen.getByRole("checkbox", { name: "Select all rows on this page" })).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByText("1 of 25 selected")).toBeInTheDocument();
    expect(bodyRows()[0]).toHaveAttribute("aria-selected", "true");

    await userEvent.click(screen.getByRole("checkbox", { name: "Select all rows on this page" }));
    expect(screen.getByText("10 of 25 selected")).toBeInTheDocument();
  });

  it("filters globally, shows an empty state and resets to a page that exists", async () => {
    render(<DataTable columns={columns} data={people} enableGlobalFilter />);
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    const search = screen.getByRole("searchbox", { name: "Search table" });
    await userEvent.type(search, "Person 01");
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    await userEvent.clear(search);
    await userEvent.type(search, "zzz");
    expect(screen.getByText("No matching results")).toBeInTheDocument();
  });

  it("hides columns from the Columns menu", async () => {
    render(<DataTable columns={columns} data={people} enableColumnVisibility />);
    expect(screen.getByRole("columnheader", { name: /Role/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Columns" }));
    const item = await screen.findByRole("menuitemcheckbox", { name: "Role" });
    expect(item).toHaveAttribute("aria-checked", "true");
    await userEvent.click(item);
    // the menu stays open so several columns can be toggled in a row
    expect(screen.getByRole("menuitemcheckbox", { name: "Role" })).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.queryByRole("columnheader", { name: /Role/ })).toBeNull();
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
  });

  it("shows skeleton rows and aria-busy while loading", () => {
    render(<DataTable columns={columns} data={[]} isLoading loadingRows={4} />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(bodyRows()).toHaveLength(4);
    expect(screen.queryByText("No results")).toBeNull();
  });

  it("supports server-side data with manual mode", async () => {
    const onPaginationChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={people.slice(0, 10)}
        manual
        pageCount={5}
        rowCount={48}
        onPaginationChange={onPaginationChange}
      />,
    );
    expect(screen.getByText("48 rows")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 10 });
  });
});
