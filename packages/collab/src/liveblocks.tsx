import * as React from "react";
import { Avatar, Badge, cn } from "@junco/react";
import { ClientSideSuspense, LiveblocksProvider, RoomProvider, useHistoryVersions, useOthers, useSelf, useThreads, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { useHistoryVersionStorageData, useRestoreToStorageVersion } from "@liveblocks/react";
import { Composer, Thread } from "@liveblocks/react-ui";
import type { CollabUser } from "./types";
import { useCollaborationTracker } from "./analytics";

type LiveblocksProviderProps = React.ComponentProps<typeof LiveblocksProvider>;
type RoomProviderProps = React.ComponentProps<typeof RoomProvider>;
type AuthEndpoint = NonNullable<LiveblocksProviderProps["authEndpoint"]>;

export type LiveblocksCollabProviderProps = {
  roomId: string;
  user: CollabUser;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  initialStorage?: RoomProviderProps["initialStorage"];
  resolveUsers?: LiveblocksProviderProps["resolveUsers"];
  resolveMentionSuggestions?: LiveblocksProviderProps["resolveMentionSuggestions"];
} & ({ publicApiKey: string; authEndpoint?: never } | { authEndpoint: AuthEndpoint; publicApiKey?: never });

/** Join a room with Liveblocks. Use an auth endpoint for private rooms in production. */
export function LiveblocksCollabProvider({ roomId, user, children, fallback = <div className="text-sm text-muted-foreground">Connecting…</div>, resolveUsers, resolveMentionSuggestions, initialStorage, ...credentials }: LiveblocksCollabProviderProps) {
  const initialPresence = { user, cursor: null, status: "viewing" } as never;
  const room = <RoomProvider id={roomId} initialPresence={initialPresence} initialStorage={initialStorage}><ClientSideSuspense fallback={fallback}>{children}</ClientSideSuspense></RoomProvider>;
  if (typeof credentials.publicApiKey === "string") return <LiveblocksProvider publicApiKey={credentials.publicApiKey} resolveUsers={resolveUsers} resolveMentionSuggestions={resolveMentionSuggestions}>{room}</LiveblocksProvider>;
  return <LiveblocksProvider authEndpoint={credentials.authEndpoint!} resolveUsers={resolveUsers} resolveMentionSuggestions={resolveMentionSuggestions}>{room}</LiveblocksProvider>;
}

type LivePresence = { user?: CollabUser; cursor?: { x: number; y: number } | null; status?: "viewing" | "editing" };

/** Compact, accessible stack for people currently connected to the room. */
export function LiveblocksPresenceStack({ className, max = 4 }: { className?: string; max?: number }) {
  const others = useOthers();
  const self = useSelf();
  const track = useCollaborationTracker();
  const people = [
    ...(self ? [{ id: `self-${self.connectionId}`, user: (self.presence as LivePresence).user }] : []),
    ...others.map((other) => ({ id: String(other.connectionId), user: (other.presence as LivePresence).user })),
  ].filter((item): item is { id: string; user: CollabUser } => Boolean(item.user));
  const shown = people.slice(0, max);
  const remaining = people.length - shown.length;
  const previousCount = React.useRef(people.length);
  const connected = React.useRef(false);
  const leaveTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => {
    const delta = people.length - previousCount.current;
    if (!connected.current && people.length > 0) {
      track("room.joined", undefined, { participantCount: people.length });
      connected.current = true;
    } else if (delta > 0) track("room.joined", undefined, { participantCount: people.length });
    else if (delta < 0) track("room.left", undefined, { participantCount: people.length });
    previousCount.current = people.length;
  }, [people.length, track]);
  React.useEffect(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    return () => {
      leaveTimer.current = setTimeout(() => {
        if (connected.current) track("room.left", undefined, { participantCount: Math.max(0, previousCount.current - 1) });
      }, 0);
    };
  }, [track]);
  return (
    <div className={cn("flex items-center -space-x-2", className)} role="list" aria-label={`${people.length} people in this room`}>
      {shown.map(({ id, user }) => <span role="listitem" key={id} title={user.name}><Avatar name={user.name} src={user.avatarUrl} size="sm" className="ring-2 ring-background" /></span>)}
      {remaining > 0 && <span className="grid size-8 place-items-center rounded-pill border-2 border-background bg-muted text-xs font-medium text-muted-foreground" aria-label={`${remaining} more people`}>+{remaining}</span>}
      <Badge className="ml-3" variant="outline">{people.length} here</Badge>
    </div>
  );
}

/** Report whether this user is actively editing so presence bars can distinguish viewers. */
export function LiveblocksEditingStatus({ editing }: { editing: boolean }) {
  const updatePresence = useUpdateMyPresence();
  React.useEffect(() => {
    updatePresence({ status: editing ? "editing" : "viewing" } as never);
  }, [editing, updatePresence]);
  return null;
}

/** Shares pointer position relative to this region and draws collaborators' cursors. */
export function LiveblocksCursorLayer({ children, className }: { children: React.ReactNode; className?: string }) {
  const root = React.useRef<HTMLDivElement>(null);
  const updatePresence = useUpdateMyPresence();
  const others = useOthers();
  const setCursor = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = root.current?.getBoundingClientRect();
    if (rect) updatePresence({ cursor: { x: event.clientX - rect.left, y: event.clientY - rect.top } } as never);
  };
  return (
    <div ref={root} className={cn("relative", className)} onPointerMove={setCursor} onPointerLeave={() => updatePresence({ cursor: null } as never)}>
      {children}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {others.map((other) => {
          const presence = other.presence as LivePresence;
          if (!presence.cursor) return null;
          const user = presence.user;
          return <div key={other.connectionId} className="absolute z-sticky flex items-start gap-1.5 transition-[left,top] duration-fast" style={{ left: presence.cursor.x, top: presence.cursor.y, color: user?.color ?? "var(--primary)" }}><span className="size-3 rotate-45 rounded-tl-xs bg-current" /><span className="rounded-xs bg-current px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground shadow-float">{user?.name ?? "Collaborator"}</span></div>;
        })}
      </div>
    </div>
  );
}

/** Live comment threads for the current room. Import Liveblocks' styles in your app stylesheet. */
export function LiveblocksComments({ className, emptyLabel = "No comments yet. Start a thread.", metadata = {} }: { className?: string; emptyLabel?: string; metadata?: Record<string, unknown> }) {
  const { threads } = useThreads();
  const track = useCollaborationTracker();
  const seenThreads = React.useRef<Map<string, { commentIds: Set<string>; resolved: boolean; reactions: number }> | null>(null);
  const visibleThreads = (threads ?? []).filter((thread) => !thread.resolved);
  React.useEffect(() => {
    const previous = seenThreads.current;
    const current = new Map<string, { commentIds: Set<string>; resolved: boolean; reactions: number }>();
    for (const thread of threads ?? []) {
      const commentIds = new Set(thread.comments.map((comment) => comment.id));
      const reactions = thread.comments.reduce((total, comment) => total + comment.reactions.length, 0);
      const before = previous?.get(thread.id);
      if (previous) {
        if (before && before.resolved !== thread.resolved) track(thread.resolved ? "thread.resolved" : "thread.reopened");
        for (const comment of thread.comments) {
          if (!before?.commentIds.has(comment.id)) track(before ? "comment.replied" : "comment.created");
        }
        if (before && reactions > before.reactions) track("reaction.added");
      }
      current.set(thread.id, { commentIds, resolved: thread.resolved, reactions });
    }
    seenThreads.current = current;
  }, [threads, track]);
  return (
    <section aria-label="Live comments" className={cn("grid gap-4", className)}>
      {visibleThreads.length ? visibleThreads.map((thread) => <Thread key={thread.id} thread={thread} />) : <p className="rounded-card border border-dashed border-border p-5 text-center text-sm text-muted-foreground">{emptyLabel}</p>}
      <Composer metadata={metadata as never} />
    </section>
  );
}

/** Activity timeline derived from live comment threads. App-specific edits can be merged beside it. */
export function LiveblocksActivityPanel({ className, limit = 12 }: { className?: string; limit?: number }) {
  const { threads } = useThreads();
  const entries = (threads ?? []).flatMap((thread) => thread.comments.map((comment, index) => ({
    id: comment.id,
    userId: comment.userId,
    createdAt: comment.createdAt,
    action: index === 0 ? "started a discussion" : "replied to a discussion",
  }))).sort((a, b) => Date.parse(String(b.createdAt)) - Date.parse(String(a.createdAt))).slice(0, limit);
  return <section aria-label="Room activity" className={cn("grid gap-3 rounded-card border border-border bg-card p-4", className)}><div><h3 className="font-semibold">Room activity</h3><p className="text-sm text-muted-foreground">Recent comments in this room.</p></div><ol className="grid gap-3">{entries.map((entry) => <li key={entry.id} className="flex items-start gap-2 text-sm"><span className="mt-1 size-2 shrink-0 rounded-pill bg-primary" aria-hidden /><p><span className="font-medium">{entry.userId}</span> {entry.action}<time className="mt-1 block text-xs text-muted-foreground">{new Date(String(entry.createdAt)).toLocaleString()}</time></p></li>)}{entries.length === 0 && <li className="text-sm text-muted-foreground">No room activity yet.</li>}</ol></section>;
}

/** Version list, Storage preview, and restore action for rooms using Liveblocks Storage. */
export function LiveblocksHistoryPanel({ className }: { className?: string }) {
  const { versions, isLoading } = useHistoryVersions();
  const [selectedId, setSelectedId] = React.useState<string>();
  const selected = versions?.find((version) => version.id === selectedId) ?? versions?.[0];
  return <section aria-label="Version history" className={cn("grid gap-4 rounded-card border border-border bg-card p-4", className)}><div><h3 className="font-semibold">Version history</h3><p className="text-sm text-muted-foreground">Browse and restore Liveblocks Storage snapshots.</p></div>{isLoading ? <p className="text-sm text-muted-foreground">Loading versions…</p> : versions?.length ? <><ol className="grid max-h-56 gap-2 overflow-auto">{versions.map((version) => <li key={version.id}><button type="button" onClick={() => setSelectedId(version.id)} aria-pressed={selected?.id === version.id} className={cn("w-full rounded-control border border-border p-3 text-left text-sm hover:bg-muted/50", selected?.id === version.id && "border-ring bg-muted/40")}><span className="block font-medium">{version.createdAt.toLocaleString()}</span><span className="mt-1 block text-xs text-muted-foreground">{version.authors.length ? version.authors.map((author) => author.id).join(", ") : "Unattributed"}</span></button></li>)}</ol>{selected && <LiveblocksStorageVersionPreview versionId={selected.id} />}</> : <p className="rounded-control border border-dashed border-border p-4 text-sm text-muted-foreground">No saved versions yet. Enable Storage version history in your Liveblocks project settings.</p>}</section>;
}

function LiveblocksStorageVersionPreview({ versionId }: { versionId: string }) {
  const { data, isLoading, error } = useHistoryVersionStorageData(versionId);
  const restore = useRestoreToStorageVersion(versionId);
  const track = useCollaborationTracker();
  const json = React.useMemo(() => data ? JSON.stringify(data.toJSON(), null, 2) : "", [data]);
  return <div className="grid gap-3"><h4 className="text-sm font-medium">Snapshot preview</h4>{isLoading ? <p className="text-sm text-muted-foreground">Loading snapshot…</p> : error ? <p role="alert" className="text-sm text-danger">Could not load this version: {error.message}</p> : <pre className="max-h-64 overflow-auto rounded-control bg-muted p-3 text-xs leading-5">{json}</pre>}<button type="button" disabled={isLoading || Boolean(error)} onClick={() => { void restore().then(() => track("history.restored")); }} className="inline-flex w-fit items-center justify-center rounded-control border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">Restore this version</button></div>;
}
