# Decisions

## Decided

- Name: **Junco**
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
- [ ] Docs domain (junco.dev is a placeholder)
- [ ] Which project adopts Junco first (Talvra v2 currently uses Arc UI)
- [ ] Behavior layer: Radix, or Base UI (shadcn's default since July 2026)
- [ ] CLI package name: `junco` has to be the React package, so the CLI could be `create-junco` + `@junco/cli`, with `npx junco` handled by a `bin` in the main package
