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

- `pnpm install && pnpm build && pnpm test && pnpm typecheck` all pass.
- **Tokens** (`packages/tokens`): `src/tokens.css` is the source of truth: colors (light + dark), type scale, weights, tracking, 4px spacing, radius, shadows, z-index, motion. `pnpm build` also emits a TS object (`import { tokens } from "@junco/tokens"`) and W3C DTCG JSON (`@junco/tokens/tokens.json`, dark values under `$extensions["dev.junco"].modes.dark`). The blue `--primary` is still a placeholder.
- **Status text tokens**: `--success-text`, `--warning-text`, `--destructive-text` are Junco additions for status-colored text on the page (`text-destructive-text` for field errors). Solid status fills use the `-foreground` pair instead.
- **Contrast test**: `packages/tokens/test/contrast.test.ts` checks every pair in `src/pairs.ts` at 4.5:1 in both modes. Add a pair there whenever a component puts a text token on a new background.
- **`@junco/tailwind`**: `src/index.css` maps every token into `@theme` (`bg-surface`, `text-muted-foreground`, `rounded-card`, `rounded-control`, `shadow-float`, `duration-fast`, `ease-enter`, `z-overlay`, `animate-rise`, `animate-spinner`, `animate-skeleton`). Semantic classes live in `src/components.css`. Animations multiply by `--motion-scale`; spinners keep turning (slower) with motion off since they carry meaning.
- **`@junco/react`**: `cn()`, Button, Input, Badge, Kbd, Spinner, Skeleton, ThemeProvider + `useTheme` + `themeScript()` (no-flash inline script) + `applyTheme`. Tests in `packages/react/test` (Vitest + Testing Library, jsdom).
- **Examples**: `examples/plain-html` (semantic classes only, `pnpm css:example`) and `examples/vite-react` (installed components, theme + motion switcher). Apps using `@junco/react` need `@source "../node_modules/@junco/react/dist";` in their CSS so Tailwind sees the component classes.
- CLI, three, registry and docs app are stubs.

## Where to start

Phase 1 is done except claiming the npm names. Next is Phase 2 in `docs/ROADMAP.md`: the remaining primitives (Textarea, Select, Checkbox, Switch, Radio, Tabs, Tooltip, Avatar, Separator, Label, Form field). Settle the behavior layer (Radix vs Base UI) in `docs/DECISIONS.md` with Tobi before building anything that needs it (Select, Tabs, Tooltip, overlays). Still check the accent and fonts with Tobi before locking them in.
