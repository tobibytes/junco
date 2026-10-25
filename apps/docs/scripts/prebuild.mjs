// Generates the registry JSON (public/r) and llms.txt before a docs build, once the
// `registry:build` script exists at the repo root. Until then this is a no-op.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = JSON.parse(readFileSync(new URL("../../../package.json", import.meta.url), "utf8"));
if (root.scripts?.["registry:build"]) {
  execSync("pnpm -w run registry:build", { stdio: "inherit" });
} else {
  console.log("docs prebuild: no registry:build script yet, skipping");
}
