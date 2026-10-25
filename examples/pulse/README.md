# Pulse

A product analytics app built with Junco: an overview dashboard, an events explorer, conversion funnels, a users table and project settings. All data is seeded fake data, so it looks the same on every load.

Live demo: https://junco.madebytobi.com/demos/pulse/

## Run it

```bash
pnpm install
pnpm --filter @junco/example-pulse dev
```

Build it with `pnpm --filter @junco/example-pulse build`. The build uses `base: "./"` and hash routing, so `dist/` works from any subpath.

## What it uses

| Junco piece | Where |
| --- | --- |
| `AppShell`, `PageHeader`, `PageContainer`, `StatRow`, `AreaChart`, `BarChart`, `SettingsSection`, `SettingsRow` from `@junco/blocks/app` | Layout, stats, charts, settings |
| `DataTable` from `junco/data-table` | Events and users, with search, filters, sorting, selection and paging |
| `CommandDialog` | ⌘K / Ctrl+K palette for pages, actions and people |
| `Sheet` | Event details and user profiles (a bottom sheet on phones) |
| `Dialog`, `Field`, `Input`, `Select` | New funnel and delete-project flows |
| `DropdownMenu` | Row actions and the theme / motion menu |
| `Tabs`, `Card`, `Badge`, `Avatar`, `Switch`, `Kbd`, `toast()` | Everywhere |
| `ThemeProvider` | Light, dark, system, and the motion switch |
| `createRandom`, `fakePeople`, `fakeSeries`, `timeAgo` from `@junco/blocks/fake` | Seeded data |

## Files

- `src/app.tsx`: the hash router, app shell, display menu and command palette
- `src/data.ts`: seeded users, events, time series and funnels
- `src/pages/*`: one file per page
