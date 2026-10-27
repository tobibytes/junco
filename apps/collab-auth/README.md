# Junco collaboration demo auth

This Cloudflare Worker mints Liveblocks access tokens for the **public, disposable** collaboration room shown on Junco's docs site. It is not a general auth service and must not be used to protect an app's private rooms. A caller can choose a guest name and user ID, but the token is restricted to one fixed demo room. The browser origin is checked as an additional boundary, not as user authentication.

## Configure and run

Create a Liveblocks project and set its secret key as an encrypted Worker secret:

```sh
pnpm --filter @junco/collab-auth-demo exec wrangler secret put LIVEBLOCKS_SECRET_KEY
pnpm --filter @junco/collab-auth-demo dev
```

For local preview, set `ALLOWED_ORIGINS` in `.dev.vars` (ignored by git) to include `http://localhost:3000`. Set the production allowlist in `wrangler.toml` or with `wrangler secret` only if it contains sensitive values.

## Deploy

```sh
pnpm --filter @junco/collab-auth-demo deploy
```

The Worker exposes `POST https://collab-auth.junco.madebytobi.com/auth` and `GET /health`. The service only accepts the fixed `ROOM_ID`; add any new public showcase room explicitly in code/config after reviewing its data and permissions.

For production apps, implement authorization next to the app's own sign-in and project membership checks. Verify the caller's session, look up room access from the app database, and grant only the permissions that user has. Keep the Liveblocks secret in server-side encrypted secrets. See [Liveblocks access token authentication](https://liveblocks.io/docs/api-reference/authentication/access-token).
