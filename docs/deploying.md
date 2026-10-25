# Deploying the site

The docs site (`apps/docs`) is a static Next.js export deployed to **Cloudflare Pages** as the project `junco-docs`, served at **https://junco.madebytobi.com**.

## How a deploy happens

1. A push to `main` runs the **Deploy docs** workflow (or run it by hand from the Actions tab).
2. It builds the registry and `llms.txt` into `apps/docs/public`, then builds the site to `apps/docs/out`.
3. It creates the Pages project if it doesn't exist, deploys, and attaches the custom domain.

## One-time setup

| What | Where |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` (permission: Account → Cloudflare Pages → Edit) | GitHub → Settings → Secrets and variables → Actions |
| `CLOUDFLARE_ACCOUNT_ID` | same place |
| DNS: `junco` CNAME → `junco-docs.pages.dev` | Your DNS provider. Automatic if `madebytobi.com` is on Cloudflare |

## Deploying by hand

```bash
pnpm install
pnpm --filter docs build
npx wrangler pages deploy apps/docs/out --project-name junco-docs
```

## What the site serves

| Path | What |
| --- | --- |
| `/r/registry.json`, `/r/<name>.json` | Copy-in registry (shadcn compatible) |
| `/llms.txt`, `/llms-full.txt` | Docs for AI tools |
| `/schema/junco.json` | Schema for `junco.json` |
