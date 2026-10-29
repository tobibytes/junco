import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, P, Section } from "@/components/docs/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "MCP and AI",
  description: "Use Junco with Claude, Cursor, VS Code and other AI agents: the hosted MCP server, @junco/mcp, llms.txt and the registry JSON.",
};

const link = "font-medium text-foreground underline underline-offset-4 hover:decoration-primary";
const MCP_URL = "https://mcp.junco.madebytobi.com/mcp";

export default function McpPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="MCP and AI"
        description="Point your agent at Junco and it builds with real components instead of guessing."
      />
      <div className="mt-10 grid gap-12">
        <Section id="mcp" title="MCP server">
          <P>
            The Junco MCP server lets an agent search Junco, read any component&apos;s usage at all four levels with its props and
            source, read the tokens, and get install steps for your framework. It reads the public registry at{" "}
            <C>{`${site.url}/r`}</C>. Use the hosted server, with nothing to install, or run it locally.
          </P>
          <P>
            <strong className="font-medium text-foreground">Hosted:</strong> <C>{MCP_URL}</C> (Streamable HTTP, public, no sign-in).
          </P>
          <CodeBlock
            title="Claude (web, desktop, mobile)"
            code={`Settings → Connectors → Add custom connector\nURL: ${MCP_URL}`}
          />
          <CodeBlock lang="bash" title="Claude Code" code={`claude mcp add --transport http junco ${MCP_URL}`} />
          <CodeBlock
            title="Cursor (.cursor/mcp.json)"
            code={`{
  "mcpServers": {
    "junco": { "url": "${MCP_URL}" }
  }
}`}
          />
          <CodeBlock
            title="VS Code (.vscode/mcp.json)"
            code={`{
  "servers": {
    "junco": { "type": "http", "url": "${MCP_URL}" }
  }
}`}
          />
          <P>
            <strong className="font-medium text-foreground">Local or offline:</strong> <C>@junco/mcp</C> runs the same server over
            stdio.
          </P>
          <CodeBlock lang="bash" title="Claude Code" code="claude mcp add junco -- npx -y @junco/mcp" />
          <CodeBlock
            title="Claude Desktop (claude_desktop_config.json), Cursor (.cursor/mcp.json)"
            code={`{
  "mcpServers": {
    "junco": { "command": "npx", "args": ["-y", "@junco/mcp"] }
  }
}`}
          />
          <CodeBlock
            title="VS Code (.vscode/mcp.json)"
            code={`{
  "servers": {
    "junco": { "type": "stdio", "command": "npx", "args": ["-y", "@junco/mcp"] }
  }
}`}
          />
          <DataTable
            caption="Tools"
            head={["Tool", "Returns"]}
            rows={[
              [<C key="1">list_components</C>, "Every UI component with a one-line description."],
              [<C key="2">list_blocks</C>, "Blocks and full pages (kind: block, page or all)."],
              [<C key="3">search</C>, "Fuzzy matches by name or purpose, typos included (query, limit)."],
              [<C key="4">get_component</C>, "Description, usage at all four levels, variants, props, an example, npm and registry dependencies, and the source (includeSource)."],
              [<C key="5">get_tokens</C>, "Design tokens as a summary, tokens.css, or W3C JSON (format, filter)."],
              [<C key="6">get_install_instructions</C>, "Setup steps for next, vite, remix, astro or html."],
            ]}
          />
          <P>
            Working on Junco itself? Point it at a local build with <C>--registry ./apps/docs/public/r</C> or the{" "}
            <C>JUNCO_REGISTRY</C> environment variable. In code, <C>createServer(registry)</C> returns an <C>McpServer</C> you can
            connect to any transport.
          </P>
        </Section>

        <Section id="llms" title="llms.txt">
          <P>
            <a className={link} href="/llms.txt">
              /llms.txt
            </a>{" "}
            is a plain-text map of the docs and every component, written for language models.{" "}
            <a className={link} href="/llms-full.txt">
              /llms-full.txt
            </a>{" "}
            adds each component&apos;s props and usage. Paste either URL into a chat or your agent&apos;s context.
          </P>
        </Section>

        <Section id="registry" title="Registry JSON">
          <P>
            Each component is served at <C>/r/&lt;name&gt;.json</C> in the shadcn registry format, with its source, dependencies and
            a content hash. <C>/r/registry.json</C> lists them all. Anything that understands shadcn registries can read Junco
            directly.
          </P>
          <CodeBlock lang="bash" code={`curl ${site.url}/r/registry.json
npx shadcn@latest add ${site.url}/r/dialog.json`} />
        </Section>

        <Section id="prompting" title="Prompting tips">
          <ul className="grid gap-2 text-[15px] text-muted-foreground">
            {[
              "Ask for Junco components by name and level: \"use junco's Field and Input, installed\".",
              "Mention tokens instead of colors: \"text-muted-foreground\", not \"gray-500\".",
              "For whole screens, ask for a page from @junco/blocks first, then customize it with props and slots.",
              "Ask the agent to check its work against the a11y notes on each component page.",
            ].map((tip) => (
              <li key={tip} className="flex gap-2.5">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </Section>
      </div>
      <Pager href="/docs/mcp/" />
    </>
  );
}
