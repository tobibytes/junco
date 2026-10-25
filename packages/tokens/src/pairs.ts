/**
 * Every text/background pair Junco uses. Each must hit 4.5:1 in light and dark.
 * Add a pair here whenever a component puts a text token on a new background.
 */
export const textPairs: ReadonlyArray<readonly [text: string, background: string]> = [
  ["foreground", "background"],
  ["foreground", "surface"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["muted-foreground", "background"],
  ["muted-foreground", "surface"],
  ["muted-foreground", "muted"],
  ["primary-foreground", "primary"],
  ["primary", "background"],
  ["primary", "surface"],
  ["success-foreground", "success"],
  ["warning-foreground", "warning"],
  ["destructive-foreground", "destructive"],
  ["success-text", "background"],
  ["success-text", "surface"],
  ["warning-text", "background"],
  ["warning-text", "surface"],
  ["destructive-text", "background"],
  ["destructive-text", "surface"],
];

/** WCAG AA for body text. */
export const MIN_TEXT_CONTRAST = 4.5;
