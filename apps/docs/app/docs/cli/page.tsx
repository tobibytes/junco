import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { site } from "@/lib/site";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, Note, P, Section } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "CLI",
  description: "junco init, add, diff, update, eject and create.",
};

export default function CliPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="CLI"
        description="Copy components, blocks and pages into your project, and keep them up to date after you've changed them."
      />
      <div className="mt-10 grid gap-12">
        <Note title="In progress">The commands below are the planned interface. Some are still being built; this page tracks them.</Note>

        <DataTable
          caption="Commands"
          head={["Command", "What it does"]}
          rows={[
            [<C key="1">junco init</C>, "Adds the Tailwind import, tokens and a junco.config.ts to your project."],
            [<C key="2">junco add &lt;name&gt;</C>, "Copies a component or block's source, plus anything it depends on."],
            [<C key="3">junco add page &lt;name&gt; --variant &lt;v&gt;</C>, "Copies a full page and everything it uses."],
            [<C key="4">junco diff &lt;name&gt;</C>, "Shows what changed upstream since you copied it."],
            [<C key="5">junco update &lt;name&gt;</C>, "Merges upstream changes into your copy, keeping your edits."],
            [<C key="6">junco eject &lt;name&gt;</C>, "Turns an installed component into a local copy you own."],
            [<C key="7">junco create &lt;dir&gt; --template &lt;t&gt;</C>, "Starts a new app from a template (SaaS, admin, ...)."],
          ]}
        />

        <Section id="init" title="init">
          <CodeBlock lang="bash" code="npx junco init" />
          <P>Detects your framework and Tailwind setup, then adds the imports. Safe to re-run.</P>
        </Section>

        <Section id="add" title="add">
          <CodeBlock
            lang="bash"
            code={`npx junco add button select field
npx junco add page dashboard --variant sidebar`}
          />
          <P>
            Files land in <C>components/ui</C> by default (change it in <C>junco.config.ts</C>). Each file records the version it came
            from, which is what makes <C>diff</C> and <C>update</C> possible.
          </P>
        </Section>

        <Section id="update" title="diff and update">
          <CodeBlock
            lang="bash"
            code={`npx junco diff select     # what changed upstream
npx junco update select   # three-way merge, your edits kept`}
          />
          <P>
            Copied code usually drifts the moment you edit it. Junco does a three-way merge between the version you copied, your
            edited copy, and the latest upstream, so you get fixes without losing changes. Conflicts are marked like a git merge.
          </P>
        </Section>

        <Section id="shadcn" title="With the shadcn CLI">
          <P>Every component is also served as shadcn registry JSON, so the shadcn CLI works too:</P>
          <CodeBlock lang="bash" code={`npx shadcn add ${site.url}/r/button.json`} />
        </Section>
      </div>
      <Pager href="/docs/cli/" />
    </>
  );
}
