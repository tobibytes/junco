# @junco/tailwind

## 0.4.1

### Patch Changes

- d9cb0bb: Interface details pass, following Vercel's Web Interface Guidelines and Anthropic's frontend-design skill.

  - Tokens set `color-scheme` (light and dark), so native scrollbars, date pickers and form controls follow the theme.
  - Inputs, textareas, the command palette search and the `.input`/`.textarea`/`.select` classes are 16px on phones, so iOS Safari no longer zooms in on focus. Wider screens keep the design size.
  - Base styles: no grey tap flash, `touch-action: manipulation` on controls (no double-tap zoom wait), balanced headings and pretty paragraphs.
  - Dialog, Sheet and Command lists keep scrolling inside (`overscroll-contain`) instead of scrolling the page behind.
  - Collab `AvatarStack`: the color ring is drawn inside each avatar, so overlapping avatars no longer hide each other's initials.
  - Editor: the toolbar no longer stretches when the editor has a min height.
  - Blocks `Hero` and `CtaSection`: no arrow icons on the buttons.

- Updated dependencies [d9cb0bb]
  - @junco/tokens@0.4.1

## 0.4.0

### Minor Changes

- 91ea769: New components: `Progress` (determinate and indeterminate), `Slider` (one value or a range, Radix-based, works in a `Field`) and `Alert` (with `AlertTitle`, `AlertDescription`, icon and action slots). Semantic classes `.progress`, `.range` and `.alert` to match.

## 0.3.1

### Patch Changes

- c452ffa: The default accent is now ink: `--primary` is near-black in light mode and near-white in dark, with a lighter `--ring` so focus shows around primary buttons. Brand an app by overriding `--primary` (the theme builder at /docs/theming gives you an accessible pair). Charts keep their colors.
- Updated dependencies [c452ffa]
  - @junco/tokens@0.4.0

## 0.3.0

### Minor Changes

- e131255: Menus, selects and popovers now open above dialogs and sheets. A new `--z-popover` layer (and `z-popover` utility) sits between `--z-overlay` and `--z-toast`; DropdownMenu, Select and Popover use it instead of `z-dropdown`, which stays for in-page floating bits.

### Patch Changes

- Updated dependencies [e131255]
  - @junco/tokens@0.3.0

## 0.2.1

### Patch Changes

- 888d2d8: Published from GitHub Actions with npm Trusted Publishing, so every version now carries a provenance statement linking it to the commit and workflow that built it.
- Updated dependencies [888d2d8]
  - @junco/tokens@0.2.1

## 0.2.0

### Minor Changes

- ddf1ab3: Add `Icon`: renders any SVG icon (Lucide, Heroicons, your own) at a type-scale size with one stroke weight from the new `--icon-stroke` token. Decorative by default, `label` makes it an image. `.icon` semantic classes for plain HTML. `Button size="icon"` now warns in development when it has no accessible name.

### Patch Changes

- Updated dependencies [ddf1ab3]
  - @junco/tokens@0.2.0

## 0.1.0

### Minor Changes

- 92b848d: First public release: tokens, Tailwind theme and semantic classes, React components (primitives, overlays, data table, forms), the `junco` CLI and registry, the MCP server, blocks and pages (app and marketing), motion effects, and 3D scenes.
- b336fd2: Phase 1 foundations: full token set (type scale, spacing, z-index, overlay shadow, status text colors) exported as CSS, a TS object and W3C JSON, with a contrast test; Tailwind mapping for every token plus `spinner`, `skeleton`, badge and input variants; Input, Badge, Kbd, Spinner, Skeleton and ThemeProvider in `junco`.

### Patch Changes

- Updated dependencies [92b848d]
- Updated dependencies [b336fd2]
  - @junco/tokens@0.1.0
