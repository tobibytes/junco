"use client";

import {
  AvatarStack,
  CollabProvider,
  CommentsPanel,
  ConnectionStatus,
  HistoryPanel,
  InboxButton,
  ShareDialog,
  towheeAdapter,
} from "@junco/collab";
import { Editor, editorText, type TiptapEditor } from "@junco/editor";
import { Button, Input, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, Spinner } from "@junco/react";
import { createClient, type RoomConnection, type TowheeClient } from "@towhee/client";
import * as React from "react";

/** The Towhee server the demo runs on. Its /demo/token signs anonymous tokens for demo:* rooms. */
const SERVER = process.env.NEXT_PUBLIC_TOWHEE_URL ?? "https://towhee.madebytobi.com";

const STARTER = `<h1>Launch plan</h1>
<p>Everyone on this page edits the same document. Open the link in another window, or send it to someone, and watch the cursors.</p>
<h2>Try it</h2>
<ul><li><p>Type <code>/</code> on an empty line for headings, lists, quotes and code.</p></li><li><p>Select text and use the toolbar, or <strong>⌘B</strong> and <em>⌘I</em>.</p></li><li><p>Leave a comment and @mention someone who's here: it lands in their inbox.</p></li><li><p>Save a version in History, change things, then compare and restore.</p></li></ul>
<blockquote><p>Documents reset a day after they're made.</p></blockquote>`;

/** A random id for this browser, kept in localStorage: the demo server turns it into a bird name. */
function visitorId(): string {
  const make = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
  try {
    const known = localStorage.getItem("junco-editor-visitor");
    if (known && /^[a-f0-9]{24}$/.test(known)) return known;
    const id = make();
    localStorage.setItem("junco-editor-visitor", id);
    return id;
  } catch {
    return make();
  }
}

/** The document id from ?doc=, or a new one (then this browser writes the starter text). */
function docId(): { id: string; isNew: boolean } {
  const url = new URL(location.href);
  const known = url.searchParams.get("doc");
  if (known && /^[a-z0-9]{6,20}$/.test(known)) return { id: known, isNew: false };
  const id = Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
  url.searchParams.set("doc", id);
  history.replaceState(null, "", url);
  return { id, isNew: true };
}

let shared: { client: TowheeClient; visitor: string } | undefined;
function demoClient() {
  if (!shared) {
    const visitor = visitorId();
    // Token requests wait for the first, like the Towhee board, so the room and inbox share one identity.
    let first: Promise<unknown> | undefined;
    const token = async (room: string) => {
      const request = async () => {
        const res = await fetch(`${SERVER}/demo/token`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ room, visitor }),
        });
        if (!res.ok) throw new Error(`The demo server refused (${res.status})`);
        return ((await res.json()) as { token: string }).token;
      };
      if (first) await first.catch(() => {});
      const p = request();
      first ??= p;
      return p;
    };
    shared = { client: createClient({ url: SERVER.replace(/^http/, "ws"), authEndpoint: token }), visitor };
  }
  return shared;
}

function useRoom() {
  const [state, setState] = React.useState<{ room: RoomConnection; isNew: boolean; link: string } | null>(null);
  React.useEffect(() => {
    const { id, isNew } = docId();
    const room = demoClient().client.enter(`demo:junco-${id}`);
    setState({ room, isNew, link: location.href });
    return () => room.leave();
  }, []);
  return state;
}

/** The document's title, shared like everything else, in a Y.Map. */
function Title({ room }: { room: RoomConnection }) {
  const meta = React.useMemo(() => room.doc.getMap<string>("meta"), [room]);
  const [title, setTitle] = React.useState(() => meta.get("title") ?? "");
  React.useEffect(() => {
    const update = () => setTitle(meta.get("title") ?? "");
    meta.observe(update);
    return () => meta.unobserve(update);
  }, [meta]);
  return (
    <Input
      aria-label="Document title"
      placeholder="Untitled"
      value={title}
      onChange={(e) => meta.set("title", e.target.value)}
      className="h-9 max-w-xs border-transparent bg-transparent px-2 text-base font-semibold shadow-none hover:border-border focus-visible:border-input"
    />
  );
}

export function DocsEditor() {
  const session = useRoom();
  const adapter = React.useMemo(
    () =>
      session
        ? towheeAdapter({
            room: session.room,
            inbox: demoClient().client.inbox,
            restoreOptions: { types: { default: "xml", meta: "map" } },
            textOf: (doc) => editorText(doc),
          })
        : null,
    [session],
  );
  React.useEffect(() => () => adapter?.dispose(), [adapter]);

  // The browser that made the document writes the starter text, once the (empty) server copy has arrived.
  const seed = React.useCallback(
    (editor: TiptapEditor) => {
      if (!session?.isNew) return;
      const write = () => {
        if (session.room.doc.getXmlFragment("default").length === 0) {
          editor.commands.setContent(STARTER);
          session.room.doc.getMap("meta").set("title", "Launch plan");
        }
      };
      if (session.room.synced) write();
      else {
        const off = session.room.on("synced", (synced) => {
          if (synced) {
            off();
            write();
          }
        });
      }
    },
    [session],
  );

  if (!session || !adapter) {
    return (
      <div className="grid min-h-96 place-items-center text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <Spinner size="sm" label={null} /> Opening the document…
        </span>
      </div>
    );
  }

  return (
    <CollabProvider adapter={adapter}>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Title room={session.room} />
          <span className="mr-auto" />
          <ConnectionStatus />
          <AvatarStack />
          <InboxButton />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                Comments
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Comments</SheetTitle>
                <SheetDescription>Mention someone who&apos;s here and it lands in their inbox.</SheetDescription>
              </SheetHeader>
              <CommentsPanel />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline">
                History
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Version history</SheetTitle>
                <SheetDescription>Compare a version with now, or restore it for everyone.</SheetDescription>
              </SheetHeader>
              <HistoryPanel />
            </SheetContent>
          </Sheet>
          <ShareDialog trigger={<Button size="sm">Share</Button>} title="Share this document" link={session.link} />
        </div>
        <Editor doc={session.room.doc} provider={session.room} onReady={seed} label="Shared document" className="min-h-[28rem]" />
      </div>
    </CollabProvider>
  );
}
