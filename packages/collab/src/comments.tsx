import {
  Avatar,
  Badge,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  EmptyState,
  Textarea,
} from "@junco/react";
import * as React from "react";
import { sampleSelf, sampleThreads, sampleUsers } from "./fake";
import { AtSignIcon, CheckIcon, MessageIcon, RotateCcwIcon } from "./icons";
import { useCollabAdapter, useCollabState } from "./provider";
import type { CollabComment, CollabThread, CollabUser, CommentInput } from "./types";

/** A short date and time. Rendered on the server and again in the browser, so the text may differ. */
export function When({ at, className }: { at: number; className?: string }) {
  const text = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(at);
  return (
    <time dateTime={new Date(at).toISOString()} className={className} suppressHydrationWarning>
      {text}
    </time>
  );
}

/** Comment text with `@Name` mentions of these people highlighted. */
function Body({ comment, people }: { comment: CollabComment; people: CollabUser[] }) {
  if (comment.deleted) return <p className="text-sm text-muted-foreground italic">Deleted</p>;
  const mentioned = people.filter((p) => comment.mentions?.includes(p.id)).map((p) => `@${p.name}`);
  if (mentioned.length === 0) return <p className="text-sm whitespace-pre-wrap">{comment.body}</p>;
  const pattern = new RegExp(`(${mentioned.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <p className="text-sm whitespace-pre-wrap">
      {comment.body.split(pattern).map((part, i) =>
        mentioned.includes(part) ? (
          <span key={i} className="font-medium text-primary">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export interface CommentComposerProps {
  /** People who can be mentioned. */
  people?: CollabUser[];
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (input: CommentInput) => unknown;
  className?: string;
  autoFocus?: boolean;
}

/** A comment box with an @mention picker. ⌘/Ctrl+Enter posts. */
export function CommentComposer({ people = [], placeholder = "Write a comment", submitLabel = "Post", onSubmit, className, autoFocus }: CommentComposerProps) {
  const [text, setText] = React.useState("");
  const [mentions, setMentions] = React.useState<CollabUser[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const id = React.useId();
  const send = async () => {
    if (busy || (!text.trim() && mentions.length === 0)) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ text, mentions });
      setText("");
      setMentions([]);
    } catch (e) {
      setError((e as Error).message || "Couldn't post that");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={cn("grid gap-2", className)}>
      {mentions.length > 0 && (
        <ul className="flex flex-wrap gap-1" aria-label="Mentioned">
          {mentions.map((m) => (
            <li key={m.id}>
              <Badge variant="outline" color="primary">
                @{m.name}
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <Textarea
        aria-label={placeholder}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder={placeholder}
        value={text}
        rows={2}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            void send();
          }
        }}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive-text">
          {error}
        </p>
      )}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={people.length === 0}>
              <AtSignIcon className="size-4" /> Mention
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>People here</DropdownMenuLabel>
            {people.map((p) => (
              <DropdownMenuItem key={p.id} onSelect={() => setMentions((m) => (m.some((x) => x.id === p.id) ? m : [...m, p]))}>
                <Avatar name={p.name} src={p.avatar} size="xs" />
                {p.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" className="ml-auto" isLoading={busy} onClick={send}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export interface CommentThreadProps {
  thread: CollabThread;
  /** Your id: marks your reactions. */
  selfId?: string;
  /** People who can be mentioned in replies; also used to highlight mentions. */
  people?: CollabUser[];
  /** Reactions offered on each comment. Default 👍 and 🎉. */
  reactions?: string[];
  onReply?: (input: CommentInput) => unknown;
  onReact?: (commentId: string, emoji: string, add: boolean) => unknown;
  onResolve?: (resolved: boolean) => unknown;
  className?: string;
  classNames?: { root?: string; comment?: string; composer?: string };
}

/** A thread: its comments with reactions, a reply box, and resolve or reopen. */
export function CommentThread({
  thread,
  selfId,
  people = [],
  reactions = ["👍", "🎉"],
  onReply,
  onReact,
  onResolve,
  className,
  classNames,
}: CommentThreadProps) {
  const known = [...people, ...thread.comments.map((c) => c.author)];
  return (
    <article className={cn("grid animate-rise gap-3 rounded-card border border-border bg-surface p-3", className, classNames?.root)} aria-label={`Thread by ${thread.comments[0]?.author.name ?? "someone"}`}>
      {thread.resolved && (
        <Badge variant="outline" color="success" hasDot className="w-fit">
          Resolved
        </Badge>
      )}
      {thread.comments.map((c) => (
        <div key={c.id} className={cn("grid gap-1.5", classNames?.comment)}>
          <div className="flex items-center gap-2">
            <Avatar name={c.author.name} src={c.author.avatar} size="xs" />
            <span className="text-sm font-medium">{c.author.name}</span>
            <When at={c.createdAt} className="text-xs text-muted-foreground" />
          </div>
          <Body comment={c} people={known} />
          {onReact && !c.deleted && (
            <div className="flex gap-1">
              {reactions.map((r) => {
                const who = c.reactions?.[r] ?? [];
                const mine = selfId !== undefined && who.includes(selfId);
                return (
                  <Button
                    key={r}
                    size="sm"
                    variant={mine ? "soft" : "ghost"}
                    aria-pressed={mine}
                    aria-label={`${r} ${who.length}`}
                    onClick={() => onReact(c.id, r, !mine)}
                  >
                    {r}
                    {who.length > 0 && <span className="tabular-nums">{who.length}</span>}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      {onReply && !thread.resolved && <CommentComposer className={classNames?.composer} people={people} placeholder="Reply" submitLabel="Reply" onSubmit={onReply} />}
      {onResolve && (
        <Button size="sm" variant="ghost" className="w-fit" onClick={() => onResolve(!thread.resolved)}>
          {thread.resolved ? <RotateCcwIcon className="size-4" /> : <CheckIcon className="size-4" />}
          {thread.resolved ? "Reopen" : "Resolve"}
        </Button>
      )}
    </article>
  );
}

export interface CommentsPanelProps {
  /** Default: the room's threads (from `CollabProvider`), or sample threads. */
  threads?: CollabThread[];
  /** Only threads on this anchor, and new threads go on it. Default: every thread, new ones document-wide. */
  anchor?: string;
  /** People to mention. Default: everyone in the room, or sample people. */
  people?: CollabUser[];
  selfId?: string;
  /** Hide resolved threads. Default false. */
  hideResolved?: boolean;
  onCreate?: (input: CommentInput & { anchor?: string }) => unknown;
  onReply?: (threadId: string, input: CommentInput) => unknown;
  onReact?: (threadId: string, commentId: string, emoji: string, add: boolean) => unknown;
  onResolve?: (threadId: string, resolved: boolean) => unknown;
  className?: string;
  classNames?: { root?: string; list?: string; thread?: string; composer?: string };
}

/**
 * Threads plus a box to start one: the body of a comments sidebar. Put it in a Sheet or a side
 * column. Under `CollabProvider` it reads and writes the room unless you pass data and handlers.
 */
export function CommentsPanel(props: CommentsPanelProps) {
  const state = useCollabState();
  const adapter = useCollabAdapter();
  const { anchor, hideResolved = false, className, classNames } = props;
  const all = props.threads ?? state?.threads ?? sampleThreads;
  const threads = all.filter((t) => (anchor === undefined || t.anchor === anchor) && !(hideResolved && t.resolved));
  const selfId = props.selfId ?? state?.self?.id ?? (state ? undefined : sampleSelf.id);
  const people =
    props.people ??
    (state ? [...new Map(state.peers.map((p) => [p.user.id, p.user])).values()].filter((u) => u.id !== selfId) : sampleUsers);
  const onCreate = props.onCreate ?? adapter?.createThread;
  const onReply = props.onReply ?? adapter?.reply;
  const onReact = props.onReact ?? adapter?.react;
  const onResolve = props.onResolve ?? adapter?.resolve;

  return (
    <div className={cn("grid content-start gap-4", className, classNames?.root)}>
      {threads.length === 0 ? (
        <EmptyState
          icon={<MessageIcon className="size-5" />}
          title="No comments yet"
          description="Start a thread. Mention someone and it lands in their inbox."
        />
      ) : (
        <ul className={cn("grid gap-3", classNames?.list)}>
          {threads.map((t) => (
            <li key={t.id}>
              <CommentThread
                thread={t}
                selfId={selfId}
                people={people}
                className={classNames?.thread}
                onReply={onReply ? (input) => onReply(t.id, input) : undefined}
                onReact={onReact ? (commentId, emoji, add) => onReact(t.id, commentId, emoji, add) : undefined}
                onResolve={onResolve ? (resolved) => onResolve(t.id, resolved) : undefined}
              />
            </li>
          ))}
        </ul>
      )}
      {onCreate && (
        <section aria-label="New thread" className="grid gap-2 border-t border-border pt-4">
          <h3 className="text-sm font-medium">New thread</h3>
          <CommentComposer className={classNames?.composer} people={people} onSubmit={(input) => onCreate({ ...input, anchor })} />
        </section>
      )}
    </div>
  );
}
