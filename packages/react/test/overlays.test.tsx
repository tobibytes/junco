import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Avatar,
  Button,
  Field,
  initials,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipProvider,
} from "../src";

describe("Tabs", () => {
  function Example({ variant }: { variant?: "line" | "segmented" }) {
    return (
      <Tabs defaultValue="a" variant={variant}>
        <TabsList aria-label="Sections">
          <TabsTrigger value="a">Overview</TabsTrigger>
          <TabsTrigger value="b">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Overview panel</TabsContent>
        <TabsContent value="b">Activity panel</TabsContent>
      </Tabs>
    );
  }

  it("switches panels on click", async () => {
    render(<Example />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Overview panel");
    await userEvent.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Activity panel");
  });

  it("moves between tabs with arrow keys", async () => {
    render(<Example />);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("applies the variant to list and triggers", () => {
    render(<Example variant="segmented" />);
    expect(screen.getByRole("tablist")).toHaveClass("bg-muted");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveClass("h-7");
  });
});

describe("Tooltip", () => {
  it("shows on keyboard focus", async () => {
    render(
      <TooltipProvider delayDuration={0}>
        <Tooltip content="Add item" shortcut="A">
          <Button aria-label="Add">+</Button>
        </Tooltip>
      </TooltipProvider>,
    );
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Add" })).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Add item");
  });

  it("works without an explicit provider", async () => {
    render(
      <Tooltip content="Help" delayDuration={0}>
        <Button>?</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Help");
  });
});

describe("Select", () => {
  it("opens, picks an option and reports it", async () => {
    const onValueChange = vi.fn();
    render(
      <Field label="Frequency">
        <Select onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Frequency" });
    expect(trigger).toHaveTextContent("Pick one");
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "Weekly" }));
    expect(onValueChange).toHaveBeenCalledWith("weekly");
    await waitFor(() => expect(trigger).toHaveTextContent("Weekly"));
  });
});

describe("Avatar", () => {
  it("falls back to initials with an accessible name", () => {
    render(<Avatar name="Ada Lovelace" />);
    const img = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(img).toHaveTextContent("AL");
  });

  it("computes initials", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("tobi")).toBe("T");
    expect(initials("  Mary Jane Watson ")).toBe("MW");
    expect(initials("")).toBe("");
  });
});
