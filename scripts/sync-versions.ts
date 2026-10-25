/**
 * Runs after `changeset version`: copies the new @junco/mcp version into its server.json
 * (the MCP Registry rejects a listing whose version doesn't match the npm package).
 */
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(`${root}packages/mcp/package.json`, "utf8"));
const serverPath = `${root}packages/mcp/server.json`;
const server = JSON.parse(readFileSync(serverPath, "utf8"));

server.version = pkg.version;
for (const p of server.packages ?? []) if (p.identifier === pkg.name) p.version = pkg.version;
writeFileSync(serverPath, JSON.stringify(server, null, 2) + "\n");
console.log(`server.json -> ${pkg.version}`);
