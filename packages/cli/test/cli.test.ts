import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { unifiedDiff } from "../src/diff";
import { parseJsonc } from "../src/fs-utils";
import { buildTestRegistry, junco, makeProject, read, viteProject } from "./helpers";

let registry: string;
beforeAll(() => {
  registry = buildTestRegistry();
});

const config = (dir: string) => JSON.parse(read(dir, "junco.json"));

describe("registry build", () => {
  const load = (name: string) => JSON.parse(readFileSync(join(registry, `${name}.json`), "utf8"));

  it("gives every component a hash, docs and the theme as a dependency, with no relative imports left", () => {
    const index = load("registry");
    const ui = index.items.filter((i: { type: string }) => i.type === "registry:ui");
    expect(ui.length).toBeGreaterThan(10);
    for (const { name } of ui) {
      const item = load(name);
      expect(item.meta.hash, name).toMatch(/^[0-9a-f]{16}$/);
      expect(item.registryDependencies, name).toContain("https://junco.madebytobi.com/r/junco-theme.json");
      for (const file of item.files) {
        expect(file.content, `${name} ${file.path}`).not.toMatch(/from\s+["']\.\.?\//);
        expect(file.content, `${name} ${file.path}`).not.toMatch(/lib\/primitives/);
      }
      for (const dep of item.dependencies ?? []) expect(dep, name).toMatch(/^(@[\w-]+\/)?[\w.-]+@\S+$/);
    }
  });

  it("keeps the index light and the theme complete", () => {
    const index = load("registry");
    expect(index.name).toBe("junco");
    for (const item of index.items) {
      expect(item.css, item.name).toBeUndefined();
      for (const file of item.files ?? []) expect(file.content, item.name).toBeUndefined();
    }
    const theme = load("junco-theme");
    expect(theme.cssVars.light.primary).toMatch(/^oklch/);
    expect(theme.cssVars.dark.primary).toMatch(/^oklch/);
    expect(theme.cssVars.theme["color-primary"]).toBe("var(--primary)");
    expect(Object.keys(theme.css)).toEqual(expect.arrayContaining(["@layer components", "@utility duration-fast", "@keyframes pop-in"]));
  });

  it("is deterministic", () => {
    const again = buildTestRegistry();
    for (const name of ["button", "select", "junco-theme", "registry"]) {
      expect(readFileSync(join(again, `${name}.json`), "utf8"), name).toBe(readFileSync(join(registry, `${name}.json`), "utf8"));
    }
  });
});

describe("junco init", () => {
  it("sets up a Vite app with the @/ alias and the package theme", async () => {
    const app = viteProject();
    const res = await junco(app, registry, "init", "--yes");
    expect(res.code, res.err).toBe(0);
    const cfg = config(app);
    expect(cfg.framework).toBe("vite");
    expect(cfg.aliases.ui).toBe("@/components/ui");
    expect(cfg.paths).toEqual({ components: "src/components", ui: "src/components/ui", lib: "src/lib" });
    expect(read(app, "src/index.css")).toBe(`@import "tailwindcss";\n@import "@junco/tailwind";\n\nbody { margin: 0; }\n`);
    expect(read(app, "src/lib/utils.ts")).toContain("export function cn");
    expect(res.out).toMatch(/npm install @junco\/tailwind/);
    expect(cfg.installed.utils.hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it("inlines the theme CSS when asked", async () => {
    const app = viteProject();
    const res = await junco(app, registry, "init", "--css", "inline");
    expect(res.code, res.err).toBe(0);
    expect(read(app, "src/index.css")).toContain(`@import "./styles/junco.css";`);
    const css = read(app, "src/styles/junco.css");
    expect(css).toContain("--background: oklch(");
    expect(css).toContain("@theme inline");
    expect(css).toContain(".btn {");
    expect(css).not.toMatch(/@import\s+"@junco/);
  });

  it("is idempotent and refuses to clobber without --force", async () => {
    const app = viteProject();
    await junco(app, registry, "init", "--yes");
    const res = await junco(app, registry, "init", "--yes");
    expect(res.out).toMatch(/already exists/);
    expect(read(app, "src/index.css").match(/@junco\/tailwind/g)).toHaveLength(1);
  });

  it("explains what's missing when Tailwind isn't set up", async () => {
    const app = makeProject({ "package.json": "{}", "src/index.css": "body {}" });
    const res = await junco(app, registry, "init", "--yes");
    expect(res.code).toBe(1);
    expect(res.err).toMatch(/Tailwind/);
  });

  it("detects Next.js and its globals.css", async () => {
    const app = makeProject({
      "package.json": JSON.stringify({ dependencies: { next: "15.0.0", react: "19.0.0" } }),
      "tsconfig.json": JSON.stringify({ compilerOptions: { paths: { "@/*": ["./*"] } } }),
      "app/globals.css": `@import "tailwindcss";\n`,
    });
    const res = await junco(app, registry, "init", "--yes");
    expect(res.code, res.err).toBe(0);
    expect(config(app).framework).toBe("next");
    expect(config(app).paths.ui).toBe("components/ui");
    expect(existsSync(join(app, "lib/utils.ts"))).toBe(true);
  });
});

describe("junco add", () => {
  it("adds a component with its registry dependencies and rewrites imports", async () => {
    const app = viteProject();
    await junco(app, registry, "init", "--yes");
    const res = await junco(app, registry, "add", "select");
    expect(res.code, res.err).toBe(0);
    const select = read(app, "src/components/ui/select.tsx");
    expect(select).toContain(`from "@/lib/utils"`);
    expect(select).toContain(`from "@/lib/junco/icons"`);
    expect(select).toContain(`from "@/components/ui/field"`);
    expect(select).toContain(`import * as SelectPrimitive from "@radix-ui/react-select"`);
    expect(select).not.toContain("../lib/");
    for (const f of ["src/components/ui/field.tsx", "src/components/ui/label.tsx", "src/lib/junco/icons.tsx"]) {
      expect(existsSync(join(app, f)), f).toBe(true);
    }
    expect(res.out).toMatch(/@radix-ui\/react-select/);
    expect(Object.keys(config(app).installed).sort()).toEqual(["field", "icons", "label", "select", "utils"]);
  });

  it("writes relative imports when the project has no alias", async () => {
    const app = viteProject(false);
    await junco(app, registry, "init", "--yes");
    expect(config(app).aliases).toBeNull();
    await junco(app, registry, "add", "select");
    const select = read(app, "src/components/ui/select.tsx");
    expect(select).toContain(`from "../../lib/utils"`);
    expect(select).toContain(`from "../../lib/junco/icons"`);
    expect(select).toContain(`from "./field"`);
  });

  it("keeps files you changed unless --overwrite", async () => {
    const app = viteProject();
    await junco(app, registry, "init", "--yes");
    await junco(app, registry, "add", "badge");
    const path = join(app, "src/components/ui/badge.tsx");
    writeFileSync(path, readFileSync(path, "utf8") + "\n// mine\n");
    const res = await junco(app, registry, "add", "badge");
    expect(res.err).toMatch(/changed by you/);
    expect(read(app, "src/components/ui/badge.tsx")).toContain("// mine");
    await junco(app, registry, "add", "badge", "--overwrite");
    expect(read(app, "src/components/ui/badge.tsx")).not.toContain("// mine");
  });

  it("fails clearly on unknown names and without init", async () => {
    const app = viteProject();
    const noInit = await junco(app, registry, "add", "button");
    expect(noInit.code).toBe(1);
    expect(noInit.err).toMatch(/junco init/);
    await junco(app, registry, "init", "--yes");
    const res = await junco(app, registry, "add", "nope");
    expect(res.code).toBe(1);
    expect(res.err).toMatch(/Unknown component "nope"/);
  });
});

/** Simulates an upstream release by editing an item in a private copy of the registry. */
function forkRegistry(): string {
  const copy = buildTestRegistry();
  return copy;
}

function bumpUpstream(reg: string, name: string, edit: (content: string) => string) {
  const file = join(reg, `${name}.json`);
  const item = JSON.parse(readFileSync(file, "utf8"));
  item.files[0].content = edit(item.files[0].content);
  item.meta.hash = "f".repeat(16);
  writeFileSync(file, JSON.stringify(item));
  const indexFile = join(reg, "registry.json");
  const index = JSON.parse(readFileSync(indexFile, "utf8"));
  index.items.find((i: { name: string }) => i.name === name).meta.hash = item.meta.hash;
  writeFileSync(indexFile, JSON.stringify(index));
}

describe("junco diff / update", () => {
  it("diff shows local edits against upstream", async () => {
    const app = viteProject();
    await junco(app, registry, "init", "--yes");
    await junco(app, registry, "add", "kbd");
    const path = join(app, "src/components/ui/kbd.tsx");
    writeFileSync(path, readFileSync(path, "utf8").replace("font-mono", "font-sans"));
    const res = await junco(app, registry, "diff", "kbd");
    expect(res.out).toContain("--- local/src/components/ui/kbd.tsx");
    expect(res.out).toMatch(/^-.*font-sans/m);
    expect(res.out).toMatch(/^\+.*font-mono/m);
  });

  it("updates untouched files, and reports which items have updates", async () => {
    const reg = forkRegistry();
    const app = viteProject();
    await junco(app, reg, "init", "--yes");
    await junco(app, reg, "add", "kbd");
    bumpUpstream(reg, "kbd", (c) => c.replace("min-w-5", "min-w-6"));
    expect((await junco(app, reg, "diff")).out).toMatch(/kbd: update available/);
    expect((await junco(app, reg, "list", "--installed")).out).toMatch(/kbd .*\[update available\]/);
    const res = await junco(app, reg, "update", "kbd");
    expect(res.code, res.err).toBe(0);
    expect(read(app, "src/components/ui/kbd.tsx")).toContain("min-w-6");
    expect(config(app).installed.kbd.hash).toBe("f".repeat(16));
    expect((await junco(app, reg, "update", "kbd")).out).toMatch(/up to date/);
  });

  it("writes a side file on conflict, then --resolved or --force settle it", async () => {
    const reg = forkRegistry();
    const app = viteProject();
    await junco(app, reg, "init", "--yes");
    await junco(app, reg, "add", "kbd");
    const path = join(app, "src/components/ui/kbd.tsx");
    writeFileSync(path, readFileSync(path, "utf8") + "\n// local tweak\n");
    bumpUpstream(reg, "kbd", (c) => c.replace("min-w-5", "min-w-6"));

    const res = await junco(app, reg, "update", "kbd");
    expect(res.code).toBe(1);
    expect(res.err).toMatch(/kbd\.tsx\.junco-upstream/);
    expect(read(app, "src/components/ui/kbd.tsx")).toContain("// local tweak");
    expect(read(app, "src/components/ui/kbd.tsx.junco-upstream")).toContain("min-w-6");
    expect(config(app).installed.kbd.hash).not.toBe("f".repeat(16));

    // merge by hand, then mark resolved
    writeFileSync(path, read(app, "src/components/ui/kbd.tsx.junco-upstream") + "\n// local tweak\n");
    const resolved = await junco(app, reg, "update", "kbd", "--resolved");
    expect(resolved.code, resolved.err).toBe(0);
    expect(config(app).installed.kbd.hash).toBe("f".repeat(16));

    // a later --force takes upstream and drops the tweak
    bumpUpstream(reg, "kbd", (c) => c.replace("min-w-6", "min-w-7"));
    const forced = await junco(app, reg, "update", "kbd", "--force");
    expect(forced.code, forced.err).toBe(0);
    expect(read(app, "src/components/ui/kbd.tsx")).not.toContain("// local tweak");
    expect(read(app, "src/components/ui/kbd.tsx")).toContain("min-w-7");
  });
});

describe("junco list / help", () => {
  it("lists components but not theme items", async () => {
    const app = viteProject();
    const res = await junco(app, registry, "list");
    expect(res.out).toMatch(/^button\s+ui/m);
    expect(res.out).toMatch(/^utils\s+lib/m);
    expect(res.out).not.toMatch(/junco-theme|junco-css/);
  });

  it("prints help and rejects unknown commands", async () => {
    const app = viteProject();
    expect((await junco(app, registry, "--help")).out).toMatch(/junco init/);
    expect((await junco(app, registry, "frobnicate")).code).toBe(1);
    expect((await junco(app, registry, "eject", "button")).out).toMatch(/isn't built yet/);
  });
});

describe("helpers", () => {
  it("parses JSON with comments and trailing commas", () => {
    expect(parseJsonc(`{ // c\n "a": "http://x", /* b */ "b": [1,2,], }`)).toEqual({ a: "http://x", b: [1, 2] });
  });

  it("produces a valid unified diff", () => {
    const patch = unifiedDiff("a\nb\nc\n", "a\nB\nc\n", "x", "y");
    expect(patch).toBe("--- x\n+++ y\n@@ -1,3 +1,3 @@\n a\n-b\n+B\n c\n");
    expect(unifiedDiff("same", "same", "x", "y")).toBe("");
    expect(unifiedDiff("a", "a\n", "x", "y")).toBe("--- x\n+++ y\n@@ -1,1 +1,1 @@\n-a\n\\ No newline at end of file\n+a\n");
  });

  it.skipIf(spawnSync("patch", ["--version"]).status !== 0)("round-trips random edits through GNU patch", () => {
    let seed = 7;
    const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const dir = mkdtempSync(join(tmpdir(), "junco-diff-"));
    for (let t = 0; t < 150; t++) {
      const a = Array.from({ length: Math.floor(rand() * 30) }, (_, i) => `line ${i} ${Math.floor(rand() * 4)}`);
      const b = [...a];
      for (let e = 0; e < Math.floor(rand() * 6); e++) {
        const pos = Math.floor(rand() * (b.length + 1));
        const r = rand();
        if (r < 0.33) b.splice(pos, 1);
        else if (r < 0.66) b.splice(pos, 0, `new ${e}`);
        else b[pos] = `changed ${e}`;
      }
      const before = a.join("\n") + (rand() < 0.5 ? "\n" : "");
      const after = b.join("\n") + (rand() < 0.5 ? "\n" : "");
      const patch = unifiedDiff(before, after, "f", "f");
      if (!patch) {
        expect(before).toBe(after);
        continue;
      }
      writeFileSync(join(dir, "f"), before);
      writeFileSync(join(dir, "p"), patch);
      const res = spawnSync("patch", ["-s", join(dir, "f"), join(dir, "p")]);
      expect(res.status, `case ${t}: ${res.stderr}`).toBe(0);
      expect(readFileSync(join(dir, "f"), "utf8"), `case ${t}`).toBe(after);
    }
  });
});
