import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { site } from "@/lib/site";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, Note, P, Section } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "MCP and AI",
  description: "Use Junco with Claude, Cursor and other AI agents: MCP server, llms.txt and registry JSON.",
};

export default function McpPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="MCP and AI"
        description="Junco is built to be used by AI agents as well as people. Point your agent at it and it will build screens from real Junco components instead of guessing."
      />
      <div className="mt-10 grid gap-12">
        <Section id="llms" title="llms.txt">
          <P>
            <a className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary" href="/llms.txt">/llms.txt</a> is a plain-text map of the docs
            and every component, written for language models. Paste the URL into a chat or add it to your agent&apos;s context.
          </P>
        </Section>

        <Section id="mcp" title="MCP server">
          <P>
            The Junco MCP server lets an agent list components, read their docs and source, and add them to your project. Add it to
            your client:
          </P>
          <CodeBlock
            lang="bash"
            title="Claude Code"
            code="claude mcp add junco -- npx -y @junco/mcp"
          />
          <CodeBlock
            lang="tsx"
            title=".cursor/mcp.json, claude_desktop_config.json"
            code={`{
  "mcpServers": {
    "junco": { "command": "npx", "args": ["-y", "@junco/mcp"] }
  }
}`}
          />
          <DataTable
            caption="MCP tools"
            head={["Tool", "What it does"]}
            rows={[
              [<C key="1">list_components</C>, "Every component and block, with a one-line description."],
              [<C key="2">get_component</C>, "Docs, props, examples and source for one component."],
              [<C key="3">search</C>, "Find components and docs by what you want to build."],
              [<C key="4">add_component</C>, "Copies a component into the project, like junco add."],
            ]}
          />
          <Note>The MCP package is in progress; tool names may change before 1.0.</Note>
        </Section>

        <Section id="registry" title="Registry JSON">
          <P>
            Each component is served at <C>/r/&lt;name&gt;.json</C> in the shadcn registry format, with its source and dependencies.
            Tools that understand shadcn registries can read Junco directly.
          </P>
          <CodeBlock lang="bash" code={`curl ${site.url}/r/button.json`} />
        </Section>

        <Section id="prompting" title="Prompting tips">
          <ul className="grid gap-2 text-[15px] text-muted-foreground">
            {[
              "Ask for Junco components by name and level: \"use junco's Field and Input, installed\".",
              "Mention tokens instead of colors: \"text-muted-foreground\", not \"gray-500\".",
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
