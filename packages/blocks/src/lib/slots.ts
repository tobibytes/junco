import * as React from "react";

/**
 * The page system. Every page and block takes:
 * - typed data props, falling back to realistic fake data when omitted
 * - `variant` for layout options
 * - `slots` to replace any named region with your own component, or hide it with `null`
 *
 *   <DashboardPage slots={{ header: MyHeader, activity: null }} />
 */
export type Slots<Props extends Record<string, object>> = {
  [K in keyof Props]?: React.ComponentType<Props[K]> | null;
};

/**
 * Renders slot `key`: the override if one was passed, nothing for `null`, else `Default`.
 * Overrides get the same props the default would have got.
 */
export function renderSlot<Props extends Record<string, object>, K extends keyof Props>(
  slots: Slots<Props> | undefined,
  key: K,
  Default: React.ComponentType<Props[K]>,
  props: Props[K],
): React.ReactNode {
  const override = slots?.[key];
  if (override === null) return null;
  const Component = override ?? Default;
  return React.createElement(Component as React.ComponentType<object>, props);
}

/** True when a slot is hidden, for layouts that need to drop a column or gap. */
export function isSlotHidden<Props extends Record<string, object>>(slots: Slots<Props> | undefined, key: keyof Props) {
  return slots?.[key] === null;
}
