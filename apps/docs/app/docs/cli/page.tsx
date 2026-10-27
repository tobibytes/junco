import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, Note, P, Section } from "@/components/docs/prose";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "CLI",
  description: "junco create, init, add, diff, update and list: start an app from a template, copy components into your project and keep them updated without losing your edits.",
};

export default function CliPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="CLI"
        description="Start an app from a template, copy components into your project, then keep them updated without losing your edits."
      />
      <div className="mt-10 grid gap-12">
        <Section id="overview" title="Overview">
          <P>
            The CLI is <C>@junco/cli</C>. Run it with <C>npx</C>, or install it and use the <C>junco</C> command. <C>create</C>{" "}
            starts a new app; the other commands work in an existing project with Tailwind CSS v4 set up (an{" "}
            <C>@import &quot;tailwindcss&quot;;</C> in your global CSS).
          </P>
          <CodeBlock
            lang="bash"
            code={`npx @junco/cli create my-app --template saas   # a whole app: routes, auth, pages, fake data
npx @junco/cli init                 # detect Next/Vite, wire the theme into your CSS, write junco.json
npx @junco/cli add button select    # copies select + field, label, icons, utils; installs npm deps
npx @junco/cli add page sign-up --variant split   # a full page from @junco/blocks
npx @junco/cli diff                 # which installed components have upstream updates
npx @junco/cli diff select          # unified diff: your copy vs upstream
npx @junco/cli update select        # take upstream if you didn't edit it; otherwise write a side file`}
          />
          <DataTable
            caption="Commands"
            head={["Command", "What it does"]}
            rows={[
              [<C key="0">create &lt;folder&gt;</C>, "Starts a new app from a template (saas, admin) and installs its packages."],
              [<C key="1">init</C>, "Detects your framework, CSS file and @/* alias, wires the Junco theme into your CSS, adds cn() and writes junco.json."],
              [<C key="2">add &lt;name...&gt;</C>, "Copies components and everything they depend on, rewrites imports to your aliases, installs missing npm packages."],
              [<C key="2p">add page &lt;name&gt;</C>, "Adds a full page (dashboard, sign-up, settings-billing, ...) with the layout variant you pick."],
              [<C key="3">diff [name...]</C>, "With names: a unified diff of your copy against upstream. Without: lists components with updates."],
              [<C key="4">update [name...]</C>, "Three-way update. Untouched files are replaced; edited ones get a .junco-upstream copy to merge by hand."],
              [<C key="5">list</C>, "Everything in the registry, marked installed or update available."],
              [<C key="6">eject</C>, "Not built yet. It will turn an installed (npm) component into a local copy."],
            ]}
          />
        </Section>

        <Section id="create" title="create">
          <CodeBlock lang="bash" code={`npx @junco/cli create my-app --template saas
cd my-app
npm run dev`} />
          <P>
            Writes a complete Vite + React Router app into a new folder, built only from Junco blocks and pages, then installs it
            with the package manager you ran the command with. Every page runs on realistic fake data, and auth is a stub in{" "}
            <C>src/lib/auth.tsx</C> you swap for your provider. Each template&apos;s README lists its routes and where to change
            things. Try each one first on the <Link href="/templates/" className="underline underline-offset-4 hover:text-foreground">templates page</Link>, which has live demos.
          </P>
          <DataTable
            caption="Templates"
            head={["Template", "What you get"]}
            rows={[
              [<C key="s">saas</C>, "Landing, pricing, changelog and blog; sign-up, log in and onboarding; then a dashboard, customers and settings (profile, billing, team, API keys, notifications) behind a sign-in."],
              [<C key="a">admin</C>, "An internal panel: sign-in (no sign-up), an overview dashboard, users with detail pages, settings, and a ⌘K command palette."],
            ]}
          />
          <DataTable
            head={["Flag", ""]}
            rows={[
              [<C key="1">--template, -t &lt;name&gt;</C>, "Which template. Without it you're asked (or, in CI, told the options)."],
              [<C key="2">--list</C>, "Print the templates and exit."],
              [<C key="3">--no-install</C>, "Skip installing; print the command instead."],
            ]}
          />
          <Note>
            The folder must be new or empty. The template&apos;s files come from the registry like components do, and every
            path is checked before anything is written.
          </Note>
        </Section>

        <Section id="init" title="init">
          <CodeBlock lang="bash" code={`npx @junco/cli init
npx @junco/cli init --css inline --yes`} />
          <DataTable
            head={["Flag", ""]}
            rows={[
              [<C key="1">--css package</C>, "Default. Adds @import \"@junco/tailwind\"; to your CSS and installs the package."],
              [<C key="2">--css inline</C>, "Writes the whole theme to styles/junco.css in your project instead, so you own it."],
              [<C key="3">--css-file &lt;path&gt;</C>, "Which stylesheet to edit, when auto-detection picks the wrong one."],
              [<C key="4">--yes, -y</C>, "Accept the defaults without asking."],
              [<C key="5">--force, -f</C>, "Overwrite an existing junco.json."],
            ]}
          />
          <P>
            Projects without an <C>@/*</C> alias get relative imports. Safe to re-run.
          </P>
        </Section>

        <Section id="add" title="add">
          <CodeBlock lang="bash" code={`npx @junco/cli add button field select
npx @junco/cli add data-table form       # the junco/data-table and junco/form pieces`} />
          <P>
            Dependencies are resolved recursively (Select brings Field, Label and the icons it uses). Each file&apos;s content hash
            is recorded in <C>junco.json</C>, which is what makes <C>diff</C> and <C>update</C> work. Files you already changed are
            kept unless you pass <C>--overwrite</C>.
          </P>
        </Section>

        <Section id="add-page" title="add page">
          <CodeBlock lang="bash" code={`npx @junco/cli add page dashboard --variant focused
npx @junco/cli add page sign-up --variant split
npx @junco/cli list                       # every page and its variants, after the components`} />
          <P>
            Writes a small file to <C>components/pages/&lt;name&gt;.tsx</C> that renders the page from <C>@junco/blocks</C> with
            the variant you picked (the first one when you don&apos;t pick). It installs <C>@junco/blocks</C> and{" "}
            <C>@junco/react</C>, and adds <C>@source</C> lines to your CSS so Tailwind sees the classes they use. Pass your data
            as props; anything you leave out shows realistic fake data. Switch layouts later by changing the{" "}
            <C>variant</C> prop. Every page and its props are in the{" "}
            <Link href="/blocks/" className="underline underline-offset-4 hover:text-foreground">
              blocks and pages gallery
            </Link>
            .
          </P>
        </Section>

        <Section id="update" title="diff and update">
          <CodeBlock
            lang="bash"
            code={`npx @junco/cli diff                 # what has updates
npx @junco/cli diff select > select.patch   # applyable with patch
npx @junco/cli update select
npx @junco/cli update --all`}
          />
          <P>
            Copied code usually drifts the moment you edit it. <C>update</C> compares three versions: what Junco wrote, your file
            now, and the latest upstream. If you never touched a file, it&apos;s replaced. If you did, the new version lands next to
            it as <C>select.tsx.junco-upstream</C>; merge what you want, delete the copy, and run{" "}
            <C>update select --resolved</C>. <C>--force</C> takes upstream and drops your edits.
          </P>
        </Section>

        <Section id="config" title="junco.json">
          <CodeBlock
            code={`{
  "$schema": "${site.url}/schema/junco.json",
  "registry": "${site.url}/r",
  "framework": "next",
  "css": { "file": "app/globals.css", "mode": "package" },
  "aliases": { "components": "@/components", "ui": "@/components/ui", "lib": "@/lib", "utils": "@/lib/utils" },
  "paths": { "components": "components", "ui": "components/ui", "lib": "lib" },
  "installed": {
    "button": { "hash": "3f1c…", "files": { "components/ui/button.tsx": "9ab2…" } }
  }
}`}
          />
          <DataTable
            caption="Global options"
            head={["Option", ""]}
            rows={[
              [<C key="1">--registry &lt;url|dir&gt;</C>, "Registry to read. Also JUNCO_REGISTRY or registry in junco.json. A local folder works too."],
              [<C key="2">--cwd &lt;dir&gt;</C>, "Run as if from another folder."],
              [<C key="3">--no-install</C>, "Write files but don't install npm packages."],
            ]}
          />
        </Section>

        <Section id="shadcn" title="With the shadcn CLI">
          <P>Every component is also a shadcn registry item, so the shadcn CLI works too. It follows the dependency URLs and merges the theme into your CSS:</P>
          <CodeBlock lang="bash" code={`npx shadcn@latest add ${site.url}/r/button.json`} />
          <Note>
            On Vite, shadcn needs the <C>@/*</C> alias in your root <C>tsconfig.json</C>, or it writes into a literal <C>@/</C>{" "}
            folder. That&apos;s standard shadcn setup.
          </Note>
        </Section>
      </div>
      <Pager href="/docs/cli/" />
    </>
  );
}
