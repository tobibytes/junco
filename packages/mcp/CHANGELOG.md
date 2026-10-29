# @junco/mcp

## 0.2.0

### Minor Changes

- bec1adf: Add `@junco/mcp/remote`: `createRemoteServer()` builds the same MCP server for runtimes without Node APIs (Cloudflare Workers, Deno), reading the registry over HTTP with the token files bundled in. It powers the hosted server at https://mcp.junco.madebytobi.com/mcp. The stdio server and `createServer` are unchanged; `RemoteRegistry` is also exported, and `Registry` now extends it.

### Patch Changes

- Updated dependencies [e131255]
  - @junco/tokens@0.3.0

## 0.1.2

### Patch Changes

- 888d2d8: Published from GitHub Actions with npm Trusted Publishing, so every version now carries a provenance statement linking it to the commit and workflow that built it.
- Updated dependencies [888d2d8]
  - @junco/tokens@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [ddf1ab3]
  - @junco/tokens@0.2.0

## 0.1.0

### Minor Changes

- 92b848d: First public release: tokens, Tailwind theme and semantic classes, React components (primitives, overlays, data table, forms), the `junco` CLI and registry, the MCP server, blocks and pages (app and marketing), motion effects, and 3D scenes.

### Patch Changes

- Updated dependencies [92b848d]
- Updated dependencies [b336fd2]
  - @junco/tokens@0.1.0
