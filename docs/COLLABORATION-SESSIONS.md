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

- [x] Add the Worker deployment workflow and configure the intended Cloudflare custom domain
- [x] Configure the website example to check the stable endpoint health and enable the Live mode only when it is available
- [ ] Add the Liveblocks project secret to GitHub Actions, deploy the Worker so Cloudflare provisions the custom domain, and verify `GET /health`, `POST /auth`, and two-client presence/comments
- [ ] Verify the production example at `https://junco.madebytobi.com/examples/collaboration/`

The GitHub Actions secrets include the Cloudflare token and account ID, but `LIVEBLOCKS_SECRET_KEY` is not configured yet. The deployment workflow safely skips the Worker until that secret is added. The configured custom domain does not resolve until the Worker is deployed. The Liveblocks demo is deliberately public and disposable, and its endpoint can issue access only to `junco:collaboration-demo`. This is not an authentication service for customer apps.

To unblock Session 2, create a Liveblocks project and add its secret API key as a repository Actions secret named `LIVEBLOCKS_SECRET_KEY` in GitHub. Do not paste the key into source control or chat.

## Session 3: release and website publication

- [x] Merge the collaboration implementation and deploy the docs through Cloudflare Pages
- [x] Publish `@junco/cli@0.3.0` through the existing Changesets release workflow
- [ ] Configure npm Trusted Publishing for `@junco/collab`, rerun the Release workflow, and verify `@junco/collab@0.2.0` is published
- [x] Verify the live docs and example links return HTTP 200

The first package release attempt published the CLI, then failed to publish `@junco/collab@0.2.0` because npm has no trusted publisher configured for the new package. Configure GitHub Actions as the trusted publisher on npm with organization/user `tobibytes`, repository `junco`, and workflow filename `release.yml`; then rerun the Release workflow. The failed publish does not affect the already-published CLI release.

## Session 4: app-specific collaboration

- [ ] Add a real adapter for an adopted app only after its sign-in, project membership, and permissions are defined
- [ ] Connect sharing and any non-Liveblocks persistence to that app's authorization rules
- [ ] Add durable event storage only if the app needs an audit log; analytics callbacks are opt-in and application-owned
