# Working on the Junco website

Next.js (App Router), built as static HTML into `out/` and served by Cloudflare Pages.

```bash
pnpm dev                      # from the repo root: this site + package watchers, on :3000
pnpm --filter docs build      # static build into apps/docs/out
pnpm --filter docs start      # serve out/ locally
pnpm --filter docs deploy     # wrangler pages deploy (needs Cloudflare auth)
```

CI deploys `main` with `.github/workflows/deploy-docs.yml`. It needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets and a Pages project named `junco-docs`.

## Adding a component page

One new file and one line.

1. Create `content/components/<slug>.tsx`. Start with `"use client"` and export `doc: ComponentDoc` (see `types.ts`):
   - `imports`: names imported from `@junco/react`, for the install snippet
   - `playground` (optional): `controls`, plus `render(values)` and `code(values)` that stay in sync
   - `usage`: code for each level. `installed` is required; leave out `semantic` or `utilities` when that level doesn't apply and the page says so
   - `examples`: each has a `Preview` component and the matching `code` string
   - `props`: one table per exported part
   - `keyboard` and `a11y` notes
   Copy `button.tsx` as a starting point.
2. Add one line to `content/components/index.ts` with the slug, title, one-line description, category and `load: () => import("./<slug>")`.

That's it: the route, sidebar entry, search result, index card (its thumbnail is the playground default, or the first example), sitemap entry and prev/next links all come from that line.

## Adding a block or page

1. Add an entry to `blocks` in `content/blocks/catalog.ts`: slug, title, category, description, component, import path, variants (default first), and `inShell` for app pages or `height` for sections.
2. Add its render function to `renders` in `content/blocks/render.tsx` (it gets the variant).

The gallery card, detail page, preview frames (`/preview/<slug>/<variant>/`, one per variant), search entry and sitemap entry all come from that. Previews are real pages in iframes, so media queries, sticky headers and sheets behave as they do in an app. Frames skip `ThemeProvider` and take `?theme=` / `?motion=` from the URL, then messages from the page that embeds them (`lib/frame.ts`). Links inside frames that leave `/preview/` are demo links: the frame shows a toast instead of navigating.

## Adding a guide

Create `app/docs/<slug>/page.tsx` using the pieces in `components/docs/prose.tsx`, then add it to `guides` in `content/nav.ts`.

## Things to know

- **Server vs client.** `@junco/react`'s bundle is marked `"use client"`, so on the server every export is a client reference. You can render its components from server files, but you can't *call* its functions there, or pass them function props. `lib/cn.ts` and `lib/theme-script.ts` re-export from `@junco/react/server`, which is server-safe.
- **Theme state and hydration.** `ThemeProvider` reads localStorage during render. Anything that shows the current theme or motion must wait for `useMounted()` (`lib/use-mounted.ts`), or the first client render won't match the server HTML.
- **Previews** (`components/preview.tsx`) can be pinned to light or dark by re-declaring the color tokens on the frame. Portaled content like select menus and tooltips still follows the site theme.
- **Registry and llms.txt** are generated into `public/r` and `public/llms.txt` by `pnpm registry:build` at the repo root, which `prebuild` runs when it exists.
- **Code highlighting** is a small tokenizer in `lib/highlight.ts` (TSX, HTML, CSS, shell) so live playground code can be highlighted in the browser.
