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

## Still open (ask Tobi before locking these in)

- [ ] Default accent color. `tokens.css` uses a placeholder blue for now
- [ ] Fonts: Geist (current default), Inter, or something with more character
- [ ] Which project adopts Junco first (Talvra v2 currently uses Arc UI)
- [ ] Behavior layer: Radix, or Base UI (shadcn's default since July 2026). **Building on Radix for now** (per the stack in CLAUDE.md). Every Radix import goes through `packages/react/src/lib/primitives.ts`, so a switch is contained
- [x] CLI package name: `@junco/cli` (bin `junco`, run with `npx @junco/cli`). npm blocks the unscoped `junco` name, so the React package is `@junco/react`.
