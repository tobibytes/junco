# Junco collaboration build sessions

The collaboration feature stays in this monorepo. `@junco/collab` owns reusable React UI and client adapters; app repositories own sign-in, project membership, private-room permissions, and document persistence.

## Session 1: package, tracking, and demo foundation

- [x] Reusable fake-data UI for presence, comments, reactions, history, sharing, save state and room activity
- [x] Liveblocks client adapter for presence, cursors, comments and comment activity
- [x] Optional typed analytics callback with content-free event payloads
- [x] Cloudflare Worker auth endpoint scoped to one public demo room
- [x] Interactive collaboration example that works in fake mode and can opt into the live room
- [x] Docs updated with install, auth boundaries, activity and analytics guidance

## Session 2: hosted demo room

- [x] Give the Worker a stable Cloudflare custom domain and add a deployment workflow
- [x] Configure the website example to check the stable endpoint health and enable the Live mode only when it is available
- [ ] Add the Liveblocks project secret and Cloudflare deployment credentials to GitHub Actions, deploy the Worker, and verify `POST /auth` plus two-client presence/comments
- [ ] Verify the production example at `https://junco.madebytobi.com/examples/collaboration/`

The credentials are intentionally not in the repo or this workspace. The existing GitHub Actions secrets include the Cloudflare token and account ID, but `LIVEBLOCKS_SECRET_KEY` is not configured yet. The deployment workflow safely skips the Worker until that secret is added. The Liveblocks demo is deliberately public and disposable, and its endpoint can issue access only to `junco:collaboration-demo`. This is not an authentication service for customer apps.

To unblock Session 2, create a Liveblocks project and add its secret API key as a repository Actions secret named `LIVEBLOCKS_SECRET_KEY` in GitHub. Do not paste the key into source control or chat.

## Session 3: release and website publication

- [ ] Review and merge the changes to main; docs deploy automatically through Cloudflare Pages
- [ ] Publish `@junco/collab` through the existing Changesets release workflow
- [ ] Verify the published package and live docs/example links

## Session 4: app-specific collaboration

- [ ] Add a real adapter for an adopted app only after its sign-in, project membership, and permissions are defined
- [ ] Connect sharing and any non-Liveblocks persistence to that app's authorization rules
- [ ] Add durable event storage only if the app needs an audit log; analytics callbacks are opt-in and application-owned
