# Registry

Source for copy-in installs (`npx @junco/cli add`) and shadcn compatibility (`npx shadcn@latest add https://junco.dev/r/<name>.json`).

## Build

```bash
pnpm registry:build                     # -> apps/docs/public/{r/, schema/, llms.txt, llms-full.txt}
node scripts/build-registry.ts --out <dir> --base-url https://junco.dev/r
```

The output is generated and gitignored. The docs site serves `apps/docs/public` as-is, so `apps/docs#build` should depend on `//#registry:build` (a Turbo root task).

## What gets discovered

Nothing is listed by hand.

| Source | Item type | Lands in the user's project at |
| --- | --- | --- |
| `packages/react/src/components/*.tsx` | `registry:ui` | `@/components/ui/<file>` |
| `packages/react/src/theme/*.tsx` | `registry:ui` | `@/components/ui/<file>` |
| `packages/react/src/lib/cn.ts` | `registry:lib`, named `utils` | `@/lib/utils` |
| other `packages/react/src/lib/*` | `registry:lib` | `@/lib/junco/<file>` |
| `registry/blocks/<name>/*.tsx` | `registry:block` | `@/components/blocks/<name>/<file>` |
| `registry/pages/<name>/*.tsx` | `registry:page` | `@/components/pages/<name>/<file>` |
| `packages/tokens` + `packages/tailwind` | `registry:theme` `junco-theme` | merged into the global CSS (`cssVars` + `css`) |
| same, bundled | `registry:file` `junco-css` | `styles/junco.css` (`junco init --css inline`) |

`lib/primitives.ts` never ships: each `import { XPrimitive } from "../lib/primitives"` is rewritten into the direct import (`import * as XPrimitive from "@radix-ui/react-x"`), so copied code only depends on the Radix packages it uses.

## Per item

- **Imports** are rewritten to shadcn-style aliases (`@/lib/utils`, `@/components/ui/<name>`, `@/lib/junco/<file>`). The Junco CLI then maps those to the project's own aliases from `junco.json`, or to relative paths when the project has none.
- **dependencies**: npm packages from bare imports, pinned to the ranges in `packages/react/package.json`.
- **registryDependencies**: full URLs (`https://junco.dev/r/field.json`) so plain shadcn can follow them. Every UI item depends on `junco-theme`.
- **meta.hash**: content hash used by `junco diff` / `junco update`.
- **meta.exports / props / variants / usage**: read from the source (JSDoc, `*Props` interfaces, `tv({ variants })`). The description is the JSDoc on the main export (`Button` in `button.tsx`), falling back to the title. Write good JSDoc and it shows up in the CLI, MCP server and llms.txt.
- **docs**: shown by shadcn after install.

## Blocks and pages

Create `registry/blocks/<name>/` (or `registry/pages/<name>/`) with one or more `.tsx` files. Import components with relative paths to `packages/react/src/components/...` and they become registry dependencies automatically. Put the JSDoc for the block on its main export.
