import * as React from "react";

/** Privacy-safe events for connecting Junco collaboration actions to product analytics. */
export type CollaborationEventName =
  | "room.joined"
  | "room.left"
  | "comment.created"
  | "comment.replied"
  | "thread.resolved"
  | "thread.reopened"
  | "reaction.added"
  | "history.restored"
  | "member.invited"
  | "member.role_changed"
  | "member.removed"
  | "save.state_changed";

/** Deliberately excludes message text, email addresses, display names, and document content. */
export interface CollaborationEvent {
  name: CollaborationEventName;
  roomId?: string;
  timestamp: number;
  properties?: {
    participantCount?: number;
    commentLength?: number;
    resolved?: boolean;
    role?: "editor" | "commenter" | "viewer";
    saveState?: "saved" | "saving" | "offline" | "error";
  };
}

type AnalyticsContextValue = { onTrack: (event: CollaborationEvent) => void; roomId?: string };
const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(null);

export function CollaborationAnalyticsProvider({ onTrack, roomId, children }: { onTrack: (event: CollaborationEvent) => void; roomId?: string; children: React.ReactNode }) {
  const callback = React.useRef(onTrack);
  React.useEffect(() => { callback.current = onTrack; }, [onTrack]);
  const value = React.useMemo<AnalyticsContextValue>(() => ({ onTrack: (event) => callback.current(event), roomId }), [roomId]);
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

/** Returns an optional event sink; call it only for actions the app wants to measure. */
export function useCollaborationTracker() {
  const context = React.useContext(AnalyticsContext);
  return React.useCallback((name: CollaborationEventName, roomId?: string, properties?: CollaborationEvent["properties"]) => {
    context?.onTrack({ name, roomId: roomId ?? context.roomId, timestamp: Date.now(), ...(properties ? { properties } : {}) });
  }, [context]);
}
