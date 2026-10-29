import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "@junco/mcp";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../../../scripts/build-registry.ts";
import { type HandlerDeps, handle, MAX_BODY_BYTES } from "../src/handler";

const ORIGIN = "https://mcp.test";
const REGISTRY = "https://registry.test/r";
let dir: string;
let registryRequests: string[];

/** Serves the real, freshly built registry from a temp folder, as the docs site would. */
const registryFetch: typeof fetch = async (input) => {
  const url = String(input instanceof Request ? input.url : input);
  registryRequests.push(url);
  try {
    return new Response(readFileSync(join(dir, url.slice(REGISTRY.length + 1)), "utf8"), { headers: { "content-type": "application/json" } });
  } catch {
    return new Response("not found", { status: 404 });
  }
};

const deps = (extra: Partial<HandlerDeps> = {}): HandlerDeps => ({ registryFetch, registryUrl: REGISTRY, ...extra });

beforeAll(() => {
  const outDir = mkdtempSync(join(tmpdir(), "junco-mcp-worker-"));
  buildRegistry({ outDir, quiet: true });
  dir = join(outDir, "r");
});

/** An MCP client talking Streamable HTTP to the Worker's handler. */
async function httpClient(extra: Partial<HandlerDeps> = {}) {
  registryRequests = [];
  const transport = new StreamableHTTPClientTransport(new URL(`${ORIGIN}/mcp`), {
    fetch: (url, init) => handle(new Request(url, init), deps(extra)),
  });
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(transport);
  return client;
}

/** The stdio server over the same registry, to compare outputs with. */
async function stdioClient() {
  const [a, b] = InMemoryTransport.createLinkedPair();
  const server = createServer(dir);
  await server.connect(b);
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(a);
  return client;
}

const textOf = (res: Awaited<ReturnType<Client["callTool"]>>) => (res.content as { text: string }[])[0]!.text;

describe("MCP over Streamable HTTP", () => {
  it("initializes and lists all 6 tools", async () => {
    const client = await httpClient();
    expect(client.getServerVersion()?.name).toBe("junco");
    expect(client.getInstructions()).toContain("Junco is a React + Tailwind v4 design system");
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(["get_component", "get_install_instructions", "get_tokens", "list_blocks", "list_components", "search"]);
  });

  it("get_component works for button", async () => {
    const client = await httpClient();
    const res = await client.callTool({ name: "get_component", arguments: { name: "button" } });
    expect(res.isError).toBeFalsy();
    expect(textOf(res)).toContain("Button");
    expect(textOf(res)).toContain("npx @junco/cli add button");
    expect(registryRequests).toContain(`${REGISTRY}/button.json`);
  });

  it("gives exactly the same results as the stdio server, for every tool", async () => {
    const http = await httpClient();
    const stdio = await stdioClient();
    const calls: [string, Record<string, unknown>][] = [
      ["list_components", {}],
      ["list_blocks", { kind: "all" }],
      ["search", { query: "toggle" }],
      ["get_component", { name: "Select", includeSource: true }],
      ["get_component", { name: "nope" }],
      ["get_tokens", { format: "summary", filter: "primary" }],
      ["get_tokens", { format: "css" }],
      ["get_tokens", { format: "json" }],
      ["get_install_instructions", { framework: "next" }],
    ];
    for (const [name, args] of calls) {
      const [a, b] = await Promise.all([http.callTool({ name, arguments: args }), stdio.callTool({ name, arguments: args })]);
      expect(a, `${name} ${JSON.stringify(args)}`).toEqual(b);
    }
    expect((await http.listTools()).tools).toEqual((await stdio.listTools()).tools);
  });

  it("reports bad tool input the same way", async () => {
    const http = await httpClient();
    const res = await http.callTool({ name: "search", arguments: { query: "" } });
    expect(res.isError).toBe(true);
  });
});

describe("the Worker around it", () => {
  const post = (body: string, headers: Record<string, string> = {}) =>
    handle(
      new Request(`${ORIGIN}/mcp`, { method: "POST", body, headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers } }),
      deps(),
    );

  it("explains itself at /", async () => {
    const res = await handle(new Request(`${ORIGIN}/`), deps());
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain(`${ORIGIN}/mcp`);
    expect(html).toContain("claude mcp add --transport http junco");
  });

  it("answers CORS preflights and adds CORS headers to MCP responses", async () => {
    const pre = await handle(new Request(`${ORIGIN}/mcp`, { method: "OPTIONS" }), deps());
    expect(pre.status).toBe(204);
    expect(pre.headers.get("access-control-allow-origin")).toBe("*");
    expect(pre.headers.get("access-control-allow-methods")).toBe("GET, POST, OPTIONS");
    const init = await post(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "x", version: "1" } } }));
    expect(init.status).toBe(200);
    expect(init.headers.get("access-control-allow-origin")).toBe("*");
    expect(init.headers.get("mcp-session-id")).toBeNull(); // stateless
  });

  it("refuses oversized and malformed bodies, and GET or DELETE on /mcp", async () => {
    expect((await post("x".repeat(MAX_BODY_BYTES + 1))).status).toBe(413);
    const declared = await post("{}", { "content-length": String(MAX_BODY_BYTES + 1) });
    expect(declared.status).toBe(413);
    expect((await post("{not json")).status).toBe(400);
    expect((await handle(new Request(`${ORIGIN}/mcp`), deps())).status).toBe(405);
    expect((await handle(new Request(`${ORIGIN}/mcp`, { method: "DELETE" }), deps())).status).toBe(405);
    expect((await handle(new Request(`${ORIGIN}/elsewhere`), deps())).status).toBe(404);
  });

  it("rate limits per IP", async () => {
    const keys: string[] = [];
    const limited = deps({
      rateLimit: async (key) => {
        keys.push(key);
        return false;
      },
    });
    const res = await handle(new Request(`${ORIGIN}/mcp`, { method: "POST", body: "{}", headers: { "cf-connecting-ip": "203.0.113.7" } }), limited);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("60");
    expect(keys).toEqual(["203.0.113.7"]);
  });
});
