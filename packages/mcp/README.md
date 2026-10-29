# @junco/mcp

An MCP server that lets AI agents (Claude, Claude Code, Cursor, VS Code, ...) find, read and install Junco components, blocks and tokens. It reads the public registry at `https://junco.madebytobi.com/r`, or a local folder.

Use the hosted server (nothing to install) or run it locally with `npx`. Both have the same tools.

## Tools

| Tool | Returns |
| --- | --- |
| `list_components` | every UI component with a one-line description |
| `list_blocks` | blocks and full pages (`kind`: block, page, all) |
| `search` | fuzzy matches by name or purpose (`query`, `limit`) |
| `get_component` | description, usage at all four levels (semantic classes, utilities, copy-in, installed), variants, props, an example, npm and registry deps, and the source (`includeSource`) |
| `get_tokens` | design tokens as a summary, `tokens.css`, or W3C JSON (`format`, `filter`) |
| `get_install_instructions` | setup steps for `next`, `vite`, `remix`, `astro` or `html` |

## Hosted (recommended)

`https://mcp.junco.madebytobi.com/mcp` (Streamable HTTP, public, no sign-in).

**Claude** (web, desktop, mobile): Settings → Connectors → Add custom connector, and paste the URL above.

**Claude Code**

```bash
claude mcp add --transport http junco https://mcp.junco.madebytobi.com/mcp
```

**Cursor** (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "junco": { "url": "https://mcp.junco.madebytobi.com/mcp" }
  }
}
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "junco": { "type": "http", "url": "https://mcp.junco.madebytobi.com/mcp" }
  }
}
```

## Local or offline (stdio)

**Claude Code**

```bash
claude mcp add junco -- npx -y @junco/mcp
```

**Claude Desktop** (`claude_desktop_config.json`) and **Cursor** (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "junco": { "command": "npx", "args": ["-y", "@junco/mcp"] }
  }
}
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "junco": { "type": "stdio", "command": "npx", "args": ["-y", "@junco/mcp"] }
  }
}
```

Use a local registry (for working on Junco itself) with `--registry ./apps/docs/public/r` or `JUNCO_REGISTRY`.

## In code

```ts
import { createServer } from "@junco/mcp";
const server = createServer("https://junco.madebytobi.com/r"); // McpServer, connect any transport
```

For runtimes without Node APIs (Cloudflare Workers, Deno, browsers), `@junco/mcp/remote` builds the same server over a registry URL, with the token files bundled in:

```ts
import { createRemoteServer } from "@junco/mcp/remote";
const server = createRemoteServer(); // e.g. with the MCP SDK's WebStandardStreamableHTTPServerTransport
```

The hosted server is `apps/mcp-worker` in the Junco repo.
