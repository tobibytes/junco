import type { Metadata } from "next";
import { Button } from "@junco/react";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DataTable, DocHeader, Note, P, Section } from "@/components/docs/prose";
import { BrowserShot } from "@/components/examples/shot";
import { ArrowRightIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Realtime collaboration",
  description:
    "Add live cursors, shared documents, comments, version history and notifications to a Junco app with Towhee, an open source collaboration server you host yourself.",
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

const avatarSample = `import { Avatar, Tooltip } from "@junco/react";

function People({ room }) {
  const [others, setOthers] = React.useState(room.others());
  React.useEffect(() => room.on("others", () => setOthers(room.others())), [room]);
  return (
    <div className="flex -space-x-2">
      {others.map((o) => (
        <Tooltip key={o.clientId} content={o.user.name}>
          <Avatar name={o.user.name} size="sm" />
        </Tooltip>
      ))}
    </div>
  );
}`;

export default function CollaborationPage() {
  return (
    <>
      <DocHeader
        eyebrow="Getting started"
        title="Realtime collaboration"
        description="Junco draws the interface; Towhee keeps everyone in sync. Together they give your app live cursors, shared documents, comments, history and an inbox."
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
              ["Presence", "Who's here, their cursor and what they're editing", <C key="p">Avatar</C>],
              ["Shared state", "A Yjs document that syncs live and works offline", <C key="s">Input, Textarea, any Yjs editor</C>],
              ["Comments", "Threads anchored to text or anything in your app, with replies, mentions, reactions, resolve", <C key="c">Sheet, Textarea, DropdownMenu</C>],
              ["History", "Named and automatic versions, preview, restore for everyone", <C key="h">Sheet, toast</C>],
              ["Notifications", "A per-user inbox for mentions and replies, plus a signed webhook", <C key="n">Popover, Badge, EmptyState</C>],
            ]}
          />
          <P>
            Ideas: a team board (the <Link className={link} href="/examples/towhee-board/">Towhee Board example</Link>), a docs editor
            with TipTap or BlockNote, a design review tool with pinned comments, a shared checklist or runbook, multiplayer forms.
          </P>
        </Section>

        <Section id="how" title="How to use it">
          <P>
            <strong className="font-medium text-foreground">1. Run a server.</strong> Deploy Towhee to Cloudflare or start the Docker
            image. Both guides are on the Towhee site:{" "}
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
            <strong className="font-medium text-foreground">4. Draw it with Junco.</strong> Room data goes straight into Junco
            components. For example, an avatar stack of who&apos;s here:
          </P>
          <CodeBlock lang="tsx" title="people.tsx" code={avatarSample} />
          <P>
            The Towhee Board source shows the rest: cursors, comment sheets with mentions, the inbox popover and the history sheet.{" "}
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
          Towhee works end to end today (its site and the live board run on it), but its packages publish to npm with v0.1. Until
          then, install from the{" "}
          <a className={link} href="https://github.com/tobibytes/towhee">
            repo
          </a>
          . Ready-made Junco collaboration components (<C>@junco/collab</C>: avatar stack, cursors, comment threads, history and
          inbox) are planned, built on the same pieces the board uses.
        </Note>
      </div>
      <Pager href="/docs/collaboration/" />
    </>
  );
}
