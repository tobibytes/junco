# Tokens and theming

## Where tokens live

`packages/tokens/src/tokens.css`: light on `:root`, dark on `.dark` and `[data-theme="dark"]`. Every color token must exist in both; a test enforces it.

## Contrast

`packages/tokens/src/pairs.ts` lists every text/background pair (must hit 4.5:1) and every control-part pair (checkbox and radio outlines, switch tracks, focus rings: must hit 3:1). The test computes WCAG contrast from the oklch values directly. When a component puts a text token on a new background, add the pair.

Status colors come in two flavors:

| Use | Tokens |
| --- | --- |
| Solid fill with text on it (badges, toasts) | `--success` + `--success-foreground` |
| Colored text on the page (field errors, deltas) | `--success-text`, `--warning-text`, `--destructive-text` |

## Re-theming

Change `--primary` (and `--ring`) for both modes. The docs site's theme page shows contrast pass or fail live as you pick an accent.

## Dark mode

`ThemeProvider` sets `.dark`, `data-theme`, `data-motion` and `color-scheme` on `<html>`, remembers the choice, and follows the OS in `system` mode. For server-rendered apps, put `themeScript()` in `<head>` so there's no flash.

## Motion

Every duration is multiplied by `--motion-scale`: `1` full, `0.6` subtle, `0` off. `data-motion="off|subtle|full"` sets it, and `prefers-reduced-motion: reduce` forces `0`. Loading spinners keep turning (slower) because they carry meaning; skeleton pulses go still.
