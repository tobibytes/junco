"use client";

import {
  AvatarStack,
  CollabProvider,
  CommentsPanel,
  ConnectionStatus,
  type ConnectionStatusValue,
  CursorSurface,
  createFakeAdapter,
  EditingBar,
  type FakeAdapter,
  HistoryPanel,
  InboxButton,
  ShareDialog,
  useCollabState,
} from "@junco/collab";
import { Button, cn, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@junco/react";
import * as React from "react";
import { PreviewFrame } from "../preview";
import { Segmented } from "../segmented";

const BLOCKS = [
  { id: "intro", title: "Launch plan", text: "We ship the new editor on November 12. Beta users move over a week earlier, and the changelog goes out the same morning." },
  { id: "pricing", title: "Pricing", text: "Teams stay at $8 a seat. Editors with more than 50 seats get the annual discount automatically." },
  { id: "risks", title: "Risks", text: "Search indexing is the slow part. If it isn't ready, we launch without it and add it the week after." },
];
const LABELS = Object.fromEntries(BLOCKS.map((b) => [b.id, b.title.toLowerCase()]));

/** A fake adapter whose other people drift around, like a live room. */
function useDemoAdapter(): FakeAdapter {
  const [adapter] = React.useState(() => createFakeAdapter());
  React.useEffect(() => {
    const clamp = (v: number) => Math.min(0.9, Math.max(0.06, v));
    const timer = setInterval(() => {
      adapter.set({
        peers: adapter.getState().peers.map((p) =>
          p.cursor ? { ...p, cursor: { x: clamp(p.cursor.x + (Math.random() - 0.5) * 0.25), y: clamp(p.cursor.y + (Math.random() - 0.5) * 0.2) } } : p,
        ),
      });
    }, 1400);
    return () => clearInterval(timer);
  }, [adapter]);
  return adapter;
}

function Doc() {
  const state = useCollabState();
  return (
    <CursorSurface className="grid gap-3 rounded-card border border-border bg-background p-4 text-left">
      {BLOCKS.map((b) => {
        const editors = (state?.peers ?? []).filter((p) => p.editing === b.id);
        const color = editors[0]?.user.color;
        return (
          <section
            key={b.id}
            className={cn("grid gap-1 rounded-control border p-3", editors.length ? "border-transparent" : "border-border")}
            style={editors.length ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
          >
            <h4 className="text-sm font-medium">{b.title}</h4>
            <p className="text-sm text-muted-foreground">{b.text}</p>
          </section>
        );
      })}
    </CursorSurface>
  );
}

/** The whole set on a fake document: presence, cursors, comments, history, inbox and status. */
export function CollabPlayground() {
  const adapter = useDemoAdapter();
  const [status, setStatus] = React.useState<ConnectionStatusValue>("connected");
  return (
    <CollabProvider adapter={adapter}>
      <PreviewFrame
        minHeight={420}
        toolbar={
          <Segmented<ConnectionStatusValue>
            label="Connection"
            value={status}
            onChange={(s) => {
              setStatus(s);
              adapter.set({ status: s });
            }}
            options={[
              { value: "connected", label: "Live" },
              { value: "reconnecting", label: "Reconnecting" },
              { value: "offline", label: "Offline" },
            ]}
          />
        }
      >
        <div className="grid w-full max-w-2xl gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-auto text-sm font-medium">Launch doc</span>
            <ConnectionStatus />
            <AvatarStack />
            <InboxButton />
            <ShareDialog trigger={<Button size="sm">Share</Button>} title="Share “Launch doc”" link="https://junco.madebytobi.com/docs/collaboration/" />
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline">
                  Comments
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Comments</SheetTitle>
                  <SheetDescription>Mention someone and it lands in their inbox.</SheetDescription>
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
                  <SheetDescription>Restoring changes the document for everyone.</SheetDescription>
                </SheetHeader>
                <HistoryPanel onUndo={() => {}} />
              </SheetContent>
            </Sheet>
          </div>
          <EditingBar labels={LABELS} />
          <Doc />
          {status !== "connected" && <ConnectionStatus showDetail className="justify-center" />}
        </div>
      </PreviewFrame>
    </CollabProvider>
  );
}

/** One component on fake data, with a working fake backend behind it. */
export function CollabPiece({ piece }: { piece: "comments" | "history" }) {
  const [adapter] = React.useState(() => createFakeAdapter());
  return (
    <CollabProvider adapter={adapter}>
      <PreviewFrame minHeight={320}>
        <div className="w-full max-w-md text-left">{piece === "comments" ? <CommentsPanel /> : <HistoryPanel onUndo={() => {}} />}</div>
      </PreviewFrame>
    </CollabProvider>
  );
}
