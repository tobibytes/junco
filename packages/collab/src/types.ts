export type CollabRole = "owner" | "editor" | "commenter" | "viewer";
export type SaveState = "saved" | "saving" | "offline" | "error";

export interface CollabUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  color?: string;
}

export interface CollabParticipant {
  user: CollabUser;
  status: "viewing" | "editing";
  cursor?: { x: number; y: number } | null;
}

export interface CollabComment {
  id: string;
  user: CollabUser;
  body: string;
  createdAt: number;
  reactions: { emoji: string; users: string[] }[];
}

export interface CollabThread {
  id: string;
  anchor: string;
  resolved: boolean;
  comments: CollabComment[];
}

export interface CollabVersion {
  id: string;
  label: string;
  author: CollabUser;
  createdAt: number;
  content: string;
}

export interface CollabMember {
  user: CollabUser;
  role: CollabRole;
  pending?: boolean;
}

export interface CollaborationActivity {
  id: string;
  action: "commented" | "replied" | "resolved" | "reopened" | "reacted" | "restored" | "invited" | "role_changed";
  actor: CollabUser;
  target: string;
  createdAt: number;
}

export interface CollaborationSnapshot {
  participants: CollabParticipant[];
  threads: CollabThread[];
  versions: CollabVersion[];
  members: CollabMember[];
  activity: CollaborationActivity[];
  saveState: SaveState;
  content: string;
}

export interface PresenceAdapter {
  update(roomId: string, userId: string, patch: Partial<Pick<CollabParticipant, "status" | "cursor">>): void;
}

export interface CommentsAdapter {
  create(roomId: string, anchor: string, body: string, userId: string): void;
  reply(roomId: string, threadId: string, body: string, userId: string): void;
  resolve(roomId: string, threadId: string, resolved: boolean): void;
  react(roomId: string, threadId: string, commentId: string, emoji: string, userId: string): void;
}

export interface HistoryAdapter {
  restore(roomId: string, versionId: string): void;
}

export interface SharingAdapter {
  invite(roomId: string, user: CollabUser, role: Exclude<CollabRole, "owner">): void;
  setRole(roomId: string, userId: string, role: Exclude<CollabRole, "owner">): void;
  remove(roomId: string, userId: string): void;
}

export interface CollaborationAdapter {
  readonly presence: PresenceAdapter;
  readonly comments: CommentsAdapter;
  readonly history: HistoryAdapter;
  readonly sharing: SharingAdapter;
  subscribe(roomId: string, listener: () => void): () => void;
  getSnapshot(roomId: string): CollaborationSnapshot;
}
