# @junco/cli

## 0.4.0

### Minor Changes

- 49ddfa1: Remove `junco add page --source`, which shipped in 0.3.0 before it was ready. `junco add page <name> [--variant <v>]` is unchanged; copying a page's full source will come back as part of the registry.

## 0.3.0

### Minor Changes

- ce0f00f: `junco add page <name> [--variant <v>]` adds a full page from `@junco/blocks` (dashboard, sign-up, settings-billing and the rest) with the layout variant you pick. It installs `@junco/blocks` and `@junco/react` and adds the `@source` lines Tailwind needs. `junco list` now shows pages and their variants.
- 58cd26f: Add `junco add page --source` to copy Junco page and block source into a project.

## 0.2.0

### Minor Changes

- 7fb892b: `junco create my-app --template saas` (or `admin`) starts a whole app from a Junco template: a Vite + React Router app built from Junco pages, with routes, fake auth and realistic data, then installs it with the package manager you ran. `junco create --list` shows the templates.

## 0.1.1

### Patch Changes

- 888d2d8: Published from GitHub Actions with npm Trusted Publishing, so every version now carries a provenance statement linking it to the commit and workflow that built it.

## 0.1.0

### Minor Changes

- 92b848d: First public release: tokens, Tailwind theme and semantic classes, React components (primitives, overlays, data table, forms), the `junco` CLI and registry, the MCP server, blocks and pages (app and marketing), motion effects, and 3D scenes.
