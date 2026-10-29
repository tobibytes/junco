# Deploying

The docs site (`apps/docs`) is a static Next.js export deployed to **Cloudflare Pages** as the project `junco-docs`, served at **https://junco.madebytobi.com**.

## How a deploy happens

**Pull requests** get a preview at `https://pr-<number>.junco-docs.pages.dev`; the workflow comments the link on the PR and updates it on every push.

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

## The remote MCP server

`apps/mcp-worker` is a Cloudflare Worker (`junco-mcp`) serving the Junco MCP tools over Streamable HTTP at **https://mcp.junco.madebytobi.com/mcp**. It's stateless and read-only: it reads the public registry at `https://junco.madebytobi.com/r`, caching each file with the Cache API for 5 minutes, and limits each IP to 60 requests a minute (a `ratelimits` binding). `GET /` explains how to add it.

**How a deploy happens:** a push to `main` that touches `packages/mcp`, `packages/tokens` or `apps/mcp-worker` runs the **Deploy MCP server** workflow (or run it by hand). It builds and tests the Worker, runs `wrangler deploy`, then checks the live endpoint answers an MCP `initialize`.

| What | Where |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` also needs Account → **Workers Scripts: Edit**, and Zone (`madebytobi.com`) → **Workers Routes: Edit** for the custom domain | GitHub → Settings → Secrets and variables → Actions |
| DNS: `mcp.junco.madebytobi.com` | Automatic: the Worker's `routes` entry has `custom_domain: true`, so Cloudflare creates the record and certificate on deploy. Nothing to add by hand while `madebytobi.com` is on Cloudflare |

By hand:

```bash
pnpm install
pnpm turbo run build --filter=mcp-worker...
pnpm --filter mcp-worker deploy
npx @modelcontextprotocol/inspector --cli https://mcp.junco.madebytobi.com/mcp --transport http --method tools/list
```
