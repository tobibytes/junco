# Admin panel template

An internal admin panel built from Junco blocks and pages: sign-in, an overview dashboard, users with detail pages, settings, and a ⌘K command palette. Light and dark, phone to desktop, realistic fake data everywhere.

```bash
npx @junco/cli create my-admin --template admin
cd my-admin
npm run dev
```

## What's inside

| Route | Page |
| --- | --- |
| `/login`, `/forgot-password` | Sign-in (no sign-up: admins are invited) |
| `/` | Overview dashboard |
| `/users`, `/users/:id` | Users table and user detail |
| `/settings/*` | Profile, team, API keys, notifications |

Press ⌘K (Ctrl+K on Windows and Linux) anywhere to jump to a page or a person.

## Make it yours

- **Name:** `src/config.ts`. The sidebar and settings tabs are at the top of `src/routes/app.tsx`. The accent color is `--primary` in your CSS.
- **Auth:** `src/lib/auth.tsx` is fake (any email signs in, the session lives in localStorage). Replace `signIn` and `signOut` with your provider; `RequireAuth` guards every page except sign-in.
- **Data:** `people` in `src/routes/app.tsx` stands in for your users API. Pass real data as props and handle changes with the `on*` callbacks (`onUsersChange`, `onSuspend`, ...).
- **Pages:** the routes are in `src/app.tsx`, each loaded on demand.

## Deploying

It's a static single-page app: `npm run build` writes `dist/`. Configure your host to serve `index.html` for unknown paths (often called an SPA fallback) so deep links like `/users/usr_3uw` work.

Built with [Junco](https://junco.madebytobi.com).
