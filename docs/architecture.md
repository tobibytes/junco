# Architecture

```
@junco/tokens      tokens.css (source of truth) ──► TS object + W3C JSON
      │
@junco/tailwind    @theme mapping ─► utilities (bg-surface, rounded-card, duration-fast…)
      │            semantic classes (btn, card, input, modal, table…)
      │
junco              React components (one file each) ──┬─► npm package (installed)
      │                                               └─► registry JSON (copy-in) ─► @junco/cli, shadcn, @junco/mcp
@junco/blocks      blocks + pages built only from junco components
@junco/three       lazy 3D scenes that read the same tokens at runtime
```

## Principles

**Tokens are the contract.** Everything reads CSS variables named like shadcn/ui's (`--background`, `--primary`, `--muted-foreground`…) plus Junco's own (`--surface`, `--border-strong`, `--overlay`, status `-text` colors, motion). That's why the four usage levels mix: a `btn` class, a `bg-primary` utility and a `<Button>` all change when `--primary` does.

**One file per component.** `packages/react/src/components/<name>.tsx` is published in the npm package *and* served as copy-in source by the registry. `scripts/build-registry.ts` rewrites imports to shadcn-style aliases (`@/lib/utils`, `@/components/ui/<name>`) and records a content hash per item, which `junco diff` and `junco update` use for three-way merges.

**Behavior behind a seam.** Components never import Radix directly. `src/lib/primitives.ts` re-exports every headless primitive, so a move to Base UI touches one file plus the components using each namespace. The registry inlines those as direct imports so copied code only depends on what it uses.

**Heavy things stay out of the core.** TanStack Table and React Hook Form live behind `@junco/react/data-table` and `@junco/react/form` as optional peers. three.js lives in `@junco/three`, whose root entry never imports it (checked by `pnpm check:dist`).

**Pages are data-driven.** Every page in `@junco/blocks` takes typed data, falls back to seeded fake data (same output on server and client), offers layout `variant`s, and exposes `slots` so any region can be replaced or hidden.

## Quality gates

| Check | Where |
| --- | --- |
| Text pairs ≥ 4.5:1, control parts ≥ 3:1, light and dark | `packages/tokens/test/contrast.test.ts` |
| axe on every component (rendered open for overlays), with a guard test that proves axe can fail | `packages/react/test/a11y.test.tsx` |
| Behavior and keyboard tests per component | `packages/*/test` |
| Registry invariants, CLI round-trips through GNU `patch` | `packages/cli/test` |
| `"use client"` survives the build; lazy entries stay lazy | `scripts/check-dist.ts` |
