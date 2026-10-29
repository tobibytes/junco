import * as React from "react";
import type { CollabAdapter, CollabState } from "./types";

const AdapterContext = React.createContext<CollabAdapter | null>(null);

/** Connects every collaboration component below it to one backend, through its adapter. */
export function CollabProvider({ adapter, children }: { adapter: CollabAdapter; children?: React.ReactNode }) {
  return <AdapterContext.Provider value={adapter}>{children}</AdapterContext.Provider>;
}

/** The adapter from the nearest {@link CollabProvider}, or null outside one. */
export function useCollabAdapter(): CollabAdapter | null {
  return React.useContext(AdapterContext);
}

/** The live state from the nearest {@link CollabProvider}, or null outside one. */
export function useCollabState(): CollabState | null {
  const adapter = useCollabAdapter();
  const subscribe = React.useCallback((listener: () => void) => (adapter ? adapter.subscribe(listener) : () => {}), [adapter]);
  const get = React.useCallback(() => (adapter ? adapter.getState() : null), [adapter]);
  return React.useSyncExternalStore(subscribe, get, get);
}
