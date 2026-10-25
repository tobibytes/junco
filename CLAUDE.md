# Junco

Junco is a free, open source (MIT) design system and UI library for React + Tailwind v4. It has tokens, components, blocks, full pages, app templates, motion and 3D, and you can use it at four levels:

1. **Semantic classes** like daisyUI: `class="btn btn-primary"`. Pure CSS, no JS, works in any framework or plain HTML.
2. **Utilities** like Tailwind: `bg-surface text-muted rounded-card`.
3. **Copy-in components** like shadcn/ui: `npx junco add dialog` copies the source into the user's repo. It can still be updated with `junco diff` / `junco update`.
4. **Installed components** like HeroUI/NextUI: `npm i junco`, then `import { Button } from "junco"`.

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
| `packages/react` | `junco` | installed React components |
| `packages/cli` | `junco` bin (or `create-junco` / `@junco/cli`, see decisions) | `junco add`, `junco diff`, `junco update`, `junco eject`, `junco create` |
| `packages/three` | `@junco/three` | 3D scenes on React Three Fiber + drei, lazy loaded |
| `packages/collab` (later) | `@junco/collab` | collaboration UI (cursors, presence, comments, history, sharing) + adapter interfaces. No sync engine in this repo |
| `packages/editor` (later) | `@junco/editor` | TipTap rich text editor block |
| `registry` | served by the docs site | component, block and page source files for copy-in, shadcn registry JSON compatible |
| `apps/docs` | private | website: docs, galleries, theme builder, playground, prototype mode |

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

- `pnpm install && pnpm build` passes.
- Tokens are drafted. The light and dark values in `packages/tokens/src/tokens.css` are a first pass, and the blue `--primary` is a placeholder.
- `@junco/tailwind` maps the tokens into Tailwind v4 and ships draft semantic classes: `btn` (+ variants and sizes), `card`, `badge`, `input`, `kbd`.
- `junco` exports `cn()` and a reference `Button`. Copy its pattern for every other component.
- `examples/plain-html` compiles with `pnpm css:example` and renders correctly in light and dark.
- CLI, three, registry and docs app are stubs.

## Where to start

Continue Phase 1 in `docs/ROADMAP.md`: finish the tokens (type scale, spacing) and add the contrast test, then Input, Badge, Kbd, Spinner, Skeleton, then the ThemeProvider and a Vite example app. Check open items in `docs/DECISIONS.md` with Tobi before locking in the accent, fonts or behavior layer.
