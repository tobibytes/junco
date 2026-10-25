# junco

Accessible React components for Tailwind v4, part of the [Junco design system](https://junco.madebytobi.com).

```bash
npm i junco @junco/tailwind
```

```css
/* app.css */
@import "tailwindcss";
@import "@junco/tailwind";
@source "../node_modules/junco/dist";
```

```tsx
import { Button, Field, Input, ThemeProvider, Toaster } from "junco";

<ThemeProvider>
  <Field label="Email" description="Work email only" error={errors.email}>
    <Input type="email" />
  </Field>
  <Button isLoading={saving}>Save</Button>
  <Toaster />
</ThemeProvider>
```

## What's in it

| Group | Components |
| --- | --- |
| Actions | Button |
| Forms | Field, Label, Input, Textarea, Select, Checkbox, Switch, RadioGroup |
| Overlays | Dialog, Sheet (swipeable bottom sheet on phones), Popover, DropdownMenu, Command / CommandDialog (⌘K), Tooltip, Toast (`toast()`) |
| Display | Avatar, Badge, Kbd, Spinner, Skeleton, Separator, Accordion, Card, Stat, Sparkline, EmptyState |
| Navigation | Tabs, Pagination, Breadcrumb |
| Theme | ThemeProvider, useTheme, themeScript |

Subpath entries keep heavy dependencies out of the core bundle:

| Import | What | Peer deps |
| --- | --- | --- |
| `junco/data-table` | Sortable, selectable, filterable data table | `@tanstack/react-table` |
| `junco/form` | React Hook Form + Zod wiring for every control | `react-hook-form`, `zod`, `@hookform/resolvers` |
| `junco/server` | `cn`, `themeScript` and variant helpers for React Server Components | none |

Every component takes `className`, multi-part ones take `classNames` slots, variants come from `tailwind-variants` (`variant`, `size`, `color`, `isLoading`, `isInvalid`), and everything respects `data-motion` and `prefers-reduced-motion`.

Prefer to own the source? `npx @junco/cli add dialog` copies it into your project and keeps it updatable.

[Docs](https://junco.madebytobi.com) · [Components](https://junco.madebytobi.com/components) · [GitHub](https://github.com/tobibytes/junco) · MIT
