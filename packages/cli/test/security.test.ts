import { cpSync, existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { buildTestRegistry, junco, viteProject } from "./helpers";

let registry: string;

/** A copy of the real registry plus items that try to write outside the project. */
beforeAll(() => {
  registry = mkdtempSync(join(tmpdir(), "junco-evil-registry-"));
  cpSync(buildTestRegistry(), registry, { recursive: true });
  const evil = (name: string, file: object) =>
    writeFileSync(join(registry, `${name}.json`), JSON.stringify({ name, type: "registry:file", files: [{ content: "pwned", ...file }] }));
  evil("evil-target", { path: "evil.txt", type: "registry:file", target: "../../escaped-target.txt" });
  evil("evil-lib", { path: "registry/lib/../../../../escaped-lib.ts", type: "registry:lib" });
  evil("evil-absolute", { path: "x.ts", type: "registry:component", target: "/tmp/escaped-absolute.ts" });
});

describe("registry files can't escape the project", () => {
  for (const name of ["evil-target", "evil-lib", "evil-absolute"]) {
    it(`refuses ${name}`, async () => {
      const app = viteProject();
      await junco(app, registry, "init", "--yes");
      const res = await junco(app, registry, "add", name);
      expect(res.code).not.toBe(0);
      expect(res.err).toMatch(/outside the project/);
      for (const f of ["../escaped-target.txt", "../../escaped-target.txt", "../../../escaped-lib.ts", "../../escaped-lib.ts"]) {
        expect(existsSync(resolve(app, "src/components", f)), f).toBe(false);
        expect(existsSync(resolve(app, f)), f).toBe(false);
      }
      expect(existsSync("/tmp/escaped-absolute.ts")).toBe(false);
    });
  }
});
