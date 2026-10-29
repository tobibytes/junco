import type { Metadata } from "next";
import { Button } from "@junco/react";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, Note, P, Section } from "@/components/docs/prose";
import { CollabPiece, CollabPlayground } from "@/components/docs/collab-demo";
import { BrowserShot } from "@/components/examples/shot";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Realtime collaboration",
  description:
    "@junco/collab: avatar stack, live cursors, comments, history, inbox and connection status for Junco apps, with adapters for Towhee (a self-hosted collaboration server) and fake data.",
};

const link = "font-medium text-foreground underline underline-offset-4 hover:decoration-primary";
const TOWHEE = "https://towhee.madebytobi.com";

const clientSample = `import { createClient } from "@towhee/client";

const client = createClient({
  url: "wss://towhee.example.com",
  authEndpoint: "/api/towhee-token", // your backend signs a token per room
});

const room = client.enter("doc:42");
room.doc.getText("body");             // a Yjs doc: bind any editor
room.setPresence({ cursor: 12 });     // others see it in room.others()
await room.threads.create({ body: "Can we ship this?" });
await room.history.save("Before the rewrite");`;

const serverSample = `import { createRoomToken } from "@towhee/auth";

// In your backend, after checking the user's session:
const token = await createRoomToken(
  { userId: user.id, room, access: "write", user: { name: user.name } },
  { id: "default", secret: process.env.TOWHEE_SECRET },
);
return Response.json({ token });`;

const wireSample = `import { createClient } from "@towhee/client";
import { AvatarStack, CollabProvider, CommentsPanel, ConnectionStatus, CursorSurface, InboxButton, towheeAdapter } from "@junco/collab";

const client = createClient({ url: "wss://towhee.example.com", authEndpoint: "/api/towhee-token" });

export function Doc({ id }: { id: string }) {
  const [adapter] = React.useState(() => towheeAdapter({ room: client.enter(id), inbox: client.inbox }));
  React.useEffect(() => () => adapter.dispose(), [adapter]);
  return (
    <CollabProvider adapter={adapter}>
      <header className="flex items-center gap-2">
        <ConnectionStatus /> <AvatarStack /> <InboxButton />
      </header>
      <CursorSurface>{/* your document */}</CursorSurface>
      <CommentsPanel />
    </CollabProvider>
  );
}`;

const fakeSample = `import { CollabProvider, CommentsPanel, createFakeAdapter } from "@junco/collab";

// Every action works and updates the UI; nothing leaves the page.
const adapter = createFakeAdapter({ threads: [] });

<CollabProvider adapter={adapter}>
  <CommentsPanel anchor="card-1" />
</CollabProvider>`;

const plainSample = `// Or skip the provider and pass data and callbacks yourself:
<CommentsPanel
  threads={threads}
  people={teammates}
  selfId={me.id}
  onCreate={({ text, mentions, anchor }) => api.createThread(...)}
  onReply={(threadId, input) => api.reply(threadId, input)}
/>`;

export default function CollaborationPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Realtime collaboration"
        description="@junco/collab draws the interface; Towhee keeps everyone in sync. Together they give your app live cursors, shared documents, comments, history and an inbox."
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={`${TOWHEE}/demo`} target="_blank" rel="noreferrer">
              Try the live board <ArrowRightIcon className="size-3.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={`${TOWHEE}/docs`}>Towhee docs</a>
          </Button>
        </div>
      </DocHeader>

      <div className="mt-10 grid gap-12">
        <BrowserShot
          light="/showcase/towhee-board-light.png"
          dark="/showcase/towhee-board-dark.png"
          alt="Towhee Board: two people on the same board, one editing a card while the other's cursor moves across it"
          url="towhee.madebytobi.com/demo"
          priority
        />

        <Section id="components" title="The components">
          <P>
            <C>@junco/collab</C> is the interface: presence, cursors, comments, history, inbox and connection status. Try it below on
            fake data: Ada and Bo&apos;s cursors move, comments and versions really save, and the toolbar switches the connection.
          </P>
          <CollabPlayground />
          <CodeBlock lang="bash" code={"npm i @junco/collab\n# or copy the source into components/collab:\nnpx @junco/cli add collab"} />
          <P>
            For documents, pair it with <Link className={link} href="/docs/editor/">@junco/editor</Link>. The{" "}
            <Link className={link} href="/editor/">collaborative docs editor</Link> puts them together on a live Towhee server.
          </P>
          <DataTable
            head={["Component", "What it shows"]}
            rows={[
              [<C key="a">AvatarStack</C>, "Who's here, ringed in their color, +N past a limit, one avatar per person across tabs"],
              [<C key="b">CursorSurface</C>, "An area that shares your pointer and draws everyone else's (LiveCursors on its own takes plain data)"],
              [<C key="c">EditingBar</C>, "“Ada and Bo are editing the introduction”, or nothing when nobody is"],
              [<C key="d">ConnectionStatus</C>, "Live, connecting, reconnecting or offline, in words with a dot, never color alone"],
              [<C key="e">CommentsPanel</C>, "Threads (optionally for one anchor) and a box to start one; CommentThread and CommentComposer on their own"],
              [<C key="f">HistoryPanel</C>, "Save a named version, compare any version with now, restore it for everyone, undo the restore"],
              [<C key="h">VersionCompare</C>, "Two texts merged with additions underlined and removals struck through, announced in words"],
              [<C key="i">ShareDialog</C>, "Invite by email with a role, change or remove people, link access, copy link. Your app owns the data"],
              [<C key="g">InboxButton</C>, "A bell with the unread count; mentions and replies; mark read"],
            ]}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <CollabPiece piece="comments" />
            <CollabPiece piece="history" />
          </div>
        </Section>

        <Section id="adapters" title="Adapters">
          <P>
            The components never talk to a server. Under a <C>CollabProvider</C> they read and write through an adapter; without one
            they show sample data, or whatever data and callbacks you pass.
          </P>
          <CodeBlock lang="tsx" title="Towhee" code={wireSample} />
          <CodeBlock lang="tsx" title="Fake data, for prototypes and tests" code={fakeSample} />
          <CodeBlock lang="tsx" title="Your own backend" code={plainSample} />
          <P>
            Writing an adapter for another backend means implementing <C>CollabAdapter</C>: <C>getState</C>, <C>subscribe</C>{" "}
            and the actions (create, reply, react, resolve, save, restore, mark read, update presence).
          </P>
        </Section>

        <Section id="what" title="What Towhee is">
          <P>
            <a className={link} href={TOWHEE}>
              Towhee
            </a>{" "}
            is an open source (MIT) realtime server, a self-hosted alternative to Liveblocks. It runs on your own Cloudflare account
            (a Worker and Durable Objects) or anywhere Docker runs (Node with SQLite). Your app keeps its users: your backend signs a
            short-lived token for each room, and Towhee checks it.
          </P>
          <P>
            Its own site, docs and the <a className={link} href={`${TOWHEE}/demo`}>live board</a> are built with Junco, so they
            double as a working example of the two together.
          </P>
        </Section>

        <Section id="features" title="What you can build">
          <DataTable
            head={["Feature", "Towhee gives you", "Junco pieces that fit"]}
            rows={[
              ["Presence", "Who's here, their cursor and what they're editing", <C key="p">AvatarStack, CursorSurface, EditingBar</C>],
              ["Shared state", "A Yjs document that syncs live and works offline", <C key="s">Any Yjs editor, ConnectionStatus</C>],
              ["Comments", "Threads anchored to text or anything in your app, with replies, mentions, reactions, resolve", <C key="c">CommentsPanel</C>],
              ["History", "Named and automatic versions, preview, restore for everyone", <C key="h">HistoryPanel</C>],
              ["Notifications", "A per-user inbox for mentions and replies, plus a signed webhook", <C key="n">InboxButton</C>],
            ]}
          />
          <P>
            Ideas: a team board (the <Link className={link} href="/examples/towhee-board/">Towhee Board example</Link>), a docs editor
            with TipTap or BlockNote, a design review tool with pinned comments, a shared checklist or runbook, multiplayer forms.
          </P>
        </Section>

        <Section id="how" title="How to use it">
          <P>
            <strong className="font-medium text-foreground">1. Run a server.</strong> Start the Docker image (
            <C>docker run -p 8080:8080 -e TOWHEE_SECRET -v towhee-data:/data ghcr.io/tobibytes/towhee:0.1.0</C>) or deploy to
            Cloudflare, then <C>npm i @towhee/client @towhee/auth</C> in your app. Both guides are on the Towhee site:{" "}
            <a className={link} href={`${TOWHEE}/docs/cloudflare`}>
              Cloudflare
            </a>
            ,{" "}
            <a className={link} href={`${TOWHEE}/docs/docker`}>
              Docker
            </a>
            .
          </P>
          <P>
            <strong className="font-medium text-foreground">2. Sign tokens in your backend.</strong> One small endpoint, after your
            normal session check.
          </P>
          <CodeBlock lang="tsx" title="api/towhee-token.ts" code={serverSample} />
          <P>
            <strong className="font-medium text-foreground">3. Enter a room in the browser.</strong>
          </P>
          <CodeBlock lang="tsx" title="app.ts" code={clientSample} />
          <P>
            <strong className="font-medium text-foreground">4. Draw it with Junco.</strong> Hand the room to{" "}
            <C>towheeAdapter</C> and put the components under a <C>CollabProvider</C>, as in{" "}
            <a className={link} href="#adapters">
              Adapters
            </a>{" "}
            above. React apps that want the raw data can use Towhee&apos;s own hooks, <C>@towhee/react</C>.
          </P>
          <P>
            The Towhee Board source shows a full app built by hand from Junco pieces: cursors, comment sheets with mentions, the inbox
            popover and the history sheet.{" "}
            <a className={link} href="https://github.com/tobibytes/towhee/tree/main/apps/site/src/demo">
              Read it on GitHub
            </a>
            .
          </P>
        </Section>

        <Section id="managing" title="Running it">
          <P>
            The Towhee docs cover running a server day to day:{" "}
            <a className={link} href={`${TOWHEE}/docs/managing`}>
              health checks, logs, rotating keys, limits, webhooks, upgrades, backups and deleting data
            </a>
            .
          </P>
        </Section>

        <Note title="Status">
          Towhee 0.1 is out: <C>@towhee/*</C> on{" "}
          <a className={link} href="https://www.npmjs.com/org/towhee">
            npm
          </a>{" "}
          and the server image at <C>ghcr.io/tobibytes/towhee</C>. <C>@junco/collab</C> isn&apos;t on npm yet; until its first
          release, use it from the{" "}
          <a className={link} href="https://github.com/tobibytes/junco/tree/main/packages/collab">
            repo
          </a>
          .
        </Note>
      </div>
      <Pager href="/docs/collaboration/" />
    </>
  );
}
