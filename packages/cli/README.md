# @junco/cli

Copy Junco components into your project, then keep them updated without losing your edits.

```bash
npx @junco/cli init             # detect Next/Vite, wire the theme into your CSS, write junco.json
npx @junco/cli add button select   # copies select + field, label, icons, utils; installs npm deps
npx @junco/cli diff             # which installed components have upstream updates
npx @junco/cli diff select      # unified diff: your copy vs upstream
npx @junco/cli update select    # take upstream if you didn't edit it; otherwise write select.tsx.junco-upstream
```

Needs Tailwind CSS v4 already set up (an `@import "tailwindcss";` in your global CSS).

## Commands

| Command | What it does |
| --- | --- |
| `init [--css package\|inline] [--css-file <path>] [--yes] [--force]` | `package` adds `@import "@junco/tailwind";` and installs it. `inline` writes `styles/junco.css` into your project instead. Also adds `utils` (`cn`). |
| `add <name...> [--overwrite]` | Resolves registry dependencies, rewrites imports to your aliases (or relative paths if you have no `@/*` alias), installs missing npm packages, records hashes in `junco.json`. Files you changed are kept unless `--overwrite`. |
| `diff [name...]` | With names: unified diff, applyable with `patch`. Without: lists items with updates. |
| `update [name...] [--force] [--resolved] [--all]` | Untouched files are replaced. Edited files get a `.junco-upstream` copy next to them. Merge by hand, delete the copy, then `--resolved`. `--force` takes upstream and drops your edits. |
| `list [--installed]` | Everything in the registry, with installed / update-available markers. |
| `eject` | Not built yet. |

Global options: `--registry <url|dir>` (or `JUNCO_REGISTRY`, or `registry` in `junco.json`), `--cwd <dir>`, `--no-install`.

## Works with shadcn

Every item is also a shadcn registry item: `npx shadcn@latest add https://junco.dev/r/button.json`.
