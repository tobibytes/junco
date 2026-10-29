import type {
  CollabAdapter,
  CollabComment,
  CollabNotification,
  CollabState,
  CollabThread,
  CollabUser,
  CollabVersion,
  CommentInput,
  ConnectionStatus,
  Peer,
} from "./types";

/*
 * The parts of @towhee/client this adapter uses, described by shape so Junco doesn't depend on
 * Towhee: pass a `client.enter(...)` room and `client.inbox` and they fit.
 */
interface TowheeUser {
  id: string;
  name?: string;
  color?: string;
  avatar?: string;
}
type TextRun = { type: "text"; text: string };
type Inline = TextRun | { type: "link"; url: string; children: TextRun[] } | { type: "mention"; userId: string; name?: string };
interface TowheeBody {
  version: 1;
  content: { type: "paragraph"; children: Inline[] }[];
}
interface TowheeComment {
  id: string;
  author: TowheeUser;
  body: TowheeBody;
  reactions: Record<string, string[]>;
  createdAt: number;
  editedAt?: number;
  deletedAt?: number;
}
interface TowheeThread {
  id: string;
  anchor?: { type: "app"; id: string } | { type: "text"; start: string; end: string };
  resolved: boolean;
  createdAt: number;
  comments: TowheeComment[];
}
interface TowheeVersion {
  id: string;
  kind: "auto" | "manual" | "restore";
  createdAt: number;
  createdBy?: TowheeUser;
  name?: string;
}
interface TowheeNotification {
  id: string;
  kind: "mention" | "reply";
  room: string;
  threadId: string;
  actor: TowheeUser;
  excerpt: string;
  createdAt: number;
  readAt?: number;
}

export interface TowheeRoomLike {
  status: "connecting" | "connected" | "reconnecting" | "disconnected";
  self: { user: TowheeUser } | null;
  others(): { clientId: number; user: TowheeUser; presence: Record<string, unknown> }[];
  on(event: "status" | "self" | "others", listener: () => void): () => void;
  updatePresence(fields: Record<string, unknown>): void;
  threads: {
    list(): TowheeThread[];
    subscribe(listener: () => void): () => void;
    create(input: { body: TowheeBody; anchor?: { type: "app"; id: string } }): Promise<unknown>;
    reply(threadId: string, body: TowheeBody): Promise<unknown>;
    react(threadId: string, commentId: string, reaction: string, add?: boolean): Promise<void>;
    resolve(threadId: string, resolved?: boolean): Promise<void>;
  };
  history: {
    list(): TowheeVersion[];
    subscribe(listener: () => void): () => void;
    save(name?: string): Promise<unknown>;
    // biome-ignore lint/suspicious/noExplicitAny: Towhee's RestoreOptions, passed through untouched
    restore(versionId: string, options?: any): Promise<unknown>;
  };
}

export interface TowheeInboxLike {
  list(): TowheeNotification[];
  subscribe(listener: () => void): () => void;
  markRead(ids: readonly string[]): Promise<void>;
  markAllRead(): Promise<void>;
}

export interface TowheeAdapterOptions {
  /** A room from `client.enter(id)`. */
  room: TowheeRoomLike;
  /** `client.inbox`, to show notifications. */
  inbox?: TowheeInboxLike;
  /**
   * Passed to `room.history.restore`: how to find the document's roots, like `{ types: { cards: "map" } }`.
   * See Towhee's history docs.
   */
  restoreOptions?: unknown;
}

const user = (u: TowheeUser): CollabUser => ({ id: u.id, name: u.name ?? u.id, color: u.color, avatar: u.avatar });

const STATUS: Record<TowheeRoomLike["status"], ConnectionStatus> = {
  connecting: "connecting",
  connected: "connected",
  reconnecting: "reconnecting",
  disconnected: "offline",
};

/** A Towhee comment body as plain text with `@Name` mentions, plus the ids mentioned. */
export function fromTowheeBody(body: TowheeBody): { text: string; mentions: string[] } {
  const mentions: string[] = [];
  const inline = (c: Inline): string => {
    if (c.type === "text") return c.text;
    if (c.type === "mention") {
      mentions.push(c.userId);
      return `@${c.name ?? c.userId}`;
    }
    return c.children.map((t) => t.text).join("");
  };
  return { text: body.content.map((p) => p.children.map(inline).join("")).join("\n"), mentions: [...new Set(mentions)] };
}

/** What someone typed, as a Towhee body: mentions first (with names), then the text, one paragraph per line. */
export function toTowheeBody(input: CommentInput): TowheeBody {
  const lines = input.text.trim().split("\n");
  const first: Inline[] = input.mentions.flatMap((m) => [{ type: "mention" as const, userId: m.id, name: m.name }, { type: "text" as const, text: " " }]);
  return {
    version: 1,
    content: lines.map((line, i) => ({
      type: "paragraph" as const,
      children: [...(i === 0 ? first : []), ...(line ? [{ type: "text" as const, text: line }] : [])],
    })),
  };
}

function comment(c: TowheeComment): CollabComment {
  const { text, mentions } = fromTowheeBody(c.body);
  return { id: c.id, author: user(c.author), body: text, mentions, reactions: c.reactions, createdAt: c.createdAt, editedAt: c.editedAt, deleted: c.deletedAt !== undefined };
}

/**
 * Maps a Towhee room (and inbox) onto the collaboration components. Presence fields `cursor` and
 * `editing` are the ones the components read and write.
 */
export function towheeAdapter({ room, inbox, restoreOptions }: TowheeAdapterOptions): CollabAdapter & { dispose(): void } {
  let state: CollabState | null = null;
  const listeners = new Set<() => void>();
  const changed = () => {
    state = null;
    for (const l of [...listeners]) l();
  };
  const unsubscribe = [
    room.on("status", changed),
    room.on("self", changed),
    room.on("others", changed),
    room.threads.subscribe(changed),
    room.history.subscribe(changed),
    ...(inbox ? [inbox.subscribe(changed)] : []),
  ];

  const read = (): CollabState => ({
    status: STATUS[room.status],
    self: room.self ? user(room.self.user) : null,
    peers: room.others().map(
      (o): Peer => ({
        id: String(o.clientId),
        user: user(o.user),
        cursor: (o.presence.cursor as Peer["cursor"]) ?? null,
        editing: typeof o.presence.editing === "string" ? o.presence.editing : null,
      }),
    ),
    threads: room.threads.list().map(
      (t): CollabThread => ({
        id: t.id,
        anchor: t.anchor?.type === "app" ? t.anchor.id : undefined,
        resolved: t.resolved,
        createdAt: t.createdAt,
        comments: t.comments.map(comment),
      }),
    ),
    versions: room.history.list().map(
      (v): CollabVersion => ({ id: v.id, kind: v.kind, name: v.name, createdAt: v.createdAt, author: v.createdBy ? user(v.createdBy) : undefined }),
    ),
    notifications: (inbox?.list() ?? []).map(
      (n): CollabNotification => ({
        id: n.id,
        kind: n.kind,
        actor: user(n.actor),
        excerpt: n.excerpt,
        createdAt: n.createdAt,
        read: n.readAt !== undefined,
        threadId: n.threadId,
        room: n.room,
      }),
    ),
  });

  return {
    getState: () => {
      state ??= read();
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose: () => {
      for (const u of unsubscribe) u();
      listeners.clear();
    },
    updatePresence: (presence) => room.updatePresence(presence),
    createThread: async ({ anchor, ...input }) => {
      await room.threads.create({ body: toTowheeBody(input), ...(anchor ? { anchor: { type: "app", id: anchor } } : {}) });
    },
    reply: async (threadId, input) => {
      await room.threads.reply(threadId, toTowheeBody(input));
    },
    react: (threadId, commentId, emoji, add) => room.threads.react(threadId, commentId, emoji, add),
    resolve: (threadId, resolved) => room.threads.resolve(threadId, resolved),
    saveVersion: async (name) => {
      await room.history.save(name?.trim() || undefined);
    },
    restoreVersion: async (versionId) => {
      await room.history.restore(versionId, restoreOptions);
    },
    markRead: async (ids) => {
      if (!inbox) return;
      await (ids ? inbox.markRead(ids) : inbox.markAllRead());
    },
  };
}
