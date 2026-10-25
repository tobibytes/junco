# Releasing

Junco publishes these packages to npm: `junco`, `@junco/tokens`, `@junco/tailwind`, `@junco/blocks`, `@junco/three`, `@junco/cli`, `@junco/mcp`. Everything under `apps/` and `examples/` is private.

## Flow

1. In your PR, run `pnpm changeset`, pick the packages and the bump, and write one line users will read.
2. When PRs land on `main`, the **Release** workflow opens or updates a **Version packages** PR with the bumped versions and changelogs.
3. Merging that PR publishes to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements).

## One-time setup

- Create the `@junco` org on npm, and make sure the `junco` name is claimable (it was unpublished in 2022 and has no versions).
- Add an npm automation token as the `NPM_TOKEN` repository secret.

## Versioning

Pre-1.0, a minor bump can include breaking changes; call them out in the changeset. 1.0 ships when one real project runs on Junco (see the roadmap).
