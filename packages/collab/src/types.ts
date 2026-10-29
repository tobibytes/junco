/**
 * Plain data the collaboration components draw. Any backend maps onto these through an adapter
 * (see `CollabAdapter`); the components never talk to a server themselves.
 */

export interface CollabUser {
  id: string;
  name: string;
  /** Their color for cursors, rings and names. Any CSS color; a token like `var(--primary)` works too. */
  color?: string;
  avatar?: string;
}

/** A pointer position as fractions (0 to 1) of the shared surface, so it lines up at any size. */
export interface Cursor {
  x: number;
  y: number;
}

/** Someone else connected right now. One person in two tabs is two peers with one user. */
export interface Peer {
  /** Unique per connection. */
  id: string;
  user: CollabUser;
  cursor?: Cursor | null;
  /** What they're working on: an id your app understands, like a card or field id. */
  editing?: string | null;
}

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "offline";

export interface CollabComment {
  id: string;
  author: CollabUser;
  /** Plain text. Mentions appear in it as `@Name`. */
  body: string;
  /** Ids of the people mentioned. */
  mentions?: string[];
  /** Emoji to the ids of users who reacted with it. */
  reactions?: Record<string, string[]>;
  createdAt: number;
  editedAt?: number;
  deleted?: boolean;
}

export interface CollabThread {
  id: string;
  /** What it's attached to, like a card or block id. Undefined for document-wide threads. */
  anchor?: string;
  resolved: boolean;
  createdAt: number;
  comments: CollabComment[];
}

export interface CollabVersion {
  id: string;
  name?: string;
  /** `auto` saves on a timer, `manual` someone saved it, `restore` an earlier version came back. */
  kind: "auto" | "manual" | "restore";
  createdAt: number;
  author?: CollabUser;
}

export interface CollabNotification {
  id: string;
  kind: "mention" | "reply";
  actor: CollabUser;
  excerpt: string;
  createdAt: number;
  read: boolean;
  threadId?: string;
  /** Where it happened, for apps with several documents. */
  room?: string;
}

/** What someone typed into a comment box: the text, and who they picked to mention. */
export interface CommentInput {
  text: string;
  mentions: CollabUser[];
}

/** Everything a collaboration UI shows at one moment. */
export interface CollabState {
  status: ConnectionStatus;
  self: CollabUser | null;
  peers: Peer[];
  threads: CollabThread[];
  versions: CollabVersion[];
  notifications: CollabNotification[];
}

/**
 * The seam between the UI and a backend. `getState` must return the same object until something
 * changes (it feeds `useSyncExternalStore`), and `subscribe` calls back after each change.
 */
export interface CollabAdapter {
  getState(): CollabState;
  subscribe(listener: () => void): () => void;
  updatePresence(presence: { cursor?: Cursor | null; editing?: string | null }): void;
  createThread(input: CommentInput & { anchor?: string }): Promise<void>;
  reply(threadId: string, input: CommentInput): Promise<void>;
  react(threadId: string, commentId: string, emoji: string, add: boolean): Promise<void>;
  resolve(threadId: string, resolved: boolean): Promise<void>;
  saveVersion(name?: string): Promise<void>;
  restoreVersion(versionId: string): Promise<void>;
  /** Marks these notifications read, or all of them when `ids` is left out. */
  markRead(ids?: string[]): Promise<void>;
}
