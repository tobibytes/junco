/**
 * Post-build checks for published packages:
 * - every JS file of a client component package starts with "use client" (React Server Components
 *   need it, and some bundler options silently strip it)
 * - packages that promise a lazy root entry don't import their heavy peers from it
 *
 *   node scripts/check-dist.ts
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const clientPackages = ["packages/react", "packages/blocks", "packages/three", "packages/motion", "packages/collab", "packages/editor"];
// Server-safe entries: must NOT be client modules, and must not pull in client chunks.
const serverEntries = ["packages/react/dist/server.js"];
const lazyRoots: Record<string, RegExp> = {
  "packages/three/dist/index.js": /from\s+["'](three|@react-three\/[^"']+)["']/,
};

const problems: string[] = [];
let checked = 0;

for (const pkg of clientPackages) {
  const dist = join(root, pkg, "dist");
  if (!existsSync(dist)) continue;
  for (const file of readdirSync(dist, { recursive: true }) as string[]) {
    if (!file.endsWith(".js")) continue;
    checked++;
    if (serverEntries.includes(`${pkg}/dist/${file}`)) continue;
    const head = readFileSync(join(dist, file), "utf8").slice(0, 32).trimStart();
    if (!/^["']use client["'];?/.test(head)) problems.push(`${pkg}/dist/${file}: missing "use client" at the top`);
  }
}

for (const file of serverEntries) {
  const abs = join(root, file);
  if (!existsSync(abs)) continue;
  const src = readFileSync(abs, "utf8");
  if (/^\s*["']use client["']/.test(src)) problems.push(`${file}: must not be a client module`);
  if (/from\s+["']\.\/chunk-/.test(src)) problems.push(`${file}: imports a shared (client) chunk`);
  // Load it the way a server component would: React's server build has no createContext/hooks.
  const run = spawnSync(process.execPath, ["--conditions=react-server", "--input-type=module", "-e", `await import(${JSON.stringify(abs)})`], {
    cwd: join(root, file.split("/dist/")[0]!),
    encoding: "utf8",
  });
  if (run.status !== 0) problems.push(`${file}: fails to load in a server component: ${(run.stderr.match(/\w*Error: .*/) ?? [run.stderr.trim()])[0]}`);
}

for (const [file, forbidden] of Object.entries(lazyRoots)) {
  const abs = join(root, file);
  if (existsSync(abs) && forbidden.test(readFileSync(abs, "utf8"))) problems.push(`${file}: imports a heavy peer it should load lazily`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check-dist: ${checked} files OK`);
