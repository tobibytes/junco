import { LiveblocksActivityPanel, LiveblocksCollabProvider, LiveblocksComments, LiveblocksCursorLayer, LiveblocksHistoryPanel, LiveblocksPresenceStack } from "@junco/collab/liveblocks";
import type { CollabUser } from "@junco/collab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@junco/react";
import { useMutation, useStorage } from "@liveblocks/react/suspense";
import "@liveblocks/react-ui/styles.css";

const roomId = "junco:collaboration-demo";

function LiveDemoStorage() {
  const title = useStorage((root) => root.title) as string | undefined;
  const updateTitle = useMutation(({ storage }, value: string) => storage.set("title", value), []);
  return <label className="grid gap-2 rounded-card border border-border bg-card p-4 text-sm"><span className="font-medium">Shared document title</span><input value={title ?? ""} onChange={(event) => updateTitle(event.target.value)} maxLength={120} className="rounded-control border border-border bg-background px-3 py-2" /><span className="text-xs text-muted-foreground">Changes sync to everyone in this room and can appear in Storage history snapshots.</span></label>;
}

export default function LiveRoom({ user, authEndpoint }: { user: CollabUser; authEndpoint: string }) {
  return <LiveblocksCollabProvider roomId={roomId} authEndpoint={authEndpoint} user={user} initialStorage={{ title: "Junco collaboration demo", description: "Shared room storage for the version-history preview." }}><div className="grid gap-5"><div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-card p-4"><div><p className="font-medium">Public docs demo</p><p className="text-sm text-muted-foreground">Messages are visible to everyone in this shared demo room.</p></div><LiveblocksPresenceStack /></div><LiveblocksCursorLayer className="min-h-24 rounded-card border border-dashed border-border p-5"><p className="text-sm text-muted-foreground">Move your pointer here to share your cursor.</p></LiveblocksCursorLayer><LiveDemoStorage /><Card><CardHeader><CardTitle>Live comments</CardTitle><CardDescription>Comments are shared with everyone in this public demo room.</CardDescription></CardHeader><CardContent><LiveblocksComments metadata={{ demo: true }} /></CardContent></Card><LiveblocksActivityPanel /><LiveblocksHistoryPanel /></div></LiveblocksCollabProvider>;
}
