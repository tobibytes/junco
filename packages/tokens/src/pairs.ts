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
  ["muted-foreground", "card"],
  ["muted-foreground", "popover"],
  ["muted-foreground", "accent"], // secondary text in a selected table row
  ["success-text", "card"], // Stat deltas inside cards
  ["destructive-text", "card"],
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
  ["success-text", "popover"],
  ["warning-text", "popover"],
  ["destructive-text", "popover"],
  ["primary", "popover"],
];

/** WCAG AA for body text. */
export const MIN_TEXT_CONTRAST = 4.5;

/**
 * Parts of controls that carry no text but must be seen to be used (checkbox and radio
 * outlines, switch tracks). WCAG 1.4.11 asks for 3:1 against what they sit on.
 */
export const controlPairs: ReadonlyArray<readonly [part: string, background: string]> = [
  ["border-strong", "surface"],
  ["border-strong", "background"],
  ["border-strong", "card"],
  ["border-strong", "popover"],
  ["ring", "background"],
  ["ring", "surface"],
];

/** WCAG AA for UI components and graphics. */
export const MIN_CONTROL_CONTRAST = 3;
