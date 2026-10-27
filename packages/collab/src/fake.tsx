import * as React from "react";
import { Avatar, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, cn } from "@junco/react";
import type { CollabComment, CollabMember, CollabRole, CollabThread, CollabUser, CollaborationAdapter, CollaborationSnapshot, SaveState } from "./types";
import { useCollaborationTracker } from "./analytics";

const now = Date.now();
const self: CollabUser = { id: "tobi", name: "Tobi Olajide", email: "tobi@example.com", color: "oklch(0.58 0.19 260)" };
const maya: CollabUser = { id: "maya", name: "Maya Chen", email: "maya@example.com", color: "oklch(0.58 0.18 155)" };
const leo: CollabUser = { id: "leo", name: "Leo Martin", email: "leo@example.com", color: "oklch(0.58 0.19 30)" };

export const fakeCollaborationSnapshot: CollaborationSnapshot = {
  participants: [
    { user: self, status: "editing" },
    { user: maya, status: "editing" },
    { user: leo, status: "viewing" },
  ],
  threads: [
    {
      id: "thread-1",
      anchor: "Overview headline",
      resolved: false,
      comments: [
        { id: "comment-1", user: maya, body: "Could we make the headline more specific to the launch?", createdAt: now - 1000 * 60 * 22, reactions: [{ emoji: "👍", users: ["tobi"] }] },
        { id: "comment-2", user: self, body: "Agreed. I’ll include the launch date in the next pass.", createdAt: now - 1000 * 60 * 12, reactions: [] },
      ],
    },
    {
      id: "thread-2",
      anchor: "Audience chart",
      resolved: true,
      comments: [{ id: "comment-3", user: leo, body: "The 30 day range reads much better here.", createdAt: now - 1000 * 60 * 60 * 4, reactions: [{ emoji: "✨", users: ["maya", "tobi"] }] }],
    },
  ],
  versions: [
    { id: "v3", label: "Current draft", author: self, createdAt: now - 1000 * 60 * 3, content: "Launch overview with updated headline and audience chart." },
    { id: "v2", label: "Chart updated", author: maya, createdAt: now - 1000 * 60 * 44, content: "Audience chart switched to a 30 day view." },
    { id: "v1", label: "First draft", author: self, createdAt: now - 1000 * 60 * 60 * 5, content: "Initial overview page and launch metrics." },
  ],
  members: [
    { user: self, role: "owner" },
    { user: maya, role: "editor" },
    { user: leo, role: "commenter" },
  ],
  activity: [
    { id: "activity-1", action: "replied", actor: self, target: "Overview headline", createdAt: now - 1000 * 60 * 12 },
    { id: "activity-2", action: "commented", actor: maya, target: "Overview headline", createdAt: now - 1000 * 60 * 22 },
    { id: "activity-3", action: "resolved", actor: leo, target: "Audience chart", createdAt: now - 1000 * 60 * 60 * 4 },
  ],
  saveState: "saved",
  content: "Launch overview with updated headline and audience chart.",
};

const clone = <T,>(value: T): T => structuredClone(value);

export function createFakeCollaborationAdapter(seed: CollaborationSnapshot = fakeCollaborationSnapshot): CollaborationAdapter {
  const rooms = new Map<string, CollaborationSnapshot>();
  const listeners = new Map<string, Set<() => void>>();
  const room = (id: string) => {
    let value = rooms.get(id);
    if (!value) {
      value = clone(seed);
      rooms.set(id, value);
    }
    return value;
  };
  const emit = (id: string) => {
    listeners.get(id)?.forEach((listener) => {
      listener();
    });
  };
  const update = (id: string, change: (snapshot: CollaborationSnapshot) => void) => {
    const snapshot = clone(room(id));
    change(snapshot);
    rooms.set(id, snapshot);
    emit(id);
  };
  const getUser = (roomId: string, id: string) => room(roomId).members.find((member) => member.user.id === id)?.user ?? self;
  const addActivity = (snapshot: CollaborationSnapshot, roomId: string, action: CollaborationSnapshot["activity"][number]["action"], userId: string, target: string) => {
    snapshot.activity.unshift({ id: `activity-${crypto.randomUUID()}`, action, actor: getUser(roomId, userId), target, createdAt: Date.now() });
    snapshot.activity = snapshot.activity.slice(0, 50);
  };

  return {
    subscribe: (id, listener) => {
      const set = listeners.get(id) ?? new Set<() => void>();
      set.add(listener);
      listeners.set(id, set);
      return () => set.delete(listener);
    },
    getSnapshot: (id) => room(id),
    presence: {
      update: (roomId, userId, patch) => update(roomId, (snapshot) => {
        const participant = snapshot.participants.find((item) => item.user.id === userId);
        if (participant) Object.assign(participant, patch);
      }),
    },
    comments: {
      create: (roomId, anchor, body, userId) => update(roomId, (snapshot) => {
        const comment: CollabComment = { id: `comment-${crypto.randomUUID()}`, user: getUser(roomId, userId), body, createdAt: Date.now(), reactions: [] };
        const thread: CollabThread = { id: `thread-${crypto.randomUUID()}`, anchor, resolved: false, comments: [comment] };
        snapshot.threads.unshift(thread);
        addActivity(snapshot, roomId, "commented", userId, anchor);
      }),
      reply: (roomId, threadId, body, userId) => update(roomId, (snapshot) => {
        const thread = snapshot.threads.find((item) => item.id === threadId);
        if (thread) {
          thread.comments.push({ id: `comment-${crypto.randomUUID()}`, user: getUser(roomId, userId), body, createdAt: Date.now(), reactions: [] });
          addActivity(snapshot, roomId, "replied", userId, thread.anchor);
        }
      }),
      resolve: (roomId, threadId, resolved) => update(roomId, (snapshot) => {
        const thread = snapshot.threads.find((item) => item.id === threadId);
        if (thread) {
          thread.resolved = resolved;
          addActivity(snapshot, roomId, resolved ? "resolved" : "reopened", self.id, thread.anchor);
        }
      }),
      react: (roomId, threadId, commentId, emoji, userId) => update(roomId, (snapshot) => {
        const comment = snapshot.threads.find((item) => item.id === threadId)?.comments.find((item) => item.id === commentId);
        if (!comment) return;
        let reaction = comment.reactions.find((item) => item.emoji === emoji);
        if (!reaction) {
          reaction = { emoji, users: [] };
          comment.reactions.push(reaction);
        }
        reaction.users = reaction.users.includes(userId) ? reaction.users.filter((id) => id !== userId) : [...reaction.users, userId];
        addActivity(snapshot, roomId, "reacted", userId, "a comment");
      }),
    },
    history: {
      restore: (roomId, versionId) => update(roomId, (snapshot) => {
        const version = snapshot.versions.find((item) => item.id === versionId);
        if (version) {
          snapshot.content = version.content;
          snapshot.saveState = "saved";
          addActivity(snapshot, roomId, "restored", self.id, version.label);
        }
      }),
    },
    sharing: {
      invite: (roomId, user, role) => update(roomId, (snapshot) => {
        if (!snapshot.members.some((member) => member.user.email === user.email)) {
          snapshot.members.push({ user, role, pending: true });
          addActivity(snapshot, roomId, "invited", self.id, user.name);
        }
      }),
      setRole: (roomId, userId, role) => update(roomId, (snapshot) => {
        const member = snapshot.members.find((item) => item.user.id === userId);
        if (member && member.role !== "owner") {
          member.role = role;
          addActivity(snapshot, roomId, "role_changed", self.id, member.user.name);
        }
      }),
      remove: (roomId, userId) => update(roomId, (snapshot) => {
        snapshot.members = snapshot.members.filter((item) => item.user.id !== userId || item.role === "owner");
      }),
    },
  };
}

const AdapterContext = React.createContext<{ adapter: CollaborationAdapter; roomId: string; selfId: string } | null>(null);

export function CollaborationProvider({ adapter, roomId = "default", selfId = "tobi", children }: { adapter: CollaborationAdapter; roomId?: string; selfId?: string; children: React.ReactNode }) {
  return <AdapterContext.Provider value={{ adapter, roomId, selfId }}>{children}</AdapterContext.Provider>;
}

export function FakeCollaborationProvider({ roomId = "default", selfId = "tobi", seed, children }: { roomId?: string; selfId?: string; seed?: CollaborationSnapshot; children: React.ReactNode }) {
  const [adapter] = React.useState(() => createFakeCollaborationAdapter(seed));
  return <CollaborationProvider adapter={adapter} roomId={roomId} selfId={selfId}>{children}</CollaborationProvider>;
}

function useAdapter() {
  const value = React.useContext(AdapterContext);
  if (!value) throw new Error("Collaboration components must be inside CollaborationProvider.");
  return value;
}

export function useCollaboration() {
  const { adapter, roomId, selfId } = useAdapter();
  const snapshot = React.useSyncExternalStore(
    React.useCallback((listener) => adapter.subscribe(roomId, listener), [adapter, roomId]),
    React.useCallback(() => adapter.getSnapshot(roomId), [adapter, roomId]),
    React.useCallback(() => adapter.getSnapshot(roomId), [adapter, roomId]),
  );
  return { adapter, roomId, selfId, snapshot };
}

export function CollabAvatarStack({ users, max = 4, size = "sm" }: { users: CollabUser[]; max?: number; size?: "sm" | "md" }) {
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;
  return (
    <div className="flex items-center -space-x-2" aria-label={`${users.length} people present`}>
      {visible.map((user) => <Avatar key={user.id} name={user.name} src={user.avatarUrl} size={size} className="ring-2 ring-background" />)}
      {overflow > 0 && <span className="grid size-8 place-items-center rounded-pill border-2 border-background bg-muted text-xs font-medium text-muted-foreground" aria-label={`${overflow} more people`}>+{overflow}</span>}
    </div>
  );
}

export function PresenceBar() {
  const { snapshot, selfId } = useCollaboration();
  const track = useCollaborationTracker();
  const previousCount = React.useRef(snapshot.participants.length);
  const initialized = React.useRef(false);
  React.useEffect(() => {
    const delta = snapshot.participants.length - previousCount.current;
    if (!initialized.current) {
      track("room.joined", undefined, { participantCount: snapshot.participants.length });
      initialized.current = true;
    } else if (delta > 0) track("room.joined", undefined, { participantCount: snapshot.participants.length });
    else if (delta < 0) track("room.left", undefined, { participantCount: snapshot.participants.length });
    previousCount.current = snapshot.participants.length;
  }, [snapshot.participants.length, track]);
  const participants = snapshot.participants;
  const editing = participants.filter((item) => item.status === "editing" && item.user.id !== selfId);
  return (
    <div className="flex items-center gap-3" aria-label="Room presence">
      <CollabAvatarStack users={participants.map((item) => item.user)} />
      <p className="text-sm text-muted-foreground">
        {participants.length} here{editing.length > 0 && <span> · {editing.map((item) => item.user.name.split(" ")[0]).join(", ")} editing</span>}
      </p>
    </div>
  );
}

function relativeTime(timestamp: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function CommentsPanel({ className, showResolved = true }: { className?: string; showResolved?: boolean }) {
  const { adapter, roomId, snapshot, selfId } = useCollaboration();
  const track = useCollaborationTracker();
  const [anchor, setAnchor] = React.useState("");
  const [body, setBody] = React.useState("");
  const [replies, setReplies] = React.useState<Record<string, string>>({});
  const threads = snapshot.threads.filter((thread) => showResolved || !thread.resolved);
  const create = (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    adapter.comments.create(roomId, anchor.trim() || "General", body.trim(), selfId);
    track("comment.created", roomId, { commentLength: body.trim().length });
    setBody("");
    setAnchor("");
  };
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div><CardTitle>Comments</CardTitle><CardDescription>Notes attached to parts of this project.</CardDescription></div>
          <Badge variant="outline">{threads.filter((thread) => !thread.resolved).length} open</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        {threads.map((thread) => {
          const first = thread.comments[0];
          if (!first) return null;
          return (
            <article key={thread.id} className="grid gap-3 border-b border-border pb-5 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <Avatar name={first.user.name} src={first.user.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"><span className="font-medium">{first.user.name}</span><time className="text-xs text-muted-foreground">{relativeTime(first.createdAt)}</time></div>
                  <p className="mt-1 text-sm leading-6 text-foreground">{first.body}</p>
                  <p className="mt-2 inline-flex rounded-xs bg-muted px-2 py-1 text-xs text-muted-foreground">{thread.anchor}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { adapter.comments.react(roomId, thread.id, first.id, "👍", selfId); track("reaction.added", roomId); }} aria-label="React with thumbs up">
                      👍 {first.reactions.find((item) => item.emoji === "👍")?.users.length ?? ""}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { const resolved = !thread.resolved; adapter.comments.resolve(roomId, thread.id, resolved); track(resolved ? "thread.resolved" : "thread.reopened", roomId, { resolved }); }}>{thread.resolved ? "Reopen" : "Resolve"}</Button>
                  </div>
                </div>
                {thread.resolved && <Badge color="success">Resolved</Badge>}
              </div>
              {thread.comments.slice(1).map((comment) => <div key={comment.id} className="ml-8 flex gap-3"><Avatar name={comment.user.name} src={comment.user.avatarUrl} size="sm" /><div><p className="text-sm"><span className="font-medium">{comment.user.name}</span><time className="ml-2 text-xs text-muted-foreground">{relativeTime(comment.createdAt)}</time></p><p className="mt-1 text-sm leading-6">{comment.body}</p></div></div>)}
              {!thread.resolved && <form className="ml-8 flex gap-2" onSubmit={(event) => { event.preventDefault(); const value = replies[thread.id]?.trim(); if (!value) return; adapter.comments.reply(roomId, thread.id, value, selfId); track("comment.replied", roomId, { commentLength: value.length }); setReplies((all) => ({ ...all, [thread.id]: "" })); }}><Input aria-label={`Reply to ${first.user.name}`} placeholder="Write a reply…" value={replies[thread.id] ?? ""} onChange={(event) => setReplies((all) => ({ ...all, [thread.id]: event.target.value }))} /><Button type="submit" size="sm">Reply</Button></form>}
            </article>
          );
        })}
        <form className="grid gap-2 border-t border-border pt-4" onSubmit={create}>
          <Input aria-label="Comment anchor" placeholder="Attach to (optional)" value={anchor} onChange={(event) => setAnchor(event.target.value)} />
          <Textarea aria-label="Write a comment" placeholder="Start a conversation…" value={body} onChange={(event) => setBody(event.target.value)} rows={3} />
          <div className="flex justify-end"><Button type="submit" size="sm" disabled={!body.trim()}>Comment</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

export function HistoryPanel({ className }: { className?: string }) {
  const { adapter, roomId, snapshot } = useCollaboration();
  const track = useCollaborationTracker();
  const [selected, setSelected] = React.useState(snapshot.versions[1]?.id);
  const version = snapshot.versions.find((item) => item.id === selected);
  return (
    <Card className={className}>
      <CardHeader><CardTitle>History</CardTitle><CardDescription>Compare earlier versions and restore one.</CardDescription></CardHeader>
      <CardContent className="grid gap-3">
        {snapshot.versions.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item.id)} aria-pressed={item.id === selected} className={cn("flex items-start gap-3 rounded-control border border-border p-3 text-left transition-colors hover:bg-muted/60", item.id === selected && "border-ring bg-muted/40")}><span className="mt-1 size-2 rounded-pill bg-primary" aria-hidden /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.label}</span><span className="block text-xs text-muted-foreground">{item.author.name} · {relativeTime(item.createdAt)}</span></span></button>)}
        {version && <div className="grid gap-3 rounded-control bg-muted/50 p-3"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Compare with current</p><div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs font-medium text-muted-foreground">{version.label}</p><p className="mt-1 text-sm leading-6">{version.content}</p></div><div><p className="text-xs font-medium text-muted-foreground">Current version</p><p className="mt-1 text-sm leading-6">{snapshot.content}</p></div></div><Button className="justify-self-start" size="sm" variant="soft" onClick={() => { adapter.history.restore(roomId, version.id); track("history.restored", roomId); }}>Restore this version</Button></div>}
      </CardContent>
    </Card>
  );
}

export function SaveStatus({ className, state }: { className?: string; state?: SaveState }) {
  const { snapshot } = useCollaboration();
  const track = useCollaborationTracker();
  const label: Record<SaveState, string> = { saved: "Saved", saving: "Saving…", offline: "Offline", error: "Couldn’t save" };
  const current = state ?? snapshot.saveState;
  const previous = React.useRef(current);
  React.useEffect(() => {
    if (previous.current !== current) track("save.state_changed", undefined, { saveState: current });
    previous.current = current;
  }, [current, track]);
  const color = current === "saved" ? "success" : current === "error" ? "danger" : "warning";
  return <Badge className={className} color={color}>{label[current]}</Badge>;
}

export function ActivityPanel({ className, limit = 8 }: { className?: string; limit?: number }) {
  const { snapshot } = useCollaboration();
  const actions = { commented: "commented on", replied: "replied to", resolved: "resolved", reopened: "reopened", reacted: "reacted to", restored: "restored", invited: "invited someone to", role_changed: "changed access for" };
  return <Card className={className}><CardHeader><CardTitle>Room activity</CardTitle><CardDescription>Recent collaboration events. Comment text and private details are not shown.</CardDescription></CardHeader><CardContent><ol className="grid gap-4">{snapshot.activity.slice(0, limit).map((item) => <li key={item.id} className="flex items-start gap-3"><Avatar name={item.actor.name} src={item.actor.avatarUrl} size="sm" /><p className="min-w-0 flex-1 text-sm"><span className="font-medium">{item.actor.name}</span> {actions[item.action]} <span className="font-medium">{item.target}</span><time className="mt-1 block text-xs text-muted-foreground">{relativeTime(item.createdAt)}</time></p></li>)}{snapshot.activity.length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}</ol></CardContent></Card>;
}

export function SharePanel({ className }: { className?: string }) {
  const { adapter, roomId, snapshot } = useCollaboration();
  const track = useCollaborationTracker();
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Exclude<CollabRole, "owner">>("editor");
  const invite = (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value) return;
    const name = value.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || value;
    adapter.sharing.invite(roomId, { id: value.toLowerCase(), name, email: value }, role);
    track("member.invited", roomId, { role });
    setEmail("");
  };
  return (
    <Card className={className}>
      <CardHeader><CardTitle>Share</CardTitle><CardDescription>Invite people and choose what they can do.</CardDescription></CardHeader>
      <CardContent className="grid gap-4">
        <form className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]" onSubmit={invite}><Input type="email" aria-label="Email address" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><Select value={role} onValueChange={(value) => setRole(value as typeof role)}><SelectTrigger aria-label="Invite role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="editor">Editor</SelectItem><SelectItem value="commenter">Commenter</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent></Select><Button type="submit" size="sm">Invite</Button></form>
          <ul className="grid gap-3">{snapshot.members.map((member) => <MemberRow key={member.user.id} member={member} adapter={adapter} roomId={roomId} />)}</ul>
      </CardContent>
    </Card>
  );
}

function MemberRow({ member, adapter, roomId }: { member: CollabMember; adapter: CollaborationAdapter; roomId: string }) {
  const track = useCollaborationTracker();
  return <li className="flex items-center gap-3"><Avatar name={member.user.name} src={member.user.avatarUrl} size="sm" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{member.user.name}{member.pending ? <span className="ml-2 text-xs text-muted-foreground">Invited</span> : null}</span><span className="block truncate text-xs text-muted-foreground">{member.user.email}</span></span>{member.role === "owner" ? <Badge variant="outline">Owner</Badge> : <Select value={member.role} onValueChange={(role) => { const nextRole = role as Exclude<CollabRole, "owner">; adapter.sharing.setRole(roomId, member.user.id, nextRole); track("member.role_changed", roomId, { role: nextRole }); }}><SelectTrigger aria-label={`Role for ${member.user.name}`} className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="editor">Editor</SelectItem><SelectItem value="commenter">Commenter</SelectItem><SelectItem value="viewer">Viewer</SelectItem></SelectContent></Select>}</li>;
}

export function CollaborationShowcase() {
  return <FakeCollaborationProvider><div className="grid gap-5"><div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-card p-4"><div><p className="font-medium">Launch workspace</p><p className="text-sm text-muted-foreground">Shared with your team</p></div><div className="flex items-center gap-3"><PresenceBar /><SaveStatus /></div></div><div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)]"><CommentsPanel /><div className="grid gap-5"><SharePanel /><HistoryPanel /><ActivityPanel /></div></div></div></FakeCollaborationProvider>;
}
