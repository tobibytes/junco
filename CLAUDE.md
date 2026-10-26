# Junco

Junco is a free, open source (MIT) design system and UI library for React + Tailwind v4. It has tokens, components, blocks, full pages, app templates, motion and 3D, and you can use it at four levels:

1. **Semantic classes** like daisyUI: `class="btn btn-primary"`. Pure CSS, no JS, works in any framework or plain HTML.
2. **Utilities** like Tailwind: `bg-surface text-muted rounded-card`.
3. **Copy-in components** like shadcn/ui: `npx @junco/cli add dialog` copies the source into the user's repo. It can still be updated with `junco diff` / `junco update`.
4. **Installed components** like HeroUI/NextUI: `npm i @junco/react`, then `import { Button } from "@junco/react"`.

All four levels read the same tokens, so they mix in one app.

The full product plan is in `docs/PLAN.md`. The phase checklists are in `docs/ROADMAP.md`. Open questions are in `docs/DECISIONS.md`. Read all three before starting work.

## Stack

- pnpm workspaces + Turborepo
- TypeScript (strict), React 19
- Tailwind CSS v4 (CSS-first config, `@theme`, `@plugin`, `@utility`)
- Tailwind Variants (`tailwind-variants`) for component variants; `tailwind-merge` + `clsx` behind a `cn()` helper
- Radix primitives for behavior (dialogs, menus, tabs, popovers). Keep behavior behind thin wrappers so a switch to Base UI stays possible (see DECISIONS.md)
- tsup to build packages, Changesets for versions and publishing
- Vitest + Testing Library for unit tests, Playwright for visual and accessibility checks (axe)
- Docs site: Next.js (App Router) in `apps/docs`, deployed on Cloudflare

## Repo layout

| Path | Package | Purpose |
| --- | --- | --- |
| `packages/tokens` | `@junco/tokens` | every design value as CSS variables, light and dark |
| `packages/tailwind` | `@junco/tailwind` | Tailwind v4 theme mapping + semantic classes (`btn`, `card`, ...) + motion utilities |
| `packages/react` | `@junco/react` | installed React components |
| `packages/cli` | `@junco/cli` (bin: `junco`) | `junco add`, `junco diff`, `junco update`, `junco eject`, `junco create` |
| `packages/three` | `@junco/three` | 3D scenes on React Three Fiber + drei, lazy loaded |
| `packages/blocks` | `@junco/blocks` | blocks and full pages (app shell, dashboards, settings, auth, marketing) |
| `packages/motion` | `@junco/motion` | motion effects (reveal, ticker, marquee, beams, view transitions) |
| `packages/mcp` | `@junco/mcp` | MCP server for AI agents, reads the public registry |
| `packages/swift` + root `Package.swift` | SwiftPM `JuncoTokens`, `JuncoUI` | generated Swift tokens + SwiftUI styles (preview) |
| `packages/collab` (later) | `@junco/collab` | collaboration UI (cursors, presence, comments, history, sharing) + adapter interfaces. No sync engine in this repo |
| `packages/editor` (later) | `@junco/editor` | TipTap rich text editor block |
| `registry` | served by the docs site | component, block and page source files for copy-in, shadcn registry JSON compatible |
| `apps/docs` | private | website: docs, galleries, theme builder, icons, examples (junco.madebytobi.com) |
| `examples/*` | private | full example projects (pulse, ledger, hackathon, status-page) shown on /examples |

## Rules

**Tokens**
- Never hard-code a color, radius, shadow or duration in a component. Always a token.
- Token names follow shadcn/ui's CSS variable names (`--background`, `--foreground`, `--card`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`, ...) so shadcn components and themes drop straight in. Junco adds its own on top (`--surface`, `--success`, `--warning`, motion tokens and so on).
- The brand color is `--primary`. One variable change re-themes a whole app.
- Light is `:root`. Dark is `.dark` and `[data-theme="dark"]`. Every token must have both.
- Text color pairs must hit 4.5:1 contrast in both modes. Add a test that checks this.

**Components**
- Each component lives in ONE source file that serves both the installed package and the registry, so the two never drift.
- Every component takes `className`. Multi-part components take `classNames` slot overrides.
- Variant props come from `tailwind-variants`: `variant`, `size`, `color`, plus states like `isLoading` and `isDisabled`.
- Accessible by default: keyboard support, focus-visible rings using `--ring`, aria labels on icon-only controls, and status never shown by color alone.
- Motion uses the motion tokens, and the global `data-motion="off|subtle|full"` attribute plus `prefers-reduced-motion` turn it down or off.
- Every component gets a test, a docs page and a semantic-class version where that makes sense (pure CSS can't do dialogs or menus, and that's fine).

**Pages and templates**
- Pages are built only from Junco blocks and components.
- Every page takes typed data props and falls back to realistic fake data.
- Every page supports `slots` overrides and layout `variant`s.

**Look:** clean and minimal, like Linear or Vercel. Neutrals do the work, one accent marks primary actions, depth comes from borders not shadows (shadows only on floating things), type sets the hierarchy. Geist and Geist Mono. Radius 8px on cards and inputs, 6px on small controls. 4px spacing scale.

**Scope:** follow the roadmap order. Ship small, working slices. Don't start pages before the components they need exist.

## Commands (once set up)

```bash
pnpm install
pnpm dev          # docs site + package watch
pnpm build        # build every package
pnpm test         # vitest
pnpm lint
pnpm changeset    # record a version bump
```

## Current state

- Live at https://junco.madebytobi.com (Cloudflare Pages, deploys on every push to `main`; PRs get `pr-<n>.junco-docs.pages.dev` previews).
- All 8 packages are on npm under `@junco/*` (the unscoped `junco` name is blocked by npm). Releases: add a changeset, merge to `main`, then merge the "chore: version packages" PR; the Release workflow publishes with npm Trusted Publishing (no token) and provenance. See `docs/releasing.md`.
- `pnpm install && pnpm build && pnpm test && pnpm typecheck` pass. Node 24 in CI.
- **Tokens**: `packages/tokens/src/tokens.css` is the source of truth. It also feeds the TS object, W3C JSON, and the Swift files (`pnpm swift:tokens`; CI fails if they drift). `packages/tokens/test/contrast.test.ts` checks every pair in `src/pairs.ts` (4.5:1 text, 3:1 controls) in both modes. The blue `--primary` is still a placeholder.
- **Components** (`packages/react`, 30+): primitives, forms (RHF + Zod), overlays, data table, toast, command, Icon. Radix sits behind `lib/primitives.ts`. Every component has a test, a docs page in `apps/docs/content/components/<slug>.tsx` (+ one line in `index.ts`), and is auto-discovered by the registry build. `@junco/react/server` holds the server-safe exports (`pnpm check:dist` guards it).
- **Blocks and pages**: 40 entries in `apps/docs/content/blocks/catalog.ts`, 21 full pages, all with typed data, fake-data fallbacks, `slots` and `variant`s.
- **Registry + CLI + MCP**: `pnpm registry:build` writes shadcn-compatible JSON and llms.txt to `apps/docs/public`, plus `r/templates/` for app templates. `@junco/cli` has create, init, add, list, diff, update, eject. `@junco/mcp` reads the public registry.
- **Templates** (`templates/saas`, `templates/admin`): Vite + React Router apps built only from blocks and pages, with fake auth (`src/lib/auth.tsx`) and lazy-loaded routes. Workspace packages, so CI builds and type-checks them; the registry build turns `workspace:*` into published versions for `junco create`. Each needs a `template.json`.
- **Swift**: SwiftUI code only compiles on Apple platforms; `.github/workflows/swift.yml` builds and tests it on macOS. JuncoUI has button, text field, switch, field, badge, card, sheet, segmented tabs, list rows and a shared focus ring (`.juncoFocusRing`). Previews in `packages/swift/Sources/JuncoUI/Previews.swift`; `GallerySnapshotTests` renders them to PNGs on a simulator (see `packages/swift/README.md`).
- Commits are authored as `Oluwatobi Olajide <olola73@morgan.edu>`; no AI trailers.

## Where to start

The open work is in `docs/ROADMAP.md`. In order:
1. Phase 4: move one real project onto Junco, fix what gets in the way, tag v1.0.
2. Phase 3b: `@junco/collab` and `@junco/editor`.
3. More templates (CRM, Store, ...) when a real project needs them.
4. SwiftUI: more components as native apps need them.
Check the accent and fonts with Tobi before locking them in.
