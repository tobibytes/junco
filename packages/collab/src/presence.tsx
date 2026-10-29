import { Avatar, Badge, cn, Tooltip } from "@junco/react";
import * as React from "react";
import { samplePeers, sampleSelf } from "./fake";
import { useCollabAdapter, useCollabState } from "./provider";
import type { CollabUser, ConnectionStatus as Status, Cursor, Peer } from "./types";

/** One entry per person: someone in two tabs shows once. */
function uniqueUsers(users: CollabUser[]): CollabUser[] {
  const seen = new Set<string>();
  return users.filter((u) => !seen.has(u.id) && seen.add(u.id));
}

/** A ring in the person's color, drawn around their avatar. */
const ring = (color?: string): React.CSSProperties => ({ boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${color ?? "var(--border)"}` });

export interface AvatarStackProps {
  /** Who to show. Default: you and everyone in the room (from `CollabProvider`), or sample people. */
  users?: CollabUser[];
  /** Your id, to label your avatar "(you)". */
  selfId?: string;
  /** Avatars before the rest collapse into "+N". Default 4. */
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

/** Overlapping avatars of who's here, each ringed in their color, with names on hover. */
export function AvatarStack({ users, selfId, max = 4, size = "sm", className }: AvatarStackProps) {
  const state = useCollabState();
  const self = state ? state.self : sampleSelf;
  const list = uniqueUsers(users ?? [...(self ? [self] : []), ...(state?.peers ?? samplePeers).map((p) => p.user)]);
  const me = selfId ?? self?.id;
  const shown = list.slice(0, max);
  const rest = list.length - shown.length;
  return (
    <div className={cn("flex items-center", className)}>
      <ul className="flex items-center -space-x-1.5" aria-label={list.length === 1 ? "1 person here" : `${list.length} people here`}>
        {shown.map((u) => {
          const label = u.id === me ? `${u.name} (you)` : u.name;
          return (
            <li key={u.id} className="animate-pop-in rounded-pill" style={ring(u.color)}>
              <Tooltip content={label}>
                <span className="block rounded-pill" tabIndex={0} aria-label={label}>
                  <Avatar name={u.name} src={u.avatar} size={size} />
                </span>
              </Tooltip>
            </li>
          );
        })}
      </ul>
      {rest > 0 && (
        <Badge variant="outline" className="ml-2" aria-label={`and ${rest} more`}>
          +{rest}
        </Badge>
      )}
    </div>
  );
}

export interface LiveCursorsProps {
  /** People and their pointers. Default: the room's peers (from `CollabProvider`), or sample people. */
  peers?: Peer[];
  className?: string;
}

/**
 * Other people's pointers with name tags, over a `relative` parent. Positions are fractions of that
 * parent, so they line up at any size. Cursors glide between updates (motion tokens, off with the motion switch).
 */
export function LiveCursors({ peers, className }: LiveCursorsProps) {
  const state = useCollabState();
  const list = peers ?? state?.peers ?? samplePeers;
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {list.map((p) =>
        p.cursor ? (
          <div
            key={p.id}
            className="absolute flex items-start"
            style={{
              left: `${p.cursor.x * 100}%`,
              top: `${p.cursor.y * 100}%`,
              transition: "left calc(var(--duration-base) * var(--motion-scale)) var(--ease-standard), top calc(var(--duration-base) * var(--motion-scale)) var(--ease-standard)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden style={{ color: p.user.color ?? "var(--foreground)" }}>
              <path d="M1 1l5.5 14 2-5.8L14.5 7z" fill="currentColor" stroke="var(--background)" strokeWidth="1" />
            </svg>
            {/* Neutral tag with a colored edge: text contrast holds for any user color. */}
            <span
              className="mt-3 -ml-1 rounded-pill border-2 bg-popover px-2 py-0.5 text-xs font-medium whitespace-nowrap text-popover-foreground shadow-float"
              style={{ borderColor: p.user.color ?? "var(--border)" }}
            >
              {p.user.name}
            </span>
          </div>
        ) : null,
      )}
    </div>
  );
}

export interface CursorSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shows other people's cursors on top. Default true. */
  showCursors?: boolean;
}

/**
 * A `relative` area that shares your pointer with the room (through `CollabProvider`) and shows
 * everyone else's. Updates are throttled to about 25 per second and cleared when you leave the area.
 */
export function CursorSurface({ showCursors = true, className, children, onPointerMove, onPointerLeave, ...props }: CursorSurfaceProps) {
  const adapter = useCollabAdapter();
  const last = React.useRef(0);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (!adapter) return;
    const t = performance.now();
    if (t - last.current < 40) return;
    last.current = t;
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cursor: Cursor = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    adapter.updatePresence({ cursor });
  };
  const leave = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    adapter?.updatePresence({ cursor: null });
  };
  return (
    <div className={cn("relative", className)} onPointerMove={move} onPointerLeave={leave} {...props}>
      {children}
      {showCursors && <LiveCursors />}
    </div>
  );
}

export interface EditingBarProps {
  /** Default: the room's peers (from `CollabProvider`), or sample people. */
  peers?: Peer[];
  /** Only count people editing this (a peer's `editing` value). Default: anyone editing anything. */
  target?: string;
  /** Names for targets, to say what people are editing: `{ intro: "Introduction" }`. */
  labels?: Record<string, string>;
  className?: string;
}

function names(list: string[]): string {
  if (list.length <= 2) return list.join(" and ");
  return `${list.slice(0, 2).join(", ")} and ${list.length - 2} more`;
}

/** "Ada and Bo are editing", with their avatars. Renders nothing when nobody is. */
export function EditingBar({ peers, target, labels, className }: EditingBarProps) {
  const state = useCollabState();
  const list = (peers ?? state?.peers ?? samplePeers).filter((p) => (target === undefined ? !!p.editing : p.editing === target));
  const users = uniqueUsers(list.map((p) => p.user));
  if (users.length === 0) return null;
  const where = target === undefined && list.length > 0 ? [...new Set(list.map((p) => labels?.[p.editing!] ?? null).filter(Boolean))] : [];
  return (
    <output aria-live="polite" className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <AvatarStack users={users} size="xs" max={3} />
      <span>
        <span className="font-medium text-foreground">{names(users.map((u) => u.name.split(" ")[0] ?? u.name))}</span>{" "}
        {users.length === 1 ? "is" : "are"} editing{where.length === 1 ? ` ${where[0]}` : ""}
      </span>
    </output>
  );
}

const STATUS: Record<Status, { label: string; color: "success" | "neutral" | "warning" | "danger"; detail?: string }> = {
  connected: { label: "Live", color: "success" },
  connecting: { label: "Connecting", color: "neutral" },
  reconnecting: { label: "Reconnecting", color: "warning", detail: "Your changes are kept and sync when you're back." },
  offline: { label: "Offline", color: "danger", detail: "Your changes are kept and sync when you're back." },
};

export interface ConnectionStatusProps {
  /** Default: from `CollabProvider`, or "connected". */
  status?: Status;
  /** Also says what happens to edits while offline. Default false. */
  showDetail?: boolean;
  className?: string;
}

/** Live, connecting, reconnecting or offline, as a badge with a dot and a word (never color alone). */
export function ConnectionStatus({ status, showDetail = false, className }: ConnectionStatusProps) {
  const state = useCollabState();
  const s = STATUS[status ?? state?.status ?? "connected"];
  return (
    <span role="status" className={cn("inline-flex items-center gap-2", className)}>
      <Badge variant="outline" color={s.color} hasDot>
        {s.label}
      </Badge>
      {showDetail && s.detail && <span className="text-xs text-muted-foreground">{s.detail}</span>}
    </span>
  );
}
