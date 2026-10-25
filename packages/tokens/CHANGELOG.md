# @junco/tokens

## 0.2.1

### Patch Changes

- 888d2d8: Published from GitHub Actions with npm Trusted Publishing, so every version now carries a provenance statement linking it to the commit and workflow that built it.

## 0.2.0

### Minor Changes

- ddf1ab3: Add `Icon`: renders any SVG icon (Lucide, Heroicons, your own) at a type-scale size with one stroke weight from the new `--icon-stroke` token. Decorative by default, `label` makes it an image. `.icon` semantic classes for plain HTML. `Button size="icon"` now warns in development when it has no accessible name.

## 0.1.0

### Minor Changes

- 92b848d: First public release: tokens, Tailwind theme and semantic classes, React components (primitives, overlays, data table, forms), the `junco` CLI and registry, the MCP server, blocks and pages (app and marketing), motion effects, and 3D scenes.
- b336fd2: Phase 1 foundations: full token set (type scale, spacing, z-index, overlay shadow, status text colors) exported as CSS, a TS object and W3C JSON, with a contrast test; Tailwind mapping for every token plus `spinner`, `skeleton`, badge and input variants; Input, Badge, Kbd, Spinner, Skeleton and ThemeProvider in `junco`.
