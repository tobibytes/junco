/**
 * Release publish step (run by changesets/action after the "Version packages" PR merges).
 * Without an NPM_TOKEN it skips publishing instead of failing, so the repo works before the
 * npm org is set up; with one, it publishes every bumped package with provenance.
 */
import { spawnSync } from "node:child_process";

if (!process.env.NPM_TOKEN) {
  console.log("::warning title=npm publish skipped::Add an NPM_TOKEN repository secret to publish to npm.");
  process.exit(0);
}
const run = spawnSync("pnpm", ["changeset", "publish"], { stdio: "inherit" });
process.exit(run.status ?? 1);
