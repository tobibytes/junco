# Releasing

Junco publishes eight packages to npm: `@junco/react`, `@junco/tokens`, `@junco/tailwind`, `@junco/blocks`, `@junco/motion`, `@junco/three`, `@junco/cli`, `@junco/mcp`. Everything under `apps/` and `examples/` is private and never published.

## Status

| What | State |
| --- | --- |
| Docs site | Live at https://junco.madebytobi.com (deploys on every push to `main`) |
| PR previews | `https://pr-<number>.junco-docs.pages.dev`, linked in a comment on each PR |
| Registry (copy-in, shadcn compatible) | Live at https://junco.madebytobi.com/r/registry.json |
| npm | All 8 `@junco/*` packages live; the Release workflow publishes with Trusted Publishing (no token) and provenance |
| GitHub Releases | Created automatically for each package when it publishes |

## How a release happens

1. Each PR that changes a published package adds a changeset: `pnpm changeset`, pick the packages and the bump, and write one line users will read. CI warns when one is missing.
2. When PRs land on `main`, the **Release** workflow opens or updates a **chore: version packages** PR with the new versions and changelogs (and syncs `packages/mcp/server.json`).
3. Merging that PR runs `pnpm release` (`scripts/publish.ts`): every package version not yet on npm is packed and published with [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (GitHub OIDC, no token) and [provenance](https://docs.npmjs.com/generating-provenance-statements). A GitHub Release is created per package.

`node scripts/publish.ts --dry-run` packs everything and lists what would publish.

## One-time setup

1. **npm org:** create the `junco` organization on npmjs.com (gives the `@junco/*` scope). (The unscoped `junco` name is blocked by npm as too similar to `juice`, so the React package is `@junco/react`.)
2. **First publish, by hand (once):** a trusted publisher can only be added to a package that exists. From a clone, logged in with `npm login`: `pnpm install && pnpm build && pnpm release`. npm asks for your 2FA code for each package.
3. **Trusted publisher, per package:** on npmjs.com open each of the eight packages → Settings → Trusted Publisher → GitHub Actions: owner `tobibytes`, repository `junco`, workflow `release.yml`. Then, under Publishing access, choose *Require two-factor authentication and disallow tokens*. No `NPM_TOKEN` secret is needed.
4. **Let Actions open PRs:** GitHub → Settings → Actions → General → *Allow GitHub Actions to create and approve pull requests*. Without it the version PR can't be opened.
5. **Default branch:** Settings → General → set to `main`.

## Adding a new package

A package that has never been on npm can't publish through Trusted Publishing yet. Keep it `"private": true` (the Release workflow skips private packages) until its first publish:

1. Remove `"private": true`, add a changeset, and set the version you want to ship.
2. From a clone, logged in with `npm login`: `pnpm install && pnpm build && cd packages/<name> && npm publish --access public`.
3. On npmjs.com add the trusted publisher for it (as in step 3 above) and disallow tokens.
4. Merge the change; later versions publish from CI.

Published this way: `@junco/collab` (0.1.0), `@junco/editor`.

## Swift

The Swift package (`JuncoTokens`, `JuncoUI`) isn't on npm. SwiftPM reads plain semver git tags, so a Swift release is a tag on `main`:

```bash
git checkout main && git pull
swift build && swift test
git tag -a 0.1.1 -m "Junco for Swift 0.1.1" && git push origin 0.1.1
```

Then add a GitHub release for the tag with the changes. The npm tags (`@junco/react@0.4.0`) don't clash: SwiftPM ignores anything that isn't plain semver. Bump the patch for fixes and the minor for new or breaking API; apps pin with `.upToNextMinor(from:)`.

Released: `0.1.0`.

## Versioning

Pre-1.0, a minor bump may include breaking changes; call them out in the changeset. 1.0 ships when one real project runs on Junco (see the [roadmap](ROADMAP.md)).

## After the first npm release

- Publish the MCP server to the official MCP Registry: `cd packages/mcp && mcp-publisher login github && mcp-publisher publish`.
- Work through the listings in [launch.md](launch.md).
