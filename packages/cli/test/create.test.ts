import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { invokingPackageManager, packageNameFor } from "../src/commands";
import { buildTestRegistry, junco, read } from "./helpers";

let registry: string;
beforeAll(() => {
  registry = buildTestRegistry();
});

const workspace = () => mkdtempSync(join(tmpdir(), "junco-create-"));

describe("junco create", () => {
  for (const template of ["saas", "admin"]) {
    it(`creates a runnable ${template} app with published package versions`, async () => {
      const cwd = workspace();
      const res = await junco(cwd, registry, "create", "My App", "--template", template);
      expect(res.err).toBe("");
      expect(res.code).toBe(0);
      const app = join(cwd, "My App");
      for (const f of ["package.json", "index.html", "vite.config.ts", "tsconfig.json", ".gitignore", "README.md", "src/main.tsx", "src/app.tsx"]) {
        expect(existsSync(join(app, f)), f).toBe(true);
      }
      expect(existsSync(join(app, "template.json"))).toBe(false);
      const pkg = JSON.parse(read(app, "package.json"));
      expect(pkg.name).toBe("my-app");
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const [dep, range] of Object.entries<string>(deps)) expect(range, dep).not.toMatch(/^workspace:/);
      expect(deps["@junco/react"]).toMatch(/^\^\d+\.\d+\.\d+$/);
      expect(deps["@junco/blocks"]).toMatch(/^\^\d+\.\d+\.\d+$/);
      // A template must stand alone: no paths back into the monorepo.
      expect(read(app, "tsconfig.json")).not.toMatch(/\.\.\//);
      // Folder names with spaces are quoted; the package manager is whichever ran the CLI.
      expect(res.out).toMatch(/Next:\s+cd "My App"\s+(npm|pnpm|yarn|bun) install\s+(npm run|pnpm|yarn|bun) dev/);
    });
  }

  it("lists the templates", async () => {
    const res = await junco(workspace(), registry, "create", "--list");
    expect(res.code).toBe(0);
    expect(res.out).toMatch(/^admin\s+/m);
    expect(res.out).toMatch(/^saas\s+/m);
  });

  it("asks for a template when none is given (and fails without a prompt)", async () => {
    const res = await junco(workspace(), registry, "create", "app");
    expect(res.code).not.toBe(0);
    expect(res.err).toMatch(/--template: .*admin.*saas|--template: .*saas/);
  });

  it("refuses a folder that already has files, and writes nothing", async () => {
    const cwd = workspace();
    mkdirSync(join(cwd, "app"));
    writeFileSync(join(cwd, "app", "notes.txt"), "mine");
    const res = await junco(cwd, registry, "create", "app", "--template", "saas");
    expect(res.code).not.toBe(0);
    expect(res.err).toMatch(/isn't empty/);
    expect(readdirSync(join(cwd, "app"))).toEqual(["notes.txt"]);
  });

  it("allows an empty folder or one with only .git", async () => {
    const cwd = workspace();
    mkdirSync(join(cwd, "app", ".git"), { recursive: true });
    const res = await junco(cwd, registry, "create", "app", "--template", "admin");
    expect(res.code).toBe(0);
  });

  it("reports unknown and malformed template names", async () => {
    const unknown = await junco(workspace(), registry, "create", "app", "--template", "crm-pro");
    expect(unknown.err).toMatch(/Unknown template "crm-pro"/);
    const bad = await junco(workspace(), registry, "create", "app", "--template", "../../etc");
    expect(bad.err).toMatch(/isn't a template name/);
  });

  it("refuses a template that writes outside the new folder, before writing anything", async () => {
    const evil = mkdtempSync(join(tmpdir(), "junco-evil-templates-"));
    cpSync(registry, evil, { recursive: true });
    writeFileSync(
      join(evil, "templates", "evil.json"),
      JSON.stringify({ name: "evil", files: [{ path: "ok.txt", content: "fine" }, { path: "../escaped.txt", content: "pwned" }] }),
    );
    const cwd = workspace();
    const res = await junco(cwd, evil, "create", "app", "--template", "evil");
    expect(res.code).not.toBe(0);
    expect(res.err).toMatch(/outside the project/);
    expect(existsSync(resolve(cwd, "escaped.txt"))).toBe(false);
    expect(existsSync(join(cwd, "app", "ok.txt"))).toBe(false);
  });
});

describe("create helpers", () => {
  it("turns folder names into package names", () => {
    expect(packageNameFor("My App")).toBe("my-app");
    expect(packageNameFor("/tmp/projects/acme_dashboard")).toBe("acme_dashboard");
    expect(packageNameFor(".hidden")).toBe("hidden");
  });

  it("picks the package manager that ran the CLI", () => {
    expect(invokingPackageManager("pnpm/10.18.0 npm/? node/v24.0.0 darwin arm64")).toBe("pnpm");
    expect(invokingPackageManager("yarn/4.5.0 npm/? node/v24.0.0")).toBe("yarn");
    expect(invokingPackageManager("bun/1.2.0")).toBe("bun");
    expect(invokingPackageManager("npm/11.0.0 node/v24.0.0")).toBe("npm");
    expect(invokingPackageManager("")).toBe("npm");
  });
});
