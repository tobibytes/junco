# Junco roadmap

Each phase ends with something usable. Junco reaches v1.0 when one real project runs on it.

## Phase 1: Foundations

- [x] Claim the names: the `@junco` npm org (unscoped `junco` is blocked by npm; the React package is `@junco/react`), a GitHub org or repo
- [x] Make `pnpm install && pnpm build` pass across the monorepo (Turborepo, tsup, Changesets)
- [x] Draft tokens (`packages/tokens/src/tokens.css`), Tailwind mapping + first semantic classes (`packages/tailwind/src/index.css`), reference Button (`packages/react/src/components/button.tsx`), plain HTML example that compiles (`pnpm css:example`)
- [x] `@junco/tokens`: finish the light and dark color tokens, type scale, spacing, radius, shadows, motion (durations, easings, stagger). Export as CSS variables, a TS object, and the W3C design token JSON
- [x] Contrast test: every text/background pair hits 4.5:1 in light and dark
- [x] `@junco/tailwind`: map tokens into Tailwind v4 `@theme` so utilities like `bg-surface`, `text-muted-foreground`, `rounded-card`, `duration-base`, `ease-enter` work
- [x] Semantic classes v0: `btn` (+ `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `btn-sm`, `btn-lg`, `btn-icon`), `card`, `badge` (+ status colors, `badge-dot`), `input` (+ sizes, `aria-invalid`), `kbd`, `spinner`, `skeleton`
- [x] `@junco/react` package: `cn()`, Button, Input, Badge, Kbd, Spinner, Skeleton
- [x] Theme switching: `.dark` / `data-theme`, a `ThemeProvider`, and the `data-motion` switch
- [x] Plain HTML example page that uses only the semantic classes
- [x] Vite example app that uses the installed components

## Phase 2: Core

- [x] Remaining primitives: Textarea, Select, Checkbox, Switch, Radio, Tabs, Tooltip, Avatar, Separator, Label, Form field
- [x] Overlays: Dialog, Sheet (side + bottom on phones), Popover, Dropdown menu, Command palette, Toast
- [x] Data: Data table (TanStack Table), Pagination, Empty state, Stat
- [x] Forms: React Hook Form + Zod integration, field errors, help text
- [x] `apps/docs` v0: component pages with live preview, variants, props table, code tabs for all four levels
- [x] Registry: serve each component as shadcn-compatible JSON; `npx shadcn add <url>` works
- [x] CLI v0: `junco init`, `junco add <component>`

## Phase 3: Patterns, pages and the kit

- [x] Blocks: Sidebar, App shell, Page header, Hero, Feature grid, Pricing table, Stat row, Settings row, Auth card
- [x] First 20 pages: Sign up, Log in, Forgot password, Onboarding, Analytics dashboard, Users list, User detail, Settings profile, Settings billing, Team members, API keys, Notifications, Landing, Pricing, Changelog, Blog index, Blog post, 404, 500, Empty workspace
- [x] Page system: typed data props, fake data fallback, `slots`, `variant`
- [ ] First 2 templates: SaaS, Admin panel; `junco create my-app --template saas`
- [x] CLI: `junco add` (components, blocks and pages), `junco diff`, `junco update`, `junco eject`, `junco list`
- [ ] CLI: `junco add page <name> --variant <v>`
- [x] Motion layer: effects library (scroll reveal, counters, text reveal, marquee, beams, spotlight card, magnetic button), View Transitions page transitions
- [x] `@junco/three` v0: particle field, shader gradient, globe, tilt card, model viewer, all lazy loaded with fallbacks
- [x] Docs site: blocks and pages gallery, motion and 3D galleries, theme builder (accent picker with contrast checks), icons gallery, examples showcase
- [ ] Templates gallery (waits on templates)
- [ ] Prototype kit: device frames, fake data helpers, playground canvas, prototype mode
- [x] MCP server + llms.txt + Markdown docs

## Done beyond the plan

- [x] Icon component (any SVG set, Lucide in the docs) with `--icon-stroke` and a searchable gallery
- [x] Junco for Swift (preview): tokens generated from tokens.css, SwiftUI button, text field, toggle, field, badge and card styles; macOS CI
- [x] Four complete example projects with live demos: Pulse, Ledger, HackHarbor, Status page
- [x] npm publishing with Trusted Publishing (no token) and provenance

## Phase 4: Adopt

- [ ] Move one real project onto Junco
- [ ] Fix whatever got in the way, write down the gaps
- [ ] Tag v1.0

## Phase 3b: Collaboration UI

- [ ] `@junco/collab`: adapter interfaces (presence, comments, history, sharing) + fake-data adapter
- [ ] Presence: cursors, avatar stack, who's-editing bar
- [ ] Comments: anchored threads, mentions, reactions, resolve, sidebar
- [ ] History sidebar + version compare, share dialog with roles, save/offline status
- [ ] `@junco/editor`: TipTap rich text block with toolbar and slash commands
- [ ] Docs editor page + Collaborative docs template
- [ ] First real adapter (Yjs or Liveblocks); the sync engine itself is a separate project

## After v1.0

- Grow the page catalog toward the full list in PLAN.md, adding pages when a real project needs them
- More templates (CRM, Store, AI app, Agent platform, Dev tool, Analytics, Course platform, Event/hackathon, ...)
- Figma variables export, theme presets, RTL
