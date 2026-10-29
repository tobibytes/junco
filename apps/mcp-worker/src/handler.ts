import { createRemoteServer, DEFAULT_REGISTRY, RemoteRegistry, VERSION } from "@junco/mcp/remote";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

/** Requests bigger than this are refused. MCP requests to these tools are tiny. */
export const MAX_BODY_BYTES = 64 * 1024;
export const ENDPOINT = "https://mcp.junco.madebytobi.com/mcp";

export interface HandlerDeps {
  /** Fetches registry files; the Worker passes one that caches with the Cache API. */
  registryFetch: typeof fetch;
  registryUrl?: string;
  /** Returns false when the caller is over the limit. */
  rateLimit?: (key: string) => Promise<boolean>;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, accept, authorization, mcp-protocol-version, mcp-session-id, last-event-id",
  "access-control-expose-headers": "mcp-protocol-version, mcp-session-id",
  "access-control-max-age": "86400",
};

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function jsonRpcError(status: number, message: string, extra: Record<string, string> = {}): Response {
  return withCors(
    new Response(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }), {
      status,
      headers: { "content-type": "application/json", ...extra },
    }),
  );
}

/** Reads at most `limit` bytes of the body; undefined when it's bigger. */
async function readBody(request: Request, limit: number): Promise<string | undefined> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > limit) return undefined;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

const page = (origin: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Junco MCP server</title>
<style>
  :root { color-scheme: light dark; --fg: #18181b; --muted: #52525b; --bg: #fafafa; --code: #f4f4f5; --border: #e4e4e7; }
  @media (prefers-color-scheme: dark) { :root { --fg: #fafafa; --muted: #a1a1aa; --bg: #09090b; --code: #18181b; --border: #27272a; } }
  body { font: 16px/1.6 system-ui, sans-serif; color: var(--fg); background: var(--bg); max-width: 42rem; margin: 3rem auto; padding: 0 1rem; }
  p, li { color: var(--muted); } h1, h2 { line-height: 1.2; } code, pre { font: 14px ui-monospace, monospace; background: var(--code); border-radius: 6px; }
  code { padding: .1rem .3rem; } pre { padding: .75rem 1rem; overflow-x: auto; border: 1px solid var(--border); } a { color: inherit; }
</style>
</head>
<body>
<h1>Junco MCP server</h1>
<p>A remote <a href="https://modelcontextprotocol.io">Model Context Protocol</a> server for <a href="https://junco.madebytobi.com">Junco</a>, the React + Tailwind v4 design system. It lets AI assistants find, read and install Junco components, blocks and design tokens. Read-only and public: no sign-in.</p>
<p>Endpoint (Streamable HTTP):</p>
<pre>${origin}/mcp</pre>
<h2>Add it</h2>
<ul>
<li><strong>Claude</strong> (web, desktop, mobile): Settings → Connectors → Add custom connector, and paste the endpoint.</li>
<li><strong>Claude Code</strong>: <code>claude mcp add --transport http junco ${origin}/mcp</code></li>
<li><strong>Cursor</strong> (<code>.cursor/mcp.json</code>) and <strong>VS Code</strong> (<code>.vscode/mcp.json</code>, key <code>servers</code>): <code>{ "mcpServers": { "junco": { "url": "${origin}/mcp" } } }</code></li>
</ul>
<p>Tools: list_components, list_blocks, search, get_component, get_tokens, get_install_instructions. To run it locally instead: <code>npx -y @junco/mcp</code>. <a href="https://junco.madebytobi.com/docs/mcp/">Docs</a> · version ${VERSION}</p>
</body>
</html>
`;

/** Handles one request to the Worker. Stateless: a fresh server and transport per request. */
export async function handle(request: Request, deps: HandlerDeps): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

  if (url.pathname === "/" || url.pathname === "") {
    if (request.method !== "GET" && request.method !== "HEAD") return withCors(new Response("Method not allowed", { status: 405, headers: { allow: "GET, OPTIONS" } }));
    return withCors(new Response(request.method === "HEAD" ? null : page(url.origin), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } }));
  }

  if (url.pathname !== "/mcp") return withCors(new Response("Not found. The MCP endpoint is /mcp.", { status: 404, headers: { "content-type": "text/plain" } }));

  // Stateless: there's no session to stream server messages on, so GET (SSE) and DELETE (end
  // session) aren't offered. The Streamable HTTP spec allows 405 for both.
  if (request.method !== "POST") return jsonRpcError(405, "Method not allowed. Send MCP requests with POST.", { allow: "POST, OPTIONS" });

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (deps.rateLimit && !(await deps.rateLimit(ip))) return jsonRpcError(429, "Too many requests. Try again in a minute.", { "retry-after": "60" });

  const body = await readBody(request, MAX_BODY_BYTES);
  if (body === undefined) return jsonRpcError(413, `Request body larger than ${MAX_BODY_BYTES} bytes`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return jsonRpcError(400, "Parse error: the body must be JSON-RPC");
  }

  // A registry per request: the Cache API decides freshness (5 minutes), not a long-lived isolate.
  const registry = new RemoteRegistry(deps.registryUrl ?? DEFAULT_REGISTRY, { fetch: deps.registryFetch });
  const server = createRemoteServer(registry);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    return withCors(await transport.handleRequest(request, { parsedBody: parsed }));
  } finally {
    void server.close();
  }
}
