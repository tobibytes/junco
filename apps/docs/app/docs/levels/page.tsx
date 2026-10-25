import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { site } from "@/lib/site";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, P, Section } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "The four levels",
  description: "Semantic classes, utilities, copy-in components and installed components, all from one set of tokens.",
};

export default function LevelsPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="The four levels"
        description="Use Junco as plain CSS classes, as Tailwind utilities, as source you own, or as an npm package. They all read the same tokens, so they mix in one app."
      />
      <div className="mt-10 grid gap-12">
        <DataTable
          caption="The four levels compared"
          head={["Level", "Feels like", "Good for"]}
          rows={[
            ["Semantic classes", "daisyUI", "Any framework, plain HTML, emails, server templates"],
            ["Utilities", "Tailwind", "One-off layouts and full control over markup"],
            ["Copy-in", "shadcn/ui", "Owning and editing the source, while still getting updates"],
            ["Installed", "HeroUI / NextUI", "Getting going fast with variant props and no source to maintain"],
          ]}
        />

        <Section id="semantic" title="1. Semantic classes">
          <P>
            Pure CSS from <C>@junco/tailwind</C>. No JavaScript, works anywhere. Good for buttons, inputs, badges, cards, checkboxes and
            switches. Things that need behavior, like dialogs and menus, aren&apos;t offered here.
          </P>
          <CodeBlock
            lang="html"
            code={`<button class="btn btn-primary">Save</button>
<span class="badge badge-success badge-dot">Paid</span>
<input type="checkbox" role="switch" class="switch" />`}
          />
        </Section>

        <Section id="utilities" title="2. Utilities">
          <P>
            Every token is a Tailwind utility: <C>bg-surface</C>, <C>text-muted-foreground</C>, <C>rounded-card</C>,{" "}
            <C>shadow-float</C>, <C>duration-fast</C>, <C>ease-enter</C>, <C>animate-rise</C>. Durations scale with the motion switch
            automatically.
          </P>
          <CodeBlock
            code={`<div className="rounded-card border border-border bg-card p-5">
  <h2 className="text-sm font-medium">Usage</h2>
  <p className="text-sm text-muted-foreground">You've used 80% of your plan.</p>
</div>`}
          />
        </Section>

        <Section id="copy-in" title="3. Copy-in components">
          <P>
            Copy the source into your repo and change whatever you like. Unlike plain copy and paste, Junco remembers where each file
            came from, so <C>junco diff</C> shows upstream changes and <C>junco update</C> merges them, keeping your edits.
          </P>
          <CodeBlock
            lang="bash"
            code={`npx @junco/cli add select
# or with the shadcn CLI
npx shadcn add ${site.url}/r/select.json`}
          />
        </Section>

        <Section id="installed" title="4. Installed components">
          <P>
            Install the package and import. Variants are props (<C>variant</C>, <C>size</C>, <C>color</C>) and states read like
            English (<C>isLoading</C>, <C>isInvalid</C>, <C>isRequired</C>). Every component takes <C>className</C>, and multi-part
            ones take <C>classNames</C> to style each slot.
          </P>
          <CodeBlock
            code={`import { Button, Field, Input } from "junco";

<Field label="Email" error={errors.email}>
  <Input type="email" />
</Field>
<Button isLoading={saving}>Save</Button>`}
          />
        </Section>

        <Section id="mixing" title="Mixing levels">
          <P>
            Because everything reads the same CSS variables, a semantic <C>.btn</C> in a server-rendered email preview, an installed{" "}
            <C>Button</C> in your app and a copied-in, customized <C>Dialog</C> all change together when you change{" "}
            <C>--primary</C>.
          </P>
        </Section>
      </div>
      <Pager href="/docs/levels/" />
    </>
  );
}
