/**
 * Post-build checks for published packages:
 * - every JS file of a client component package starts with "use client" (React Server Components
 *   need it, and some bundler options silently strip it)
 * - packages that promise a lazy root entry don't import their heavy peers from it
 *
 *   node scripts/check-dist.ts
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const clientPackages = ["packages/react", "packages/blocks", "packages/three", "packages/motion"];
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
    const head = readFileSync(join(dist, file), "utf8").slice(0, 32).trimStart();
    if (!/^["']use client["'];?/.test(head)) problems.push(`${pkg}/dist/${file}: missing "use client" at the top`);
  }
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
