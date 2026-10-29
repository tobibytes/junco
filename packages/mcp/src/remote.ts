// The Junco MCP server for runtimes without Node APIs (Cloudflare Workers): registry over HTTP,
// token files bundled in. Same tools, inputs and outputs as the stdio server.
import tokensCss from "@junco/tokens/tokens.css";
import tokensJson from "@junco/tokens/tokens.json";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DEFAULT_REGISTRY, RemoteRegistry } from "./registry-core";
import { buildServer } from "./server-core";
import type { TokenFiles } from "./tools-core";

export { DEFAULT_REGISTRY, NotFoundError, RemoteRegistry, SITE } from "./registry-core";
export { VERSION } from "./server-core";

// tokens.json is pretty-printed with a trailing newline; this gives the same text the stdio server reads.
const tokensJsonText = `${JSON.stringify(tokensJson, null, 2)}\n`;
const tokenFiles: TokenFiles = {
  css: async () => tokensCss,
  json: async () => tokensJsonText,
};

/** Builds the Junco MCP server over a registry URL (default https://junco.madebytobi.com/r). */
export function createRemoteServer(registry: RemoteRegistry | string = DEFAULT_REGISTRY): McpServer {
  return buildServer(typeof registry === "string" ? new RemoteRegistry(registry) : registry, tokenFiles);
}
