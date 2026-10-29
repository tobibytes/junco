import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DEFAULT_REGISTRY, Registry } from "./registry";
import { buildServer } from "./server-core";
import { nodeTokenFiles } from "./tools";

export { DEFAULT_REGISTRY, Registry } from "./registry";
export { VERSION } from "./server-core";
export * from "./tools";

/** Builds the Junco MCP server. `registry` is a URL (default https://junco.madebytobi.com/r) or a local folder. */
export function createServer(registry: Registry | string = DEFAULT_REGISTRY): McpServer {
  return buildServer(typeof registry === "string" ? new Registry(registry) : registry, nodeTokenFiles);
}
