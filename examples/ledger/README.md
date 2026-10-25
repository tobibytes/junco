# Ledger

A personal finance and savings tracker built with Junco, designed phone-first: net worth, accounts, monthly budgets, savings goals with an emergency-fund target, and a full transaction history. Adding a transaction updates every number and chart right away.

Live demo: https://junco.madebytobi.com/demos/ledger/

## Run it

```bash
pnpm install
pnpm --filter @junco/example-ledger dev
```

Build it with `pnpm --filter @junco/example-ledger build`. The build uses `base: "./"` and hash routing, so `dist/` works from any subpath.

Keyboard: press <kbd>N</kbd> anywhere to add a transaction.

## What it uses

| Junco piece | Where |
| --- | --- |
| `Form`, `FormField`, `FormSubmit` from `@junco/react/form` with a Zod schema | The add-transaction form (labels, errors and aria wired automatically) |
| `Sheet` | The add form: a side panel on desktop, a swipeable bottom sheet on phones |
| `DataTable` from `@junco/react/data-table` | Transactions on desktop |
| `StatRow`, `AreaChart`, `BarChart`, `useMediaQuery` from `@junco/blocks/app` | Stats, net worth and spending charts, layout switching |
| `NumberTicker`, `Reveal`, `confetti()` from `@junco/motion` | Net worth count-up, card reveals, a funded goal |
| `Dialog`, `Field`, `Input`, `RadioGroup`, `Select`, `Tabs`, `Card`, `Badge`, `EmptyState`, `DropdownMenu`, `toast()` | Everywhere |
| `ThemeProvider` | Light, dark, system, and the motion switch |

Budgets and goals use a small `Meter` (a real `progressbar`) and always say "over", "left" or "paid in full" in words, so status never depends on color alone.

## Files

- `src/app.tsx`: hash router, sidebar (desktop) and bottom tab bar (phones)
- `src/store.tsx`: app state and derived totals
- `src/data.ts`: seeded accounts, transactions and goals
- `src/add-transaction.tsx`: the validated form
- `src/pages/*`: one file per page
