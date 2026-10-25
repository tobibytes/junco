"use client";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "junco";
import * as React from "react";
import { components } from "@/content/components";
import type { ComponentDoc, ControlDef, ControlValues, Example } from "@/content/components/types";
import { site } from "@/lib/site";
import { CodeBlock } from "../code-block";
import { PreviewFrame } from "../preview";
import { H2, H3, Note } from "./prose";

const views = new Map(
  components.map((entry) => [
    entry.slug,
    React.lazy(async () => {
      const { doc } = await entry.load();
      return { default: () => <DocBody slug={entry.slug} doc={doc} /> };
    }),
  ]),
);

export function ComponentDocView({ slug }: { slug: string }) {
  const View = views.get(slug);
  if (!View) return null;
  return (
    <React.Suspense fallback={<DocSkeleton />}>
      <View />
    </React.Suspense>
  );
}

function DocSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-72 w-full rounded-card" />
      <Skeleton className="h-40 w-full rounded-card" />
    </div>
  );
}

function DocBody({ slug, doc }: { slug: string; doc: ComponentDoc }) {
  return (
    <div className="grid gap-14">
      {doc.playground && <Playground playground={doc.playground} />}
      <Usage slug={slug} doc={doc} />
      {doc.examples.length > 0 && (
        <section aria-labelledby="examples" className="grid gap-8">
          <H2 id="examples">Examples</H2>
          {doc.examples.map((example) => (
            <ExampleBlock key={example.title} example={example} />
          ))}
        </section>
      )}
      <section aria-labelledby="api" className="grid gap-6">
        <H2 id="api">API reference</H2>
        {doc.props.map((table) => (
          <div key={table.component} className="grid gap-3">
            <H3 id={`api-${table.component.toLowerCase()}`}>
              <code className="font-mono text-[0.95em]">{table.component}</code>
            </H3>
            {table.description && <p className="text-sm text-muted-foreground">{table.description}</p>}
            <PropsTable props={table.props} />
          </div>
        ))}
      </section>
      <section aria-labelledby="accessibility" className="grid gap-6">
        <H2 id="accessibility">Accessibility</H2>
        {doc.keyboard && doc.keyboard.length > 0 && (
          <div className="overflow-x-auto rounded-card border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Keyboard interactions</caption>
              <thead className="border-b border-border bg-surface text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Key</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {doc.keyboard.map((row) => (
                  <tr key={row.keys.join("+") + row.action}>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="flex gap-1">
                        {row.keys.map((k) => (
                          <kbd key={k} className="kbd">
                            {k}
                          </kbd>
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ul className="grid gap-2.5 text-sm text-muted-foreground">
          {doc.a11y.map((note) => (
            <li key={note} className="flex gap-2.5">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-primary" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function defaults(controls: ControlDef[]): ControlValues {
  return Object.fromEntries(controls.map((c) => [c.name, c.default]));
}

function Playground({ playground }: { playground: NonNullable<ComponentDoc["playground"]> }) {
  const [values, setValues] = React.useState<ControlValues>(() => defaults(playground.controls));
  const set = (name: string, value: string | boolean) => setValues((v) => ({ ...v, [name]: value }));

  return (
    <section aria-labelledby="playground" className="grid gap-4">
      <H2 id="playground" className="sr-only">
        Playground
      </H2>
      <div className="overflow-hidden rounded-card border border-border">
        <div className="grid lg:grid-cols-[1fr_15rem]">
          <PreviewFrame className="rounded-none border-0 lg:border-r" minHeight={260} toolbar={<span className="pl-1 text-xs font-medium text-muted-foreground">Playground</span>}>
            {playground.render(values)}
          </PreviewFrame>
          <form
            aria-label="Props"
            onSubmit={(e) => e.preventDefault()}
            className="grid content-start gap-4 border-t border-border bg-surface p-4 lg:border-t-0"
          >
            {playground.controls.map((control) => (
              <ControlInput key={control.name} control={control} value={values[control.name]!} onChange={(v) => set(control.name, v)} />
            ))}
            <button
              type="button"
              onClick={() => setValues(defaults(playground.controls))}
              className="justify-self-start text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Reset
            </button>
          </form>
        </div>
        <CodeBlock bare code={playground.code(values)} className="border-t border-border" />
      </div>
    </section>
  );
}

function ControlInput({
  control,
  value,
  onChange,
}: {
  control: ControlDef;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}) {
  const id = `control-${control.name}`;
  const label = control.label ?? control.name;
  if (control.type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-mono text-xs text-muted-foreground">
          {label}
        </label>
        <Switch id={id} size="sm" checked={value === true} onCheckedChange={onChange} />
      </div>
    );
  }
  if (control.type === "select") {
    return (
      <div className="grid gap-1.5">
        <label id={`${id}-label`} className="font-mono text-xs text-muted-foreground">
          {label}
        </label>
        <Select value={String(value)} onValueChange={onChange}>
          <SelectTrigger size="sm" aria-labelledby={`${id}-label`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {control.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="font-mono text-xs text-muted-foreground">
        {label}
      </label>
      <Input id={id} size="sm" value={String(value)} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Usage({ slug, doc }: { slug: string; doc: ComponentDoc }) {
  const importLine = `import { ${doc.imports.join(", ")} } from "junco";`;
  return (
    <section aria-labelledby="usage" className="grid gap-4">
      <H2 id="usage">Usage</H2>
      <p className="text-sm text-muted-foreground">
        The same component at all four levels. Pick the one that fits your project; they share tokens, so they mix.
      </p>
      <Tabs defaultValue="installed">
        <div className="overflow-x-auto">
          <TabsList aria-label="Ways to use it">
            <TabsTrigger value="installed">Installed</TabsTrigger>
            <TabsTrigger value="copy">Copy-in</TabsTrigger>
            <TabsTrigger value="semantic">Semantic classes</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="installed" className="grid gap-3">
          <CodeBlock lang="bash" code="npm i junco @junco/tailwind" />
          <CodeBlock code={`${importLine}\n\n${doc.usage.installed}`} />
        </TabsContent>
        <TabsContent value="copy" className="grid gap-3">
          {doc.copyIn === false ? (
            <Note>This one is only available installed.</Note>
          ) : (
            <>
              <CodeBlock lang="bash" code={`npx junco add ${slug}`} />
              <p className="text-sm text-muted-foreground">Or with the shadcn CLI, straight from the Junco registry:</p>
              <CodeBlock lang="bash" code={`npx shadcn add ${site.url}/r/${slug}.json`} />
              <p className="text-sm text-muted-foreground">
                The source lands in your repo, yours to edit.{" "}
                <code className="font-mono text-xs">junco diff {slug}</code> shows what changed upstream and{" "}
                <code className="font-mono text-xs">junco update {slug}</code> merges it, keeping your edits.
              </p>
            </>
          )}
        </TabsContent>
        <TabsContent value="semantic" className="grid gap-3">
          {doc.usage.semantic ? (
            <>
              <p className="text-sm text-muted-foreground">
                Pure CSS from <code className="font-mono text-xs">@junco/tailwind</code>. No JavaScript, works in any framework or plain HTML.
              </p>
              <CodeBlock lang="html" code={doc.usage.semantic} />
            </>
          ) : (
            <Note>No semantic-class version: this component needs JavaScript for its behavior. Use it installed or copied in.</Note>
          )}
        </TabsContent>
        <TabsContent value="utilities" className="grid gap-3">
          {doc.usage.utilities ? (
            <>
              <p className="text-sm text-muted-foreground">Plain markup with Junco&apos;s token utilities, for when you want full control.</p>
              <CodeBlock code={doc.usage.utilities} />
            </>
          ) : (
            <Note>Build this one from the installed or copied component; its behavior is more than styling.</Note>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ExampleBlock({ example }: { example: Example }) {
  const id = `example-${example.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const { Preview } = example;
  return (
    <div className="grid gap-3">
      <div>
        <H3 id={id}>{example.title}</H3>
        {example.description && <p className="mt-1 text-sm text-muted-foreground">{example.description}</p>}
      </div>
      <Tabs defaultValue="preview" variant="segmented">
        <TabsList aria-label={`${example.title} view`}>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-3">
          <PreviewFrame>
            <Preview />
          </PreviewFrame>
        </TabsContent>
        <TabsContent value="code" className="mt-3">
          <CodeBlock code={example.code} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PropsTable({ props }: { props: ComponentDoc["props"][number]["props"] }) {
  return (
    <>
      {/* Phones: stacked, so nothing scrolls sideways. */}
      <dl className="grid divide-y divide-border rounded-card border border-border sm:hidden">
        {props.map((prop) => (
          <div key={prop.name} className="grid gap-1.5 p-4">
            <dt>
              <code className="font-mono text-[13px] font-medium">{prop.name}</code>
            </dt>
            <dd className="text-[13px] text-muted-foreground">{prop.description}</dd>
            <dd className="font-mono text-[12px] break-words text-(--syntax-type)">{prop.type}</dd>
            {prop.default && <dd className="font-mono text-[12px] text-muted-foreground">Default: {prop.default}</dd>}
          </div>
        ))}
      </dl>
      <PropsGrid props={props} />
    </>
  );
}

function PropsGrid({ props }: { props: ComponentDoc["props"][number]["props"] }) {
  return (
    <div className="hidden overflow-x-auto rounded-card border border-border sm:block">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">Prop</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
            <th scope="col" className="px-4 py-2.5 font-medium">Default</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border align-top">
          {props.map((prop) => (
            <tr key={prop.name}>
              <td className="px-4 py-3">
                <code className="font-mono text-[13px] font-medium">{prop.name}</code>
                <p className="mt-1 text-[13px] text-muted-foreground">{prop.description}</p>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-[12px] text-(--syntax-type)">{prop.type}</code>
              </td>
              <td className="px-4 py-3">
                <code className="font-mono text-[12px] text-muted-foreground">{prop.default ?? "–"}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
