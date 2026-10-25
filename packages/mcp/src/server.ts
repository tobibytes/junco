import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEFAULT_REGISTRY, Registry } from "./registry";
import { getComponent, getInstallInstructions, getTokens, listBlocks, listComponents, search } from "./tools";

export { Registry, DEFAULT_REGISTRY } from "./registry";
export * from "./tools";

export const VERSION = "0.0.0";

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const json = (value: unknown) => text(JSON.stringify(value, null, 2));

async function safely(fn: () => Promise<ReturnType<typeof text>>) {
  try {
    return await fn();
  } catch (err) {
    return { ...text((err as Error).message), isError: true };
  }
}

/** Builds the Junco MCP server. `registry` is a URL (default https://junco.madebytobi.com/r) or a local folder. */
export function createServer(registry: Registry | string = DEFAULT_REGISTRY): McpServer {
  const reg = typeof registry === "string" ? new Registry(registry) : registry;
  const server = new McpServer(
    { name: "junco", version: VERSION },
    {
      instructions:
        "Junco is a React + Tailwind v4 design system. Use search or list_components to find pieces, get_component for props, variants, examples and source, and get_install_instructions to set a project up. Prefer composing screens from Junco blocks and components, and use Junco tokens (bg-surface, text-muted-foreground, border-border) instead of raw colors.",
    },
  );

  server.registerTool(
    "list_components",
    {
      title: "List components",
      description: "Every Junco UI component with a one-line description.",
      inputSchema: {},
    },
    () => safely(async () => json(await listComponents(reg))),
  );

  server.registerTool(
    "list_blocks",
    {
      title: "List blocks and pages",
      description: "Junco blocks (page sections like hero, pricing, sidebar) and full pages, ready to copy in.",
      inputSchema: { kind: z.enum(["block", "page", "all"]).default("all").describe("Filter by kind") },
    },
    ({ kind }) => safely(async () => json(await listBlocks(reg, kind))),
  );

  server.registerTool(
    "search",
    {
      title: "Search Junco",
      description: "Fuzzy search components, blocks and pages by name or purpose, e.g. 'loading', 'toggle', 'form error'.",
      inputSchema: {
        query: z.string().min(1).describe("What you're looking for"),
        limit: z.number().int().min(1).max(50).default(10),
      },
    },
    ({ query, limit }) =>
      safely(async () => {
        const results = await search(reg, query, limit);
        return results.length ? json(results) : text(`Nothing matches "${query}". Try list_components.`);
      }),
  );

  server.registerTool(
    "get_component",
    {
      title: "Get a component",
      description:
        "Full reference for one component: description, how to use it at all four levels (semantic classes, utilities, copy-in, installed package), variants, props, an example and the source.",
      inputSchema: {
        name: z.string().describe("Component name, e.g. button, select, radio-group"),
        includeSource: z.boolean().default(true).describe("Include the full source code"),
      },
    },
    ({ name, includeSource }) => safely(async () => text(await getComponent(reg, name.trim().toLowerCase(), { includeSource }))),
  );

  server.registerTool(
    "get_tokens",
    {
      title: "Get design tokens",
      description: "Junco design tokens (colors light and dark, type scale, spacing, radius, shadows, motion).",
      inputSchema: {
        format: z.enum(["summary", "css", "json"]).default("summary").describe("summary: name and values; css: tokens.css; json: W3C design tokens"),
        filter: z.string().optional().describe("Only tokens whose name contains this, e.g. 'primary' or 'text-'"),
      },
    },
    ({ format, filter }) => safely(async () => text(await getTokens(format, filter))),
  );

  server.registerTool(
    "get_install_instructions",
    {
      title: "Install instructions",
      description: "Step-by-step setup of Junco for a framework.",
      inputSchema: { framework: z.enum(["next", "vite", "remix", "astro", "html"]).default("vite") },
    },
    ({ framework }) => safely(async () => text(getInstallInstructions(framework))),
  );

  return server;
}
