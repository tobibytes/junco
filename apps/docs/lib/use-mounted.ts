"use client";

import * as React from "react";

const subscribe = () => () => {};

/**
 * False during SSR and the hydration render, true after. junco's ThemeProvider reads
 * localStorage while rendering, so anything that shows theme state must wait for this,
 * or the first client render won't match the server HTML.
 */
export function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
