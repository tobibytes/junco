import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  toast,
  Toaster,
} from "../src";
import { __resetToasts } from "../src/components/toast";

describe("Dialog", () => {
  function Example({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    return (
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>Edit profile</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Changes show up for your team.</DialogDescription>
          </DialogHeader>
          <input aria-label="Name" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  it("opens with a labelled, described dialog and moves focus inside", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    expect(dialog).toHaveAccessibleDescription("Changes show up for your team.");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes on Esc and returns focus to the trigger", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Edit profile" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it("traps Tab inside the dialog", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    const dialog = screen.getByRole("dialog");
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("closes from the × button and DialogClose", async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await userEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps a visually hidden title accessible", () => {
    render(
      <Dialog open>
        <DialogContent showClose={false}>
          <DialogTitle isHidden>Search</DialogTitle>
          <DialogDescription>Find anything</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("dialog", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByText("Search")).toHaveClass("sr-only");
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });
});

describe("Sheet", () => {
  it("opens from the given side and closes on Esc", async () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <Button>Filters</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the list</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Filters" }));
    const sheet = screen.getByRole("dialog", { name: "Filters" });
    expect(sheet).toHaveAttribute("data-side", "left");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("closes when the bottom sheet handle is swiped down", async () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet defaultOpen onOpenChange={onOpenChange}>
        <SheetContent side="bottom">
          <SheetTitle>Share</SheetTitle>
          <SheetDescription>Pick a place</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    const handle = document.querySelector<HTMLElement>("[data-slot=sheet-handle]")!;
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 400 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 400 });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("snaps back on a tiny drag", () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet defaultOpen onOpenChange={onOpenChange}>
        <SheetContent side="bottom">
          <SheetTitle>Share</SheetTitle>
          <SheetDescription>Pick a place</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    const handle = document.querySelector<HTMLElement>("[data-slot=sheet-handle]")!;
    const now = vi.spyOn(performance, "now");
    now.mockReturnValueOnce(0).mockReturnValueOnce(1000);
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 100 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 102 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 102 });
    now.mockRestore();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Popover", () => {
  it("opens, focuses content, closes on Esc back to the trigger", async () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Share</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Share options">
          <input aria-label="Link" />
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Share" });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Share options" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus();
  });
});

describe("DropdownMenu", () => {
  function Example({ onSelect }: { onSelect?: () => void }) {
    const [compact, setCompact] = useState(false);
    const [sort, setSort] = useState("name");
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuItem shortcut="⌘P" onSelect={onSelect}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
            Compact
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem variant="danger">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it("opens with the keyboard and moves with arrows", async () => {
    render(<Example />);
    screen.getByRole("button", { name: "Options" }).focus();
    await userEvent.keyboard("{Enter}");
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Profile/ })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(within(menu).getByRole("menuitemcheckbox", { name: "Compact" })).toHaveFocus();
  });

  it("runs items and closes, returning focus", async () => {
    const onSelect = vi.fn();
    render(<Example onSelect={onSelect} />);
    const trigger = screen.getByRole("button", { name: "Options" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it("toggles checkbox and radio items with correct aria state", async () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Options" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Compact" }));
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("menuitemcheckbox", { name: "Compact" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Name" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Date" }));
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("menuitemradio", { name: "Date" })).toHaveAttribute("aria-checked", "true");
  });

  it("opens a submenu with ArrowRight", async () => {
    render(<Example />);
    screen.getByRole("button", { name: "Options" }).focus();
    await userEvent.keyboard("{Enter}");
    const more = screen.getByRole("menuitem", { name: "More" });
    more.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "Archive" })).toBeInTheDocument();
    expect(more).toHaveAttribute("aria-expanded", "true");
  });
});

describe("CommandDialog", () => {
  function Example({ onSelect }: { onSelect?: (v: string) => void }) {
    return (
      <CommandDialog>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={onSelect}>
              Settings<CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={onSelect}>Billing</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    );
  }

  it("opens with Ctrl+K and ⌘K, and toggles closed", async () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search")).toHaveFocus();
    await userEvent.keyboard("{Meta>}k{/Meta}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("filters and runs the chosen item with Enter", async () => {
    const onSelect = vi.fn();
    render(<Example onSelect={onSelect} />);
    await userEvent.keyboard("{Control>}k{/Control}");
    await userEvent.type(screen.getByPlaceholderText("Search"), "bill");
    expect(screen.queryByRole("option", { name: /Settings/ })).toBeNull();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith("Billing");
  });

  it("shows the empty state", async () => {
    render(<Example />);
    await userEvent.keyboard("{Control>}k{/Control}");
    await userEvent.type(screen.getByPlaceholderText("Search"), "zzz");
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });
});

describe("toast", () => {
  afterEach(() => {
    vi.useRealTimers();
    act(() => __resetToasts());
  });

  /** The toast list, so queries skip the live-region copy of the text. */
  const list = () => within(screen.getByRole("list", { hidden: true }));

  async function settle() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });
  }

  it("shows typed toasts with an icon and a type word, not color alone", () => {
    render(<Toaster />);
    act(() => {
      toast.success("Invoice sent", { description: "Northwind gets it soon." });
    });
    const region = screen.getByRole("region", { name: /Notifications/ });
    const item = within(region).getByText("Invoice sent").closest("li")!;
    expect(item).toHaveAttribute("data-type", "success");
    expect(item.querySelector("svg")).not.toBeNull();
    expect(within(item).getByText(/Success/)).toHaveClass("sr-only");
    expect(within(item).getByText("Northwind gets it soon.")).toBeInTheDocument();
  });

  it("announces through a persistent live region", () => {
    render(<Toaster />);
    act(() => {
      toast.error("Couldn't save");
    });
    const live = document.querySelector('[aria-live="assertive"]')!;
    expect(live).toHaveTextContent("Error: Couldn't save");
    act(() => {
      toast("Copied");
    });
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent("Copied");
  });

  it("auto-closes after its duration and calls onAutoClose", async () => {
    vi.useFakeTimers();
    const onAutoClose = vi.fn();
    render(<Toaster duration={1000} />);
    act(() => {
      toast("Saved", { onAutoClose });
    });
    expect(list().getByText("Saved")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(onAutoClose).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(250));
    expect(list().queryByText("Saved")).toBeNull();
  });

  it("pauses while hovered", () => {
    vi.useFakeTimers();
    render(<Toaster duration={1000} />);
    act(() => {
      toast("Hover me");
    });
    fireEvent.mouseEnter(screen.getByRole("region"));
    act(() => vi.advanceTimersByTime(5000));
    expect(list().getByText("Hover me")).toBeInTheDocument();
    fireEvent.mouseLeave(screen.getByRole("region"));
    act(() => vi.advanceTimersByTime(1250));
    expect(list().queryByText("Hover me")).toBeNull();
  });

  it("dismisses from the close button and with Esc", async () => {
    render(<Toaster />);
    act(() => {
      toast("One");
    });
    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    await settle();
    expect(list().queryByText("One")).toBeNull();

    act(() => {
      toast("Two");
    });
    list().getByText("Two").closest("li")!.focus();
    await userEvent.keyboard("{Escape}");
    await settle();
    expect(list().queryByText("Two")).toBeNull();
  });

  it("runs an action and closes, unless prevented", async () => {
    const onUndo = vi.fn();
    render(<Toaster />);
    act(() => {
      toast("Deleted", { action: { label: "Undo", onClick: onUndo } });
    });
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledOnce();
    await settle();
    expect(list().queryByText("Deleted")).toBeNull();

    act(() => {
      toast("Kept", { action: { label: "Stay", onClick: (e) => e.preventDefault() } });
    });
    await userEvent.click(screen.getByRole("button", { name: "Stay" }));
    await settle();
    expect(list().getByText("Kept")).toBeInTheDocument();
  });

  it("promise goes loading -> success in the same toast", async () => {
    render(<Toaster />);
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    act(() => {
      toast.promise(p, { loading: "Uploading", success: (name) => `Uploaded ${name}`, error: "Failed" });
    });
    expect(list().getByText("Uploading").closest("li")).toHaveAttribute("data-type", "loading");
    await act(async () => {
      resolve("logo.png");
      await p;
    });
    const li = list().getByText("Uploaded logo.png").closest("li")!;
    expect(li).toHaveAttribute("data-type", "success");
    expect(list().getAllByRole("listitem")).toHaveLength(1);
  });

  it("promise goes loading -> error", async () => {
    render(<Toaster />);
    const p = Promise.reject(new Error("nope"));
    act(() => {
      toast.promise(p, { loading: "Saving", success: "Saved", error: (e) => `Failed: ${(e as Error).message}` });
    });
    await act(async () => {
      await p.catch(() => {});
    });
    expect(list().getByText("Failed: nope").closest("li")).toHaveAttribute("data-type", "error");
  });

  it("updates in place when an id is reused", () => {
    render(<Toaster />);
    act(() => {
      toast.loading("Syncing", { id: "sync" });
    });
    act(() => {
      toast.success("Synced", { id: "sync" });
    });
    expect(list().getAllByRole("listitem")).toHaveLength(1);
    expect(list().getByText("Synced")).toBeInTheDocument();
  });

  it("stacks: only visibleToasts are reachable, the rest are hidden", () => {
    render(<Toaster visibleToasts={2} />);
    act(() => {
      toast("A");
      toast("B");
      toast("C");
    });
    const items = list().getAllByRole("listitem", { hidden: true });
    expect(items).toHaveLength(3);
    // newest first
    expect(items[0]).toHaveTextContent("C");
    expect(items[2]).toHaveAttribute("aria-hidden", "true");
    expect(items[2]).toHaveAttribute("tabindex", "-1");
  });

  it("dismisses on a long horizontal swipe", async () => {
    render(<Toaster position="bottom-right" />);
    act(() => {
      toast("Swipe me");
    });
    const card = list().getByText("Swipe me").closest("li")!.firstElementChild as HTMLElement;
    fireEvent.pointerDown(card, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 120 });
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 120 });
    await settle();
    expect(list().queryByText("Swipe me")).toBeNull();
  });

  it("Alt+T moves focus to the toasts", async () => {
    render(<Toaster />);
    act(() => {
      toast("Focus me");
    });
    await userEvent.keyboard("{Alt>}t{/Alt}");
    expect(list().getByText("Focus me").closest("li")).toHaveFocus();
  });
});
