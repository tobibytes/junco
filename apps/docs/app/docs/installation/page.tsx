import { Tabs, TabsContent, TabsList, TabsTrigger } from "junco";
import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, Note, P, Section, Step, Steps } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "Installation",
  description: "Set up Junco in Next.js, Vite or plain HTML.",
};

const css = `@import "tailwindcss";
@import "@junco/tailwind";

/* Let Tailwind see the classes junco's components use */
@source "../node_modules/junco/dist";`;

export default function InstallationPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Installation"
        description="Junco needs Tailwind CSS v4. Pick your setup below; each takes a couple of minutes."
      />
      <div className="mt-10 grid gap-12">
        <Tabs defaultValue="next">
          <TabsList aria-label="Framework">
            <TabsTrigger value="next">Next.js</TabsTrigger>
            <TabsTrigger value="vite">Vite</TabsTrigger>
            <TabsTrigger value="html">Plain HTML</TabsTrigger>
          </TabsList>

          <TabsContent value="next" className="mt-8">
            <Steps>
              <Step level={2} title="Create an app with Tailwind">
                <CodeBlock lang="bash" code="npx create-next-app@latest my-app --tailwind --app" />
              </Step>
              <Step level={2} title="Install Junco">
                <CodeBlock lang="bash" code="npm i junco @junco/tailwind" />
              </Step>
              <Step level={2} title="Import the styles">
                <P>
                  Replace the contents of <C>app/globals.css</C>:
                </P>
                <CodeBlock lang="css" title="app/globals.css" code={css} />
              </Step>
              <Step level={2} title="Add the theme provider">
                <P>
                  <C>themeScript()</C> applies the saved theme before first paint, so dark mode never flashes. Import it
                  from <C>junco/server</C>, which also has <C>cn()</C> and every <C>*Variants</C> helper for server
                  components.
                </P>
                <CodeBlock
                  title="app/layout.tsx"
                  code={`import { ThemeProvider } from "junco";
import { themeScript } from "junco/server";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript() }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}`}
                />
              </Step>
              <Step level={2} title="Use a component">
                <CodeBlock
                  title="app/page.tsx"
                  code={`import { Button } from "junco";

export default function Page() {
  return <Button>Ship it</Button>;
}`}
                />
              </Step>
            </Steps>
          </TabsContent>

          <TabsContent value="vite" className="mt-8">
            <Steps>
              <Step level={2} title="Create an app">
                <CodeBlock lang="bash" code={`npm create vite@latest my-app -- --template react-ts
cd my-app`} />
              </Step>
              <Step level={2} title="Install Tailwind and Junco">
                <CodeBlock lang="bash" code="npm i junco @junco/tailwind tailwindcss @tailwindcss/vite" />
              </Step>
              <Step level={2} title="Add the Tailwind plugin">
                <CodeBlock
                  title="vite.config.ts"
                  code={`import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({ plugins: [react(), tailwindcss()] });`}
                />
              </Step>
              <Step level={2} title="Import the styles">
                <CodeBlock lang="css" title="src/index.css" code={css} />
              </Step>
              <Step level={2} title="Wrap the app">
                <CodeBlock
                  title="src/main.tsx"
                  code={`import { ThemeProvider } from "junco";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);`}
                />
                <P>
                  To avoid a flash of the wrong theme, paste the output of <C>themeScript()</C> into an inline script in{" "}
                  <C>index.html</C>.
                </P>
              </Step>
            </Steps>
          </TabsContent>

          <TabsContent value="html" className="mt-8">
            <Steps>
              <Step level={2} title="Install the Tailwind CLI and Junco's CSS">
                <CodeBlock lang="bash" code="npm i -D tailwindcss @tailwindcss/cli @junco/tailwind" />
              </Step>
              <Step level={2} title="Create an input file">
                <CodeBlock
                  lang="css"
                  title="input.css"
                  code={`@import "tailwindcss";
@import "@junco/tailwind";
@source "./";`}
                />
              </Step>
              <Step level={2} title="Build it">
                <CodeBlock lang="bash" code="npx @tailwindcss/cli -i input.css -o junco.css --watch" />
              </Step>
              <Step level={2} title="Use the classes">
                <CodeBlock
                  lang="html"
                  code={`<link rel="stylesheet" href="junco.css" />

<div class="card">
  <input class="input" placeholder="you@example.com" />
  <button class="btn btn-primary">Save</button>
</div>`}
                />
                <P>
                  Toggle dark mode by adding <C>class=&quot;dark&quot;</C> to <C>&lt;html&gt;</C>. No JavaScript needed for anything else.
                </P>
              </Step>
            </Steps>
          </TabsContent>
        </Tabs>

        <Section id="server" title="Server components">
          <P>
            <C>junco</C> is a client module, so in a React Server Component its exports are client references: you can render{" "}
            <C>&lt;Button&gt;</C>, but you can&apos;t call <C>cn()</C> or <C>buttonVariants()</C> there. Import those helpers from{" "}
            <C>junco/server</C> instead. It has no <C>&quot;use client&quot;</C> and is checked in CI to load under React&apos;s server
            build.
          </P>
          <CodeBlock
            code={`import { buttonVariants, cn, themeScript } from "junco/server";
import Link from "next/link";

// A link styled as a button, rendered on the server
<Link href="/pricing" className={buttonVariants({ variant: "outline" })}>Pricing</Link>`}
          />
          <DataTable
            head={["Export", ""]}
            rows={[
              [<C key="1">cn</C>, "Merge class names and resolve Tailwind conflicts."],
              [<C key="2">themeScript</C>, "The no-flash inline script for <head>."],
              [<C key="3">applyTheme</C>, "Set .dark, data-theme, data-motion and color-scheme on an element."],
              [
                <C key="4">buttonVariants, badgeVariants, cardVariants, spinnerVariants, emptyStateVariants</C>,
                "Class builders for styling your own elements like Junco components.",
              ],
            ]}
          />
        </Section>

        <Section id="fonts" title="Fonts">
          <P>
            Junco is designed around Geist and Geist Mono. The tokens fall back to the system font, so loading them is optional. In
            Next.js, install the <C>geist</C> package and point the tokens at it:
          </P>
          <CodeBlock
            lang="css"
            code={`:root {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
}`}
          />
        </Section>

        <Section id="shadcn" title="Already using shadcn/ui?">
          <Note>
            Junco&apos;s token names match shadcn&apos;s (<C>--background</C>, <C>--primary</C>, <C>--muted-foreground</C> and so on), so
            your existing shadcn components pick up Junco&apos;s theme as soon as you import <C>@junco/tailwind</C>.
          </Note>
        </Section>
      </div>
      <Pager href="/docs/installation/" />
    </>
  );
}
