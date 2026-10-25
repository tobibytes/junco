# Status page: Junco in plain HTML

A service status page for a fictional product, built with **only Junco's semantic classes**: no React and no component framework. It proves the first of Junco's four levels: `class="card"`, `class="badge badge-success badge-dot"`, `class="btn btn-primary"` and friends work anywhere HTML does.

Live demo: https://junco.madebytobi.com/demos/status-page/

## Run it

```bash
pnpm install
pnpm --filter @junco/example-status-page dev
```

The build is one HTML file and one CSS file. The only client JavaScript is a small inline theme toggle.

## How it's built

- `index.html`: the whole page. Components are Junco classes: `card`, `card-flush`, `card-title`, `badge` (+ `badge-success`, `badge-warning`, `badge-outline`, `badge-dot`), `btn` (+ `btn-primary`, `btn-sm`, `btn-ghost`, `btn-icon`), `input`, `field`, `label`, `field-help`, `checkbox`, `separator`, `table` (+ `table-container`, `table-hover`), `tooltip`.
- `src/style.css`: `@import "tailwindcss"; @import "@junco/tailwind";` plus a little page layout that uses tokens (`var(--border)`, `var(--success)`, …), never raw colors.
- `vite.config.ts`: a tiny build-time plugin draws the 90-day uptime bars from a fixed history, so the browser doesn't run anything to render them.

## Accessibility notes

- Every status has a text label and a dot. Color is never the only signal.
- Each uptime row is one `role="img"` with a summary for screen readers ("99.98% uptime over 90 days, 2 days with degraded performance"). The per-day tooltips are a hover extra.
- On phones the bars show the last 30 days, so each day stays wide enough to see.
