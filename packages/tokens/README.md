# @junco/tokens

Every Junco design value: colors for light and dark, type scale, spacing, radius, shadows, z-index and motion. Names follow shadcn/ui (`--background`, `--primary`, `--muted-foreground`, ...) so shadcn components and themes work unchanged. Part of the [Junco design system](https://junco.madebytobi.com).

```bash
npm i @junco/tokens
```

```css
@import "@junco/tokens/tokens.css"; /* light on :root, dark on .dark / [data-theme="dark"] */
```

```ts
import { tokens, contrastRatio } from "@junco/tokens";

tokens.light.primary;   // "oklch(0.21 0.006 260)"
tokens.dark.primary;    // "oklch(0.95 0.004 260)"
contrastRatio(tokens.light["primary-foreground"], tokens.light.primary); // 4.87
```

Also ships `@junco/tokens/tokens.json` in the W3C Design Tokens format (dark values under `$extensions["dev.junco"].modes.dark`) for Figma and other tools.

Every text/background pair is tested for 4.5:1 contrast and every control outline for 3:1, in both modes.

[Theming docs](https://junco.madebytobi.com/docs/theming) · [GitHub](https://github.com/tobibytes/junco) · MIT
