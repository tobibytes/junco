import * as React from "react";
import { flushSync } from "react-dom";
import { readMotionScale } from "./lib/use-motion-scale";

type Update = () => void | Promise<void>;

interface DocumentWithVT {
  startViewTransition?: (update: Update) => { finished: Promise<void> };
}

/**
 * Runs `update` (a DOM or state change) inside a View Transition, so the page cross-fades
 * instead of snapping. Falls back to just running it where the API is missing or motion is off.
 * The transition's timing comes from motion.css and follows the motion switch.
 *
 *   startViewTransition(() => navigate("/pricing"))
 */
export async function startViewTransition(update: Update): Promise<void> {
  const doc = typeof document === "undefined" ? undefined : (document as unknown as DocumentWithVT);
  if (!doc?.startViewTransition || readMotionScale() === 0) {
    await update();
    return;
  }
  await doc.startViewTransition(update).finished.catch(() => {});
}

/**
 * React flavor: wraps a state update so React commits it synchronously inside the transition.
 *
 *   const transition = useViewTransition();
 *   <TabsTrigger onClick={() => transition(() => setTab("b"))} />
 */
export function useViewTransition() {
  return React.useCallback((update: () => void) => startViewTransition(() => flushSync(update)), []);
}
