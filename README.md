<div align="center">

# Junco

**A free, open source design system for React and Tailwind v4.**
Tokens, accessible components, blocks, full pages, motion and 3D. Use it four ways, all from the same tokens.

[Docs](https://junco.madebytobi.com) · [Components](https://junco.madebytobi.com/components) · [Examples](https://junco.madebytobi.com/examples) · [Getting started](https://junco.madebytobi.com/docs/getting-started) · [MCP for AI agents](packages/mcp)

[![CI](https://github.com/tobibytes/junco/actions/workflows/ci.yml/badge.svg)](https://github.com/tobibytes/junco/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/junco?label=junco&color=blue)](https://www.npmjs.com/package/junco)
[![License: MIT](https://img.shields.io/badge/license-MIT-black.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-junco.madebytobi.com-blue)](https://junco.madebytobi.com)

</div>

---

## Four ways to use it

Every level reads the same CSS variables, so you can mix them in one app and re-theme everything by changing `--primary`.

```html
<!-- 1. Semantic classes, like daisyUI: plain HTML, no JavaScript, any framework -->
<button class="btn btn-primary">Save</button>
```

```tsx
// 2. Utilities, like Tailwind: tokens as classes
<div className="rounded-card border border-border bg-surface p-4 text-muted-foreground">…</div>
```

```bash
# 3. Copy-in, like shadcn/ui: the source lands in your repo, and stays updatable
npx @junco/cli add dialog          # or: npx shadcn add https://junco.madebytobi.com/r/dialog.json
npx @junco/cli diff dialog         # what changed upstream since you copied it
npx @junco/cli update dialog       # merge it, keeping your edits
```

```tsx
// 4. Installed, like HeroUI: import and go
import { Button, Field, Input } from "junco";

<Field label="Email" error={errors.email}>
  <Input type="email" />
</Field>
<Button isLoading={saving}>Save</Button>
```

## Quick start

```bash
npm i junco @junco/tailwind
```

```css
/* app.css */
@import "tailwindcss";
@import "@junco/tailwind";
@source "../node_modules/junco/dist"; /* let Tailwind see the component classes */
```

```tsx
import { ThemeProvider, Toaster, TooltipProvider } from "junco";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
```

Framework guides for Next.js, Vite and plain HTML are in the [docs](https://junco.madebytobi.com/docs/getting-started).

## What's inside

| Package | What it is |
| --- | --- |
| [`junco`](packages/react) | React components: Button, Input, Textarea, Select, Checkbox, Switch, Radio, Tabs, Tooltip, Avatar, Badge, Field, Dialog, Sheet, Popover, Dropdown menu, Command palette, Toast, Card, Stat, Pagination, Breadcrumb, plus `junco/data-table` (TanStack) and `junco/form` (React Hook Form + Zod) |
| [`@junco/tokens`](packages/tokens) | Every design value as CSS variables (light and dark), a TS object and W3C design token JSON |
| [`@junco/tailwind`](packages/tailwind) | The Tailwind v4 theme, semantic classes (`btn`, `card`, `input`, `modal`, `table`, …) and motion utilities |
| [`@junco/blocks`](packages/blocks) | App shells, dashboards, settings, auth and marketing pages with typed props, fake data, `variant`s and `slots` |
| [`@junco/motion`](packages/motion) | Scroll reveal, number ticker, text reveal, marquee, spotlight, beams, confetti and view transitions, all following the motion switch |
| [`@junco/three`](packages/three) | Lazy-loaded 3D: particle field, shader gradient, globe, model viewer, tilt card |
| [`@junco/cli`](packages/cli) | `junco init`, `add`, `diff`, `update`, `list` |
| [`@junco/mcp`](packages/mcp) | MCP server so Claude, Cursor and other agents can find and install Junco components |

## Examples

Four complete projects built only with Junco, each with a live demo and source in [`examples/`](examples):

| | |
| --- | --- |
| [**Pulse**](https://junco.madebytobi.com/examples/pulse/): product analytics SaaS (app shell, data table, ⌘K) | [**Ledger**](https://junco.madebytobi.com/examples/ledger/): personal finance and savings goals, mobile-first |
| [**HackHarbor**](https://junco.madebytobi.com/examples/hackathon/): hackathon site with 3D, motion and registration | [**Status page**](https://junco.madebytobi.com/examples/status-page/): plain HTML using only the CSS classes |

## Why Junco

- **One set of tokens, four ways to use it.** Plain CSS classes, utilities, copy-in source, or an npm package.
- **Copied code that still updates.** `junco diff` and `junco update` do a three-way merge instead of leaving you with a stale fork.
- **Accessible by default.** Keyboard support, visible focus, labels wired by `Field`, status never shown by color alone. Every component runs through axe in CI, and every text color pair is tested for 4.5:1 contrast in light and dark.
- **Motion with one switch.** `data-motion="off | subtle | full"` scales every animation, and `prefers-reduced-motion` always wins.
- **Built for AI agents.** An MCP server, `llms.txt`, and a shadcn-compatible registry.
- **Free.** MIT, nothing behind a paywall.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md); the product plan and roadmap are in [`docs/`](docs).

```bash
pnpm install
pnpm dev     # docs site + package watch
pnpm build && pnpm test && pnpm typecheck
```

## License

[MIT](LICENSE) © 2026 Oluwatobi Olajide.

Junco™ is designed and built by [**Tobibytes**](https://madebytobi.com).
