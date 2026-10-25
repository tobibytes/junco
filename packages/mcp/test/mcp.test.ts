import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../../../scripts/build-registry.ts";
import {
  createServer,
  getComponent,
  getInstallInstructions,
  getTokens,
  listBlocks,
  listComponents,
  Registry,
  search,
} from "../src/server";

let dir: string;
let registry: Registry;
beforeAll(() => {
  const outDir = mkdtempSync(join(tmpdir(), "junco-mcp-"));
  buildRegistry({ outDir, quiet: true });
  dir = join(outDir, "r");
  registry = new Registry(dir);
});

describe("tools", () => {
  it("lists components and leaves out theme and lib plumbing", async () => {
    const names = (await listComponents(registry)).map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(["button", "select", "radio-group", "tooltip"]));
    expect(names).not.toContain("junco-theme");
    expect(names).not.toContain("utils");
  });

  it("list_blocks returns only blocks and pages", async () => {
    const blocks = await listBlocks(registry);
    expect(blocks.every((b) => b.type === "block" || b.type === "page")).toBe(true);
  });

  it("search ranks exact names first and tolerates typos", async () => {
    expect((await search(registry, "select"))[0]!.name).toBe("select");
    expect((await search(registry, "chkbox")).map((r) => r.name)).toContain("checkbox");
    expect((await search(registry, "loading")).map((r) => r.name)).toEqual(expect.arrayContaining(["spinner", "skeleton"]));
    expect(await search(registry, "zzzzqqq")).toEqual([]);
  });

  it("get_component covers all four levels, variants, props and source", async () => {
    const doc = await getComponent(registry, "button");
    expect(doc).toContain("# Button");
    expect(doc).toMatch(/classes: \.btn /);
    expect(doc).toContain("npx @junco/cli add button");
    expect(doc).toContain('import { Button } from "junco"');
    expect(doc).toMatch(/- variant: solid \| outline \| soft \| ghost \| danger \(default: solid\)/);
    expect(doc).toContain("`isLoading?: boolean`");
    expect(doc).toContain("## Source: button.tsx");
  });

  it("get_component can skip the source and reports components with no CSS version", async () => {
    const doc = await getComponent(registry, "tooltip", { includeSource: false });
    expect(doc).not.toContain("## Source");
    const select = await getComponent(registry, "select", { includeSource: false });
    expect(select).toContain("SelectTrigger props");
    expect(select).toContain("Registry dependencies: field, icons, junco-theme, utils");
  });

  it("get_component suggests near names on a miss", async () => {
    await expect(getComponent(registry, "buton")).rejects.toThrow(/Did you mean: button/);
    await expect(getComponent(registry, "../secret")).rejects.toThrow(/No component/);
  });

  it("get_tokens returns summaries, filters, CSS and W3C JSON", async () => {
    const summary = await getTokens("summary", "primary");
    expect(summary).toMatch(/--primary: oklch\(0\.55 0\.2 260\)\s+\(dark: oklch\(0\.68 0\.17 260\)\)/);
    expect(summary).not.toContain("--background:");
    expect(summary).toContain("--primary-foreground:");
    const ring = await getTokens("summary", "ring");
    expect(ring).toContain("--ring:");
    expect(ring).not.toContain("--ease-spring");
    expect(await getTokens("css")).toContain(":root {");
    expect(JSON.parse(await getTokens("json")).color.primary.$type).toBe("color");
  });

  it("install instructions differ per framework", () => {
    expect(getInstallInstructions("next")).toContain("app/globals.css");
    expect(getInstallInstructions("next")).toContain("themeScript");
    expect(getInstallInstructions("vite")).toContain("@tailwindcss/vite");
    expect(getInstallInstructions("html")).not.toContain("npx @junco/cli add");
  });
});

describe("MCP server", () => {
  async function connect() {
    const server = createServer(new Registry(dir));
    const client = new Client({ name: "test", version: "0.0.0" });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(a), client.connect(b)]);
    return client;
  }

  it("exposes the six tools", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      "get_component",
      "get_install_instructions",
      "get_tokens",
      "list_blocks",
      "list_components",
      "search",
    ]);
  });

  it("answers tool calls over the protocol", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "get_component", arguments: { name: "Badge", includeSource: false } });
    const first = (res.content as Array<{ type: string; text: string }>)[0]!;
    expect(first.text).toContain("# Badge");
    const list = await client.callTool({ name: "list_components", arguments: {} });
    expect(JSON.parse((list.content as Array<{ text: string }>)[0]!.text).length).toBeGreaterThan(10);
  });

  it("returns tool errors instead of crashing", async () => {
    const client = await connect();
    const res = await client.callTool({ name: "get_component", arguments: { name: "nope" } });
    expect(res.isError).toBe(true);
    const bad = await client.callTool({ name: "search", arguments: { query: "" } });
    expect(bad.isError).toBe(true);
  });
});
