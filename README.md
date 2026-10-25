# Junco

A free, open source design system for React and Tailwind v4. It includes tokens, components, blocks, full pages, app templates, motion and 3D.

You can use it four ways, and they all share the same tokens:

```html
<!-- like daisyUI: plain HTML, no JavaScript -->
<button class="btn btn-primary">Save</button>
```

```tsx
// like Tailwind
<div className="bg-surface border border-border rounded-card p-4">...</div>

// like HeroUI / NextUI
import { Button } from "junco";
<Button size="sm" isLoading>Save</Button>
```

```bash
# like shadcn/ui
npx junco add dialog
```

Status: early. See `docs/ROADMAP.md`.

## Repo

- `packages/tokens`: design tokens (`@junco/tokens`)
- `packages/tailwind`: the Tailwind v4 theme and semantic classes (`@junco/tailwind`)
- `packages/react`: React components (`junco`)
- `packages/cli`: `junco add`, `diff`, `update`, `create`
- `packages/three`: 3D scenes (`@junco/three`)
- `registry`: source files for copy-in
- `apps/docs`: the website

MIT licensed.
