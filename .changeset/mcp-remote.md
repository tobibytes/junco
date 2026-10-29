---
"@junco/mcp": minor
---

Add `@junco/mcp/remote`: `createRemoteServer()` builds the same MCP server for runtimes without Node APIs (Cloudflare Workers, Deno), reading the registry over HTTP with the token files bundled in. It powers the hosted server at https://mcp.junco.madebytobi.com/mcp. The stdio server and `createServer` are unchanged; `RemoteRegistry` is also exported, and `Registry` now extends it.
