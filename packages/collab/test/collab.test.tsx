import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AvatarStack,
  CollabProvider,
  CommentsPanel,
  ConnectionStatus,
  CursorSurface,
  createFakeAdapter,
  EditingBar,
  fromTowheeBody,
  HistoryPanel,
  InboxButton,
  LiveCursors,
  type TowheeRoomLike,
  toTowheeBody,
  towheeAdapter,
} from "../src";

describe("fake data by default", () => {
  it("shows sample people, cursors, editors and status without any setup", () => {
    const { container } = render(
      <div className="relative">
        <AvatarStack />
        <LiveCursors />
        <EditingBar labels={{ intro: "the introduction" }} />
        <ConnectionStatus />
      </div>,
    );
    expect(screen.getByRole("list", { name: "4 people here" })).toBeInTheDocument();
    expect(screen.getByLabelText("You (you)")).toBeInTheDocument();
    expect(container.querySelectorAll("svg path[d^='M1 1']")).toHaveLength(2); // two of three have a cursor
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText(/are editing/)).toHaveTextContent("Ada and Chen are editing");
  });

  it("collapses extra people into +N and shows each person once", () => {
    const u = (id: string) => ({ id, name: id.toUpperCase() });
    render(<AvatarStack users={[u("a"), u("b"), u("a"), u("c"), u("d"), u("e")]} max={3} />);
    expect(screen.getByRole("list", { name: "5 people here" }).children).toHaveLength(3);
    expect(screen.getByLabelText("and 2 more")).toHaveTextContent("+2");
  });

  it("says what happens offline, in words", () => {
    render(<ConnectionStatus status="offline" showDetail />);
    expect(screen.getByRole("status")).toHaveTextContent("Offline");
    expect(screen.getByRole("status")).toHaveTextContent("sync when you're back");
  });

  it("renders nothing in the editing bar when nobody is editing", () => {
    const { container } = render(<EditingBar peers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("with the fake adapter", () => {
  const now = () => Date.UTC(2026, 9, 29, 12);

  it("starts a thread with a mention, reacts, replies and resolves", async () => {
    const user = userEvent.setup();
    const adapter = createFakeAdapter({ threads: [], now });
    render(
      <CollabProvider adapter={adapter}>
        <CommentsPanel anchor="card-1" />
      </CollabProvider>,
    );
    expect(screen.getByText("No comments yet")).toBeInTheDocument();

    const box = screen.getByRole("region", { name: "New thread" });
    await user.type(within(box).getByLabelText("Write a comment"), "can you take this?");
    await user.click(within(box).getByRole("button", { name: "Mention" }));
    await user.click(await screen.findByRole("menuitem", { name: /Bo Lindqvist/ }));
    await user.click(within(box).getByRole("button", { name: "Post" }));

    const thread = await screen.findByRole("article");
    expect(thread).toHaveTextContent("@Bo Lindqvist can you take this?");
    expect(within(thread).getByText("@Bo Lindqvist")).toHaveClass("text-primary");
    expect(adapter.getState().threads[0]).toMatchObject({ anchor: "card-1", comments: [{ mentions: ["u-bo"] }] });

    await user.click(within(thread).getByRole("button", { name: "👍 0" }));
    expect(within(thread).getByRole("button", { name: "👍 1" })).toHaveAttribute("aria-pressed", "true");

    await user.type(within(thread).getByLabelText("Reply"), "On it{Control>}{Enter}{/Control}");
    await waitFor(() => expect(adapter.getState().threads[0]?.comments).toHaveLength(2));

    await user.click(within(thread).getByRole("button", { name: "Resolve" }));
    expect(within(screen.getByRole("article")).getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reopen" })).toBeInTheDocument();
  });

  it("keeps the text when posting fails, and says why", async () => {
    const user = userEvent.setup();
    render(<CommentsPanel threads={[]} people={[]} onCreate={() => Promise.reject(new Error("Room is read-only"))} />);
    await user.type(screen.getByLabelText("Write a comment"), "hello");
    await user.click(screen.getByRole("button", { name: "Post" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Room is read-only");
    expect(screen.getByLabelText("Write a comment")).toHaveValue("hello");
  });

  it("saves, restores and offers undo", async () => {
    const user = userEvent.setup();
    const adapter = createFakeAdapter({ versions: [], now });
    const undo = vi.fn();
    render(
      <CollabProvider adapter={adapter}>
        <HistoryPanel onUndo={undo} />
      </CollabProvider>,
    );
    expect(screen.getByText("No versions yet")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Version name"), "Sprint plan");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Sprint plan")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Restore sprint plan/i }));
    expect(await screen.findByText("Restored “Sprint plan”")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo restore" }));
    expect(undo).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Undo restore" })).not.toBeInTheDocument();
  });

  it("counts unread notifications and marks them read", async () => {
    const user = userEvent.setup();
    const adapter = createFakeAdapter();
    const open = vi.fn();
    render(
      <CollabProvider adapter={adapter}>
        <InboxButton onOpen={open} />
      </CollabProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Inbox, 1 unread" }));
    await user.click(await screen.findByRole("button", { name: /Ada Okafor mentioned you/ }));
    expect(open).toHaveBeenCalledWith(expect.objectContaining({ id: "n-1" }));
    expect(screen.getByRole("button", { name: "Inbox" })).toBeInTheDocument();
  });

  it("shares the pointer as fractions of the surface and clears it on leave", () => {
    const adapter = createFakeAdapter();
    const update = vi.spyOn(adapter, "updatePresence");
    render(
      <CollabProvider adapter={adapter}>
        <CursorSurface data-testid="surface" />
      </CollabProvider>,
    );
    const surface = screen.getByTestId("surface");
    surface.getBoundingClientRect = () => ({ left: 100, top: 50, width: 400, height: 200 }) as DOMRect;
    fireEvent.pointerMove(surface, { clientX: 200, clientY: 150 });
    expect(update).toHaveBeenLastCalledWith({ cursor: { x: 0.25, y: 0.5 } });
    fireEvent.pointerLeave(surface);
    expect(update).toHaveBeenLastCalledWith({ cursor: null });
  });

  it("re-renders when the backend changes", () => {
    const adapter = createFakeAdapter();
    render(
      <CollabProvider adapter={adapter}>
        <ConnectionStatus />
      </CollabProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Live");
    act(() => adapter.set({ status: "reconnecting" }));
    expect(screen.getByRole("status")).toHaveTextContent("Reconnecting");
  });
});

describe("Towhee adapter", () => {
  function fakeRoom() {
    const listeners = new Map<string, Set<() => void>>();
    const on = (name: string) => (fn: () => void) => {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(fn);
      return () => listeners.get(name)!.delete(fn);
    };
    const emit = (name: string) => {
      for (const fn of listeners.get(name) ?? []) fn();
    };
    const ada = { id: "ada", name: "Ada", color: "var(--chart-1)" };
    const room = {
      status: "connected" as TowheeRoomLike["status"],
      self: { user: { id: "me", name: "Me" } },
      others: () => [{ clientId: 7, user: ada, presence: { cursor: { x: 0.1, y: 0.2 }, editing: "card-1" } }],
      on: (event: string, fn: () => void) => on(event)(fn),
      updatePresence: vi.fn(),
      threads: {
        list: () => [
          {
            id: "t1",
            anchor: { type: "app" as const, id: "card-1" },
            resolved: false,
            createdAt: 1,
            comments: [
              {
                id: "c1",
                author: ada,
                body: { version: 1 as const, content: [{ type: "paragraph" as const, children: [{ type: "mention" as const, userId: "me", name: "Me" }, { type: "text" as const, text: " look" }] }] },
                reactions: {},
                createdAt: 1,
              },
            ],
          },
        ],
        subscribe: on("threads"),
        create: vi.fn(async () => ({})),
        reply: vi.fn(async () => ({})),
        react: vi.fn(async () => {}),
        resolve: vi.fn(async () => {}),
      },
      history: {
        list: () => [{ id: "v1", kind: "manual" as const, createdAt: 2, name: "First", createdBy: ada }],
        subscribe: on("history"),
        save: vi.fn(async () => ({})),
        restore: vi.fn(async () => ({})),
      },
    };
    return { room, emit, listeners };
  }

  it("maps rooms, threads and versions onto plain data, and caches until a change", () => {
    const { room, emit } = fakeRoom();
    const adapter = towheeAdapter({ room });
    const s = adapter.getState();
    expect(s.status).toBe("connected");
    expect(s.self).toEqual({ id: "me", name: "Me", color: undefined, avatar: undefined });
    expect(s.peers).toEqual([{ id: "7", user: expect.objectContaining({ id: "ada" }), cursor: { x: 0.1, y: 0.2 }, editing: "card-1" }]);
    expect(s.threads[0]).toMatchObject({ id: "t1", anchor: "card-1", comments: [{ body: "@Me look", mentions: ["me"] }] });
    expect(s.versions[0]).toMatchObject({ id: "v1", name: "First", author: { id: "ada" } });
    expect(adapter.getState()).toBe(s);

    room.status = "disconnected";
    emit("status");
    expect(adapter.getState()).not.toBe(s);
    expect(adapter.getState().status).toBe("offline");
  });

  it("turns comment input into Towhee bodies and calls the room", async () => {
    const { room, listeners } = fakeRoom();
    const adapter = towheeAdapter({ room, restoreOptions: { types: { cards: "map" } } });
    await adapter.createThread({ text: "hi\nthere", mentions: [{ id: "ada", name: "Ada" }], anchor: "card-2" });
    expect(room.threads.create).toHaveBeenCalledWith({
      body: {
        version: 1,
        content: [
          { type: "paragraph", children: [{ type: "mention", userId: "ada", name: "Ada" }, { type: "text", text: " " }, { type: "text", text: "hi" }] },
          { type: "paragraph", children: [{ type: "text", text: "there" }] },
        ],
      },
      anchor: { type: "app", id: "card-2" },
    });
    await adapter.restoreVersion("v1");
    expect(room.history.restore).toHaveBeenCalledWith("v1", { types: { cards: "map" } });
    adapter.updatePresence({ cursor: null });
    expect(room.updatePresence).toHaveBeenCalledWith({ cursor: null });
    adapter.dispose();
    expect([...listeners.values()].every((s) => s.size === 0)).toBe(true);
  });

  it("round-trips bodies", () => {
    const body = toTowheeBody({ text: "ship it", mentions: [{ id: "u1", name: "Bo" }] });
    expect(fromTowheeBody(body)).toEqual({ text: "@Bo ship it", mentions: ["u1"] });
  });
});
