import type { CollabAdapter, CollabComment, CollabState, CollabThread, CollabUser, CollabVersion, CommentInput, Cursor, Peer } from "./types";

/** Realistic people and content, used when a component gets no data and in the fake adapter. */
const minute = 60_000;
const t0 = Date.UTC(2026, 9, 28, 15, 0);

export const sampleUsers: CollabUser[] = [
  { id: "u-ada", name: "Ada Okafor", color: "var(--chart-1)" },
  { id: "u-bo", name: "Bo Lindqvist", color: "var(--chart-2)" },
  { id: "u-chen", name: "Chen Wei", color: "var(--chart-5)" },
  { id: "u-dami", name: "Dami Adeyemi", color: "var(--chart-4)" },
];
const [ada, bo, chen, dami] = sampleUsers as [CollabUser, CollabUser, CollabUser, CollabUser];

export const sampleSelf: CollabUser = { id: "u-you", name: "You", color: "var(--muted-foreground)" };

export const samplePeers: Peer[] = [
  { id: "p-ada", user: ada, cursor: { x: 0.32, y: 0.38 }, editing: "intro" },
  { id: "p-bo", user: bo, cursor: { x: 0.68, y: 0.62 }, editing: null },
  { id: "p-chen", user: chen, cursor: null, editing: "pricing" },
];

export const sampleThreads: CollabThread[] = [
  {
    id: "t-1",
    anchor: "intro",
    resolved: false,
    createdAt: t0 - 42 * minute,
    comments: [
      {
        id: "c-1",
        author: ada,
        body: "@Bo Lindqvist can we cut this paragraph in half? It buries the launch date.",
        mentions: [bo.id],
        createdAt: t0 - 42 * minute,
        reactions: { "👍": [chen.id] },
      },
      { id: "c-2", author: bo, body: "Yes. I'll move the date to the first line.", createdAt: t0 - 31 * minute, reactions: {} },
    ],
  },
  {
    id: "t-2",
    anchor: "pricing",
    resolved: true,
    createdAt: t0 - 3 * 60 * minute,
    comments: [{ id: "c-3", author: dami, body: "Pricing table matches the site now.", createdAt: t0 - 3 * 60 * minute, reactions: { "🎉": [ada.id, bo.id] } }],
  },
];

export const sampleVersions: CollabVersion[] = [
  { id: "v-3", kind: "auto", createdAt: t0 - 12 * minute },
  { id: "v-2", kind: "manual", name: "Sent to legal", createdAt: t0 - 2 * 60 * minute, author: chen },
  { id: "v-1", kind: "manual", name: "First draft", createdAt: t0 - 26 * 60 * minute, author: ada },
];

/** The sample document at each sample version, for version compare. */
export const sampleVersionTexts: Record<string, string> = {
  "v-1": "Launch plan\nWe ship the new editor in November. Beta users move over first.\n\nPricing\nTeams pay $10 a seat.",
  "v-2": "Launch plan\nWe ship the new editor on November 12. Beta users move over a week earlier.\n\nPricing\nTeams stay at $8 a seat.",
  "v-3": "Launch plan\nWe ship the new editor on November 12. Beta users move over a week earlier, and the changelog goes out the same morning.\n\nPricing\nTeams stay at $8 a seat. Editors with more than 50 seats get the annual discount automatically.",
  current:
    "Launch plan\nWe ship the new editor on November 12. Beta users move over a week earlier, and the changelog goes out the same morning.\n\nPricing\nTeams stay at $8 a seat. Editors with more than 50 seats get the annual discount automatically.\n\nRisks\nSearch indexing is the slow part.",
};

export const sampleNotifications = [
  { id: "n-1", kind: "mention" as const, actor: ada, excerpt: "@You can you check the numbers in the pricing section?", createdAt: t0 - 8 * minute, read: false, threadId: "t-2" },
  { id: "n-2", kind: "reply" as const, actor: bo, excerpt: "Yes. I'll move the date to the first line.", createdAt: t0 - 31 * minute, read: true, threadId: "t-1" },
];

export const sampleState: CollabState = {
  status: "connected",
  self: sampleSelf,
  peers: samplePeers,
  threads: sampleThreads,
  versions: sampleVersions,
  notifications: sampleNotifications,
};

export interface FakeAdapterOptions extends Partial<CollabState> {
  /** Text of each version (and `current`) for version compare. Default: sample texts. */
  versionTexts?: Record<string, string>;
  /** Moves the other people's cursors around, for demos. Off by default. */
  simulate?: boolean;
  /** Clock for new comments and versions. Default `Date.now`. */
  now?: () => number;
}

export interface FakeAdapter extends CollabAdapter {
  /** Replaces part of the state, as if the server had sent it. */
  set(patch: Partial<CollabState>): void;
  /** Stops the simulation timer. */
  dispose(): void;
}

/** Body text with mentions written in, the way the components display it. */
export function commentText(input: CommentInput): string {
  const mentions = input.mentions.map((m) => `@${m.name}`).join(" ");
  return [mentions, input.text.trim()].filter(Boolean).join(" ");
}

/**
 * An in-memory backend with realistic data: every action works and updates the UI, nothing leaves
 * the page. For docs, tests, prototypes and building a UI before the server exists.
 */
export function createFakeAdapter(options: FakeAdapterOptions = {}): FakeAdapter {
  const { simulate = false, now = Date.now, versionTexts = sampleVersionTexts, ...initial } = options;
  const texts = { ...versionTexts };
  let state: CollabState = { ...sampleState, ...initial };
  const listeners = new Set<() => void>();
  let ids = 0;
  const id = (prefix: string) => `${prefix}-${now().toString(36)}-${++ids}`;

  const set = (patch: Partial<CollabState>) => {
    state = { ...state, ...patch };
    for (const l of [...listeners]) l();
  };
  const me = () => state.self ?? sampleSelf;
  const comment = (input: CommentInput): CollabComment => ({
    id: id("c"),
    author: me(),
    body: commentText(input),
    mentions: input.mentions.map((m) => m.id),
    createdAt: now(),
    reactions: {},
  });
  const updateThread = (threadId: string, fn: (t: CollabThread) => CollabThread) =>
    set({ threads: state.threads.map((t) => (t.id === threadId ? fn(t) : t)) });

  let timer: ReturnType<typeof setInterval> | undefined;
  if (simulate) {
    timer = setInterval(() => {
      set({
        peers: state.peers.map((p, i) =>
          p.cursor === null && i % 3 === 2 ? p : { ...p, cursor: wander(p.cursor ?? { x: 0.5, y: 0.5 }) },
        ),
      });
    }, 1200);
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set,
    dispose: () => clearInterval(timer),
    updatePresence() {
      // Your own presence isn't drawn by these components; a real adapter sends it to the others.
    },
    async createThread(input) {
      const thread: CollabThread = { id: id("t"), anchor: input.anchor, resolved: false, createdAt: now(), comments: [comment(input)] };
      set({ threads: [...state.threads, thread] });
    },
    async reply(threadId, input) {
      updateThread(threadId, (t) => ({ ...t, comments: [...t.comments, comment(input)] }));
    },
    async react(threadId, commentId, emoji, add) {
      const who = me().id;
      updateThread(threadId, (t) => ({
        ...t,
        comments: t.comments.map((c) => {
          if (c.id !== commentId) return c;
          const users = c.reactions?.[emoji] ?? [];
          const next = add ? [...new Set([...users, who])] : users.filter((u) => u !== who);
          return { ...c, reactions: { ...c.reactions, [emoji]: next } };
        }),
      }));
    },
    async resolve(threadId, resolved) {
      updateThread(threadId, (t) => ({ ...t, resolved }));
    },
    async saveVersion(name) {
      const version: CollabVersion = { id: id("v"), kind: "manual", name: name?.trim() || undefined, createdAt: now(), author: me() };
      texts[version.id] = texts.current ?? "";
      set({ versions: [version, ...state.versions] });
    },
    async restoreVersion(versionId) {
      const from = state.versions.find((v) => v.id === versionId);
      if (!from) throw new Error("No such version");
      const version: CollabVersion = { id: id("v"), kind: "restore", name: from.name ? `Restored “${from.name}”` : "Restored", createdAt: now(), author: me() };
      texts.current = texts[versionId] ?? texts.current ?? "";
      texts[version.id] = texts.current;
      set({ versions: [version, ...state.versions] });
    },
    async versionText(versionId) {
      const text = texts[versionId];
      if (text === undefined) throw new Error("This version has no saved text");
      return text;
    },
    async markRead(ids) {
      const pick = ids ? new Set(ids) : null;
      set({ notifications: state.notifications.map((n) => (!pick || pick.has(n.id) ? { ...n, read: true } : n)) });
    },
  };
}

function wander(c: Cursor): Cursor {
  const clamp = (v: number) => Math.min(0.92, Math.max(0.05, v));
  return { x: clamp(c.x + (Math.random() - 0.5) * 0.3), y: clamp(c.y + (Math.random() - 0.5) * 0.25) };
}
