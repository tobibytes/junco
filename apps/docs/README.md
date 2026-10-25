# Junco website (not scaffolded yet)

Create it in phase 2 with Next.js (App Router), Tailwind v4 and the workspace packages:

```bash
pnpm create next-app@latest apps/docs --ts --tailwind --app --eslint --no-src-dir
```

Then add `"junco": "workspace:*"` and `"@junco/tailwind": "workspace:*"`, and import `@junco/tailwind` in `app/globals.css`.

The site map and every section's contents are in `docs/PLAN.md` under "The website".
