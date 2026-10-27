# Decisions

## Decided

- Name: **Junco**
- Docs domain: **junco.madebytobi.com** (Cloudflare Pages). Registry at `https://junco.madebytobi.com/r`
- License: free and open source, MIT. Nothing behind a paywall
- Look: clean minimal (Linear / Vercel feel), light and dark from day one
- Styling: Tailwind v4 based
- Four ways to use it: semantic classes, utilities, copy-in components, installed components
- Token names compatible with shadcn/ui; the brand color is `--primary`
- Layers: tokens, primitives, overlays, blocks, pages, templates (+ motion and 3D)
- Website covers docs, components, blocks, pages, templates, motion, 3D, theme builder, playground, prototype mode
- Collaboration (decided 2026-10-27, replaces the Liveblocks route):
  - Our own self-hosted replacement for Liveblocks, in a **separate repo**. Junco keeps only the UI (`@junco/collab`) and an adapter for the engine. No engine, Worker or provider SDK in this repo
  - Engine: one core with two hosts, Cloudflare Durable Objects and a Node/Docker server. Storage behind an interface
  - Protocol: standard Yjs sync over WebSocket (so TipTap and other Yjs bindings work), plus our own SDK for rooms, presence, comments, history and notifications
  - Auth: the app's backend mints short-lived room tokens (user, room, read/write) signed with a secret
  - v1 covers presence and cursors, shared state (Yjs), comments and threads, history and notifications
  - For Tobi's apps first, and open source so others can self-host. Not a multi-tenant hosted service
  - First user: a collaborative docs demo on the Junco site

## Still open (ask Tobi before locking these in)

- [ ] Default accent color. `tokens.css` uses a placeholder blue for now
- [ ] Fonts: Geist (current default), Inter, or something with more character
- [ ] Which project adopts Junco first (Talvra v2 currently uses Arc UI)
- [ ] Behavior layer: Radix, or Base UI (shadcn's default since July 2026). **Building on Radix for now** (per the stack in CLAUDE.md). Every Radix import goes through `packages/react/src/lib/primitives.ts`, so a switch is contained
- [x] CLI package name: `@junco/cli` (bin `junco`, run with `npx @junco/cli`). npm blocks the unscoped `junco` name, so the React package is `@junco/react`.
