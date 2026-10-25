#!/usr/bin/env node
import { parseArgs } from "node:util";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer, DEFAULT_REGISTRY, VERSION } from "./server";

const { values } = parseArgs({
  options: {
    registry: { type: "string" },
    help: { type: "boolean", short: "h" },
    version: { type: "boolean", short: "v" },
  },
});

if (values.version) {
  console.log(VERSION);
} else if (values.help) {
  console.log(`junco-mcp: Junco MCP server over stdio.

  --registry <url|dir>  registry to read (default ${DEFAULT_REGISTRY}, or JUNCO_REGISTRY)`);
} else {
  const server = createServer(values.registry ?? process.env.JUNCO_REGISTRY ?? DEFAULT_REGISTRY);
  await server.connect(new StdioServerTransport());
}
