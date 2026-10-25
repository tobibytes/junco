// Generates the registry JSON (public/r) and llms.txt before a docs build, once the
// `registry:build` script exists at the repo root. Until then this is a no-op.
import { execSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";

const root = JSON.parse(readFileSync(new URL("../../../package.json", import.meta.url), "utf8"));
if (root.scripts?.["registry:build"]) {
  execSync("pnpm -w run registry:build", { stdio: "inherit" });
} else {
  console.log("docs prebuild: no registry:build script yet, skipping");
}

// Live demos: copy each example's built site (examples/<slug>/dist) to public/demos/<slug>/ so the
// docs site serves it at /demos/<slug>/. Turbo builds the examples first (they're devDependencies).
const examplesDir = new URL("../../../examples/", import.meta.url);
const demosDir = new URL("../public/demos/", import.meta.url);
rmSync(demosDir, { recursive: true, force: true });
let copied = 0;
for (const dir of readdirSync(examplesDir)) {
  const meta = new URL(`${dir}/example.json`, examplesDir);
  const dist = new URL(`${dir}/dist/`, examplesDir);
  if (!existsSync(meta)) continue;
  if (!existsSync(dist)) {
    console.warn(`docs prebuild: examples/${dir} has no dist/ yet; its live demo is skipped`);
    continue;
  }
  const { slug } = JSON.parse(readFileSync(meta, "utf8"));
  cpSync(dist, new URL(`${slug}/`, demosDir), { recursive: true });
  copied++;
}
console.log(`docs prebuild: copied ${copied} live demos to public/demos`);
