# SaaS template

A SaaS app built from Junco blocks and pages: a marketing site, sign-up and onboarding, and a signed-in app with a dashboard, customers and settings. Light and dark, phone to desktop, realistic fake data everywhere.

```bash
npx @junco/cli create my-app --template saas
cd my-app
npm run dev
```

## What's inside

| Route | Page |
| --- | --- |
| `/` | Landing |
| `/pricing`, `/changelog`, `/blog`, `/blog/:slug` | Marketing pages |
| `/login`, `/signup`, `/forgot-password` | Auth |
| `/onboarding` | Shown after sign-up |
| `/app` | Dashboard |
| `/app/customers` | Customers table |
| `/app/settings/*` | Profile, billing, team, API keys, notifications |

## Make it yours

- **Name and copy:** `src/config.ts` (app name, tagline, header links, settings tabs). The accent color is `--primary` in your CSS: one variable re-themes everything.
- **Auth:** `src/lib/auth.tsx` is fake (any email signs in, the session lives in localStorage). Replace `signIn`, `signUp` and `signOut` with your provider; `RequireAuth` keeps guarding `/app/*`.
- **Data:** every page falls back to fake data. Pass your own as props in `src/routes/app.tsx`, and handle saves with the `on*` callbacks.
- **Pages:** the routes are in `src/app.tsx`. Each page loads on demand, so landing-page visitors don't download the dashboard.
- **Links:** marketing blocks use React Router through `LinkProvider`, the sidebar through `renderLink`, and `useInternalLinks()` routes any other same-site `<a>` without a page reload.

## Deploying

It's a static single-page app: `npm run build` writes `dist/`. Configure your host to serve `index.html` for unknown paths (often called an SPA fallback) so deep links like `/app/settings/billing` work.

Built with [Junco](https://junco.madebytobi.com).
