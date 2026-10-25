# @junco/mcp

An MCP server that lets AI agents (Claude Code, Claude Desktop, Cursor, ...) find, read and install Junco components, blocks and tokens. It reads the public registry at `https://junco.dev/r`, or a local folder.

## Tools

| Tool | Returns |
| --- | --- |
| `list_components` | every UI component with a one-line description |
| `list_blocks` | blocks and full pages (`kind`: block, page, all) |
| `search` | fuzzy matches by name or purpose (`query`, `limit`) |
| `get_component` | description, usage at all four levels (semantic classes, utilities, copy-in, installed), variants, props, an example, npm and registry deps, and the source (`includeSource`) |
| `get_tokens` | design tokens as a summary, `tokens.css`, or W3C JSON (`format`, `filter`) |
| `get_install_instructions` | setup steps for `next`, `vite`, `remix`, `astro` or `html` |

## Setup

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
const server = createServer("https://junco.dev/r"); // McpServer, connect any transport
```
