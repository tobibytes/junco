# Contributing to Junco

Thanks for helping. This guide covers setup, the rules every change follows, and how releases work.

## Setup

You need Node 22.18 or newer (build scripts use Node's built-in TypeScript support) and pnpm 9.

```bash
pnpm install
pnpm build        # every package
pnpm test         # vitest across the repo
pnpm typecheck
pnpm dev          # docs site + package watch
```

Useful extras:

| Command | What it does |
| --- | --- |
| `pnpm registry:build` | Builds the copy-in registry and `llms.txt` into `apps/docs/public` |
| `pnpm check:dist` | Checks built packages keep `"use client"` and lazy entries stay lazy |
| `pnpm css:example` | Compiles the plain-HTML semantic-class example |
| `pnpm changeset` | Records a version bump for a published package |

## Repo map

| Path | What lives there |
| --- | --- |
| `packages/tokens` | `src/tokens.css` is the source of truth for every design value |
| `packages/tailwind` | Tailwind v4 mapping (`index.css`) and semantic classes (`components.css`) |
| `packages/react` | The `@junco/react` package. One file per component in `src/components` |
| `packages/blocks` | Blocks and pages, plus the page system (`lib/slots.ts`) and fake data (`lib/fake.ts`) |
| `packages/three` | 3D scenes |
| `packages/cli`, `packages/mcp` | The CLI and MCP server. Both read the registry |
| `scripts/` | Registry build and post-build checks |
| `apps/docs` | The website |
| `examples/` | Small apps used for manual and visual checks |
| `docs/` | Plan, roadmap, decisions and the contributor wiki |

## The rules

These come from [CLAUDE.md](CLAUDE.md) and apply to every change:

- **Tokens only.** Never hard-code a color, radius, shadow or duration in a component.
- **One source file per component.** It serves the npm package and the copy-in registry, so they never drift.
- **Every component takes `className`**; multi-part ones take `classNames` slot overrides.
- **Variants come from `tailwind-variants`**: `variant`, `size`, `color`, plus states like `isLoading`, `isInvalid`, `isDisabled`.
- **Accessible by default.** Keyboard support, `--ring` focus rings, labels on icon-only controls, and status never shown by color alone.
- **Motion respects the switch.** Scale durations by `--motion-scale`; `data-motion` and `prefers-reduced-motion` turn it down or off.
- **Headless behavior goes through `packages/react/src/lib/primitives.ts`.** Never import Radix directly from a component.

## Adding a component

1. Create `packages/react/src/components/<name>.tsx`. Copy the shape of `button.tsx`. Give the main export a one-line JSDoc: it becomes the description in the registry, CLI, MCP and `llms.txt`.
2. Export it from `packages/react/src/index.ts`.
3. Add a semantic-class version to `packages/tailwind/src/components.css` where pure CSS can do it.
4. If it puts a text token on a new background, add the pair to `packages/tokens/src/pairs.ts`.
5. Tests in `packages/react/test`: behavior, keyboard, and add it to the axe check in `a11y.test.tsx`.
6. Add its docs page under `apps/docs/content/components/`.
7. `pnpm changeset`.

The registry picks new components up automatically.

## Pull requests

- Keep them small and focused. One component or fix per PR is ideal.
- Include screenshots in light and dark for anything visual, and at phone width if layout changed.
- CI must be green: build, `check:dist`, typecheck, tests, registry build.

## Releases

Releases use [Changesets](https://github.com/changesets/changesets). Add a changeset in your PR with `pnpm changeset`. When PRs land on `main`, the Release workflow opens a "Version packages" PR; merging it publishes to npm with provenance.

## Code of conduct

Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
