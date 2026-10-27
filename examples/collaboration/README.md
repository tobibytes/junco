# Collaboration workspace

This interactive example shows Junco's collaboration UI in two modes. Fake mode is ready out of the box and includes presence, comments, replies, reactions, history, sharing and a room activity feed. Live mode connects to a single public, disposable Liveblocks room when the auth endpoint is configured.

```sh
pnpm install
pnpm --filter @junco/example-collaboration dev
```

The example checks Junco's hosted demo service and enables Live mode when it is available. To run against a local Worker, set `VITE_JUNCO_COLLAB_AUTH_ENDPOINT=http://localhost:8787/auth` and add `http://localhost:5173` to the Worker development origin list. This public room is for demos and must never contain private user or project data. The analytics event list stays in local browser state and sends no data to an external service.

For private app rooms, use an auth endpoint beside your app's identity and membership checks. The hosted Junco endpoint grants access only to the public docs demo room.
