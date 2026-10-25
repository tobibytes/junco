/**
 * Publishes every public package whose current version isn't on npm yet.
 *
 * In the Release workflow it runs after the "Version packages" PR merges and authenticates with
 * npm Trusted Publishing (GitHub OIDC): no token, and each version gets a provenance statement.
 * Locally (`pnpm release`) it uses your own npm login; npm asks for your 2FA code. That's how the
 * very first version of each package goes out, since a trusted publisher can only be added to a
 * package that already exists.
 *
 * Each package is packed with pnpm (which rewrites `workspace:*` ranges to real versions) and the
 * tarball is published with npm, which handles OIDC. Prints "New tag:" lines for changesets/action
 * and creates the git tags it pushes.
 */
import { spawnSync, type SpawnSyncOptions } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const inCI = process.env.GITHUB_ACTIONS === "true";
/** `--dry-run`: pack everything and list what would publish, without publishing. */
const dryRun = process.argv.includes("--dry-run");

function run(cmd: string, args: string[], opts: SpawnSyncOptions = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed (exit ${r.status})`);
  return r;
}

function isPublished(name: string, version: string) {
  const r = spawnSync("npm", ["view", `${name}@${version}`, "version"], { encoding: "utf8" });
  return r.status === 0 && r.stdout.trim() === version;
}

const packages = readdirSync(join(root, "packages"))
  .map((dir) => join(root, "packages", dir))
  .flatMap((dir) => {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      return pkg.private ? [] : [{ dir, name: pkg.name as string, version: pkg.version as string }];
    } catch {
      return [];
    }
  });

const pending = packages.filter((p) => !isPublished(p.name, p.version));
if (pending.length === 0) {
  console.log("Nothing to publish: every package version is already on npm.");
  process.exit(0);
}

const out = mkdtempSync(join(tmpdir(), "junco-publish-"));
const failed: string[] = [];
for (const p of pending) {
  try {
    console.log(`\nPublishing ${p.name}@${p.version}`);
    const before = new Set(readdirSync(out));
    run("pnpm", ["pack", "--pack-destination", out], { cwd: p.dir });
    const tarball = readdirSync(out).find((f) => !before.has(f));
    if (!tarball) throw new Error("pnpm pack produced no tarball");
    if (dryRun) {
      console.log(`(dry run) would publish ${tarball}`);
      continue;
    }
    run("npm", ["publish", join(out, tarball), "--access", "public", ...(inCI ? ["--provenance"] : [])]);
    console.log(`New tag: ${p.name}@${p.version}`);
  } catch (error) {
    console.error(`::error title=Publish failed::${p.name}@${p.version}: ${(error as Error).message}`);
    failed.push(`${p.name}@${p.version}`);
  }
}

// Git tags for what went out (changesets/action pushes them and creates GitHub Releases).
if (inCI && !dryRun) spawnSync("pnpm", ["changeset", "tag"], { stdio: "inherit", cwd: root });

if (failed.length) {
  console.error(`\nFailed: ${failed.join(", ")}`);
  if (inCI) console.error("If this is the first version of a package, publish it once locally (pnpm release) and add the trusted publisher on npmjs.com.");
  process.exit(1);
}
