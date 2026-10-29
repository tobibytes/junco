import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CollabProvider, createFakeAdapter, diffText, HistoryPanel, ShareDialog, type TowheeRoomLike, towheeAdapter, VersionCompare } from "../src";

describe("diffText", () => {
  it("marks added and removed words, keeping the rest", () => {
    expect(diffText("teams pay $10 a seat", "teams stay at $8 a seat")).toEqual([
      { kind: "same", text: "teams " },
      { kind: "removed", text: "pay $10" },
      { kind: "added", text: "stay at $8" },
      { kind: "same", text: " a seat" },
    ]);
  });

  it("handles empty sides", () => {
    expect(diffText("", "new text")).toEqual([{ kind: "added", text: "new text" }]);
    expect(diffText("old", "")).toEqual([{ kind: "removed", text: "old" }]);
    expect(diffText("same", "same")).toEqual([{ kind: "same", text: "same" }]);
  });
});

describe("VersionCompare", () => {
  it("counts words and announces changes in words, not only color", () => {
    render(<VersionCompare before="ship in November" after="ship on November 12" beforeLabel="First draft" />);
    expect(screen.getByText("+2 words")).toBeInTheDocument();
    expect(screen.getByText("−1 word")).toBeInTheDocument();
    const added = document.querySelector("ins")!;
    expect(added).toHaveTextContent("Added: on");
    expect(document.querySelector("del")).toHaveTextContent("Removed: in");
    expect(screen.getByRole("region", { name: "Changes from First draft to Now" })).toBeInTheDocument();
  });

  it("says when nothing changed", () => {
    render(<VersionCompare before="a b" after="a b" />);
    expect(screen.getByText("No changes.")).toBeInTheDocument();
  });
});

describe("HistoryPanel compare", () => {
  it("compares a version with now, restores it, and goes back", async () => {
    const user = userEvent.setup();
    const adapter = createFakeAdapter();
    render(
      <CollabProvider adapter={adapter}>
        <HistoryPanel />
      </CollabProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Compare First draft with now" }));
    const region = await screen.findByRole("region", { name: "Changes from First draft to Now" });
    expect(within(region).getByText(/\$10/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore First draft" }));
    await waitFor(() => expect(adapter.getState().versions[0]?.kind).toBe("restore"));
    expect(await adapter.versionText!("current")).toContain("$10 a seat");
    expect(screen.getByRole("button", { name: "Compare First draft with now" })).toBeInTheDocument();
  });

  it("has no Compare button without a way to read versions", () => {
    render(<HistoryPanel versions={[{ id: "v", kind: "manual", name: "x", createdAt: 0 }]} />);
    expect(screen.queryByRole("button", { name: /Compare/ })).not.toBeInTheDocument();
  });

  it("reads Towhee versions through textOf", async () => {
    const preview = vi.fn(async (id: string) => ({ text: `at ${id}`, destroy: vi.fn() }));
    const room = {
      status: "connected",
      self: null,
      others: () => [],
      on: () => () => {},
      updatePresence: () => {},
      doc: { text: "now" },
      threads: { list: () => [], subscribe: () => () => {}, create: vi.fn(), reply: vi.fn(), react: vi.fn(), resolve: vi.fn() },
      history: { list: () => [], subscribe: () => () => {}, save: vi.fn(), restore: vi.fn(), preview },
    } as unknown as TowheeRoomLike;
    const adapter = towheeAdapter({ room, textOf: (doc: { text: string }) => doc.text });
    expect(await adapter.versionText!("current")).toBe("now");
    expect(await adapter.versionText!("v9")).toBe("at v9");
    expect(towheeAdapter({ room }).versionText).toBeUndefined();
  });
});

describe("ShareDialog", () => {
  // Many keystrokes and two menus: slow on CI machines, so no typing delay and a longer timeout.
  it("invites by email with a role, rejects bad or duplicate emails, changes and removes people", { timeout: 20_000 }, async () => {
    const user = userEvent.setup({ delay: null });
    render(<ShareDialog />);
    await user.click(screen.getByRole("button", { name: "Share" }));
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText("Email address"), "not-an-email");
    await user.click(within(dialog).getByRole("button", { name: "Invite" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Enter an email address");

    await user.clear(within(dialog).getByLabelText("Email address"));
    await user.type(within(dialog).getByLabelText("Email address"), "ada@northwind.dev");
    await user.click(within(dialog).getByRole("button", { name: "Invite" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("already has access");

    await user.clear(within(dialog).getByLabelText("Email address"));
    await user.type(within(dialog).getByLabelText("Email address"), "kim@example.com");
    await user.click(within(dialog).getByRole("button", { name: "Invite" }));
    const people = within(dialog).getByRole("region", { name: "People with access" });
    expect(await within(people).findByText("kim@example.com")).toBeInTheDocument();

    // The owner (you) can't be changed.
    expect(within(people).queryByRole("combobox", { name: "Role for You" })).not.toBeInTheDocument();
    await user.click(within(people).getByRole("combobox", { name: "Role for Bo Lindqvist" }));
    await user.click(await screen.findByRole("option", { name: "Remove access" }));
    expect(within(people).queryByText("Bo Lindqvist")).not.toBeInTheDocument();
  });

  it("calls the app's handlers when given them", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn();
    const onLinkAccessChange = vi.fn();
    render(<ShareDialog members={[]} onInvite={onInvite} onLinkAccessChange={onLinkAccessChange} link="https://app.test/doc/1" />);
    await user.click(screen.getByRole("button", { name: "Share" }));
    await user.type(await screen.findByLabelText("Email address"), "kim@example.com");
    await user.click(screen.getByRole("button", { name: "Invite" }));
    expect(onInvite).toHaveBeenCalledWith("kim@example.com", "editor");
    await user.click(screen.getByRole("combobox", { name: "Who can open the link" }));
    await user.click(await screen.findByRole("option", { name: "Anyone with the link" }));
    expect(onLinkAccessChange).toHaveBeenCalledWith("anyone", "viewer");
  });
});
