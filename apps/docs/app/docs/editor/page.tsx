import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { EditorPreview } from "@/components/editor/editor-preview";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, Note, P, Section } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "Rich text editor",
  description: "@junco/editor: a TipTap rich text editor with a toolbar, slash commands and markdown shortcuts, styled by Junco's tokens, that turns collaborative with one Y.Doc.",
};

const link = "font-medium text-foreground underline underline-offset-4 hover:decoration-primary";

const basic = `import { Editor } from "@junco/editor";

<Editor content="<p>Hello</p>" onUpdate={(editor) => save(editor.getJSON())} />`;

const together = `import { createClient } from "@towhee/client";
import { Editor, editorText } from "@junco/editor";
import { CollabProvider, CommentsPanel, HistoryPanel, towheeAdapter } from "@junco/collab";

const client = createClient({ url: "wss://towhee.example.com", authEndpoint: "/api/towhee-token" });
const room = client.enter("doc:42");

// The room is the Y.Doc's home and holds everyone's carets (its awareness).
<Editor doc={room.doc} provider={room} />

// Comments and history for the same document; textOf turns on version compare.
const adapter = towheeAdapter({ room, inbox: client.inbox, textOf: (doc) => editorText(doc), restoreOptions: { types: { default: "xml" } } });
<CollabProvider adapter={adapter}>
  <CommentsPanel />
  <HistoryPanel />
</CollabProvider>`;

const commands = `import { Editor, defaultSlashCommands, type SlashCommand } from "@junco/editor";

const callout: SlashCommand = {
  id: "callout",
  label: "Callout",
  keywords: "note tip",
  run: (editor) => editor.chain().focus().setBlockquote().insertContent("Note: ").run(),
};

<Editor slashCommands={[...defaultSlashCommands, callout]} />`;

export default function EditorDocsPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Rich text editor"
        description="@junco/editor is a TipTap editor with Junco's look: a formatting toolbar, a / command menu and markdown shortcuts. Give it a Y.Doc and it's collaborative."
      />
      <div className="mt-10 grid gap-12">
        <EditorPreview />

        <Section id="use" title="Use it">
          <CodeBlock lang="bash" code="npm i @junco/editor @junco/react @junco/tailwind yjs" />
          <P>
            Or copy the source into your project and change it freely: <C>npx @junco/cli add editor</C> puts it in{" "}
            <C>components/editor</C>, and <C>junco diff editor</C> shows what changed upstream later.
          </P>
          <CodeBlock lang="tsx" title="On its own" code={basic} />
          <P>
            Markdown shortcuts work as you type: <C>#</C> for headings, <C>-</C> or <C>1.</C> for lists, <C>&gt;</C> for quotes,{" "}
            <C>```</C> for code, <C>**bold**</C>, <C>_italic_</C>. Type <C>/</C> on a line for the command menu; arrow keys move, Enter
            picks, Escape closes.
          </P>
        </Section>

        <Section id="together" title="Edit together">
          <P>
            Pass a <C>doc</C> and everyone with the same document edits it live; pass a <C>provider</C> with an Awareness and their carets
            and selections show with their names. A Towhee room is both. Undo only undoes your own changes.
          </P>
          <CodeBlock lang="tsx" title="With Towhee and @junco/collab" code={together} />
          <P>
            See it running in the <Link className={link} href="/editor/">collaborative docs editor</Link>: comments, an inbox, version
            history with compare, and a share dialog around one shared document.
          </P>
        </Section>

        <Section id="commands" title="Slash commands">
          <P>The defaults are text, three headings, bulleted and numbered lists, quote, code block and divider. Add your own:</P>
          <CodeBlock lang="tsx" code={commands} />
        </Section>

        <Section id="props" title="Props">
          <DataTable
            head={["Prop", "What it does"]}
            rows={[
              [<C key="1">content</C>, "Starting HTML or TipTap JSON, when not collaborating"],
              [<C key="2">doc</C>, "A Y.Doc to edit together; the document is then the content"],
              [<C key="3">field</C>, "The XmlFragment in doc this editor owns (default \"default\")"],
              [<C key="4">provider</C>, "Anything with an awareness (a Towhee room, y-websocket, Hocuspocus) for shared carets"],
              [<C key="5">user</C>, "Your name and color on your caret. Towhee sets these from the token"],
              [<C key="6">placeholder</C>, "Shown on an empty document"],
              [<C key="7">editable</C>, "False for read-only (hides the toolbar and menu)"],
              [<C key="8">toolbar</C>, "Show the formatting toolbar (default true)"],
              [<C key="9">slashCommands</C>, "Commands for the / menu; [] turns it off"],
              [<C key="10">extensions</C>, "More TipTap extensions"],
              [<C key="11">onReady, onUpdate</C>, "Get the TipTap editor, to read or change content"],
              [<C key="12">label</C>, "Accessible name of the editing area (default \"Document\")"],
              [<C key="13">className, classNames</C>, "root, toolbar and content slots"],
            ]}
          />
          <P>
            Also exported: <C>Toolbar</C> and <C>SlashMenu</C> for your own TipTap setup, <C>defaultSlashCommands</C>, and{" "}
            <C>editorText(doc, field)</C>, which turns a document into plain text (for version compare or search).
          </P>
        </Section>

        <Note title="Accessibility">
          The editing area is a labeled multi-line textbox, the toolbar is a toolbar with pressed states and shortcuts in its tooltips,
          and the / menu is a listbox the editor points at with aria-activedescendant. Other people&apos;s cursors show their name in a
          neutral tag with a colored border, so text contrast holds for any color.
        </Note>
      </div>
      <Pager href="/docs/editor/" />
    </>
  );
}
