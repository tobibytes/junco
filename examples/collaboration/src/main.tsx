import { CollaborationAnalyticsProvider, CollaborationShowcase } from "@junco/collab";
import type { CollaborationEvent } from "@junco/collab";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@junco/react";
import { lazy, StrictMode, Suspense, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const roomId = "junco:collaboration-demo";
const authEndpoint = (import.meta.env.VITE_JUNCO_COLLAB_AUTH_ENDPOINT as string | undefined) || "https://collab-auth.junco.madebytobi.com/auth";
const LiveRoom = lazy(() => import("./live-room"));

function getGuest() {
  const saved = localStorage.getItem("junco-collab-demo-user");
  if (saved) return JSON.parse(saved) as { id: string; name: string; color: string };
  const guest = { id: `guest-${crypto.randomUUID()}`, name: "Junco guest", color: "#4263eb" };
  localStorage.setItem("junco-collab-demo-user", JSON.stringify(guest));
  return guest;
}

function App() {
  const [events, setEvents] = useState<CollaborationEvent[]>([]);
  const [live, setLive] = useState(false);
  const [liveAvailable, setLiveAvailable] = useState(false);
  const user = useMemo(getGuest, []);
  const track = (event: CollaborationEvent) => setEvents((current) => [event, ...current].slice(0, 12));
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    const healthEndpoint = authEndpoint.replace(/\/auth\/?$/, "/health");
    fetch(healthEndpoint, { signal: controller.signal }).then((response) => setLiveAvailable(response.ok)).catch(() => setLiveAvailable(false)).finally(() => window.clearTimeout(timeout));
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, []);
  return (
    <CollaborationAnalyticsProvider roomId={roomId} onTrack={track}>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
          <div className="grid gap-2"><Badge variant="outline" className="w-fit">@junco/collab</Badge><h1 className="text-3xl font-semibold tracking-tight">Collaboration workspace</h1><p className="max-w-2xl text-sm text-muted-foreground">Explore reusable Junco collaboration UI, recent room activity and privacy-safe product analytics events.</p></div>
          <div className="flex items-center gap-2"><Button variant={live ? "outline" : "solid"} onClick={() => setLive(false)}>Fake data</Button><Button variant={live ? "solid" : "outline"} disabled={!liveAvailable} onClick={() => setLive(true)}>Live room</Button></div>
        </header>
        {!liveAvailable && <p className="rounded-control border border-border bg-muted/50 p-3 text-sm text-muted-foreground">The hosted Liveblocks room is not available yet. Fake mode is fully interactive; the live option turns on automatically when Junco's demo service is deployed.</p>}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <section className="min-w-0" aria-label="Collaboration preview">
            {live && liveAvailable ? <Suspense fallback={<p className="rounded-card border border-border p-4 text-sm text-muted-foreground">Loading the Liveblocks client…</p>}><LiveRoom user={user} authEndpoint={authEndpoint} /></Suspense> : <CollaborationShowcase />}
          </section>
          <aside className="grid content-start gap-5"><Card><CardHeader><CardTitle>Analytics events</CardTitle><CardDescription>Captured locally by the example. No event is sent to a third party.</CardDescription></CardHeader><CardContent><ol className="grid gap-3">{events.map((event, index) => <li key={`${event.timestamp}-${index}`} className="border-b border-border pb-2 last:border-0"><code className="text-xs">{event.name}</code><time className="mt-1 block text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</time></li>)}{events.length === 0 && <li className="text-sm text-muted-foreground">Try a collaboration action to see a privacy-safe event.</li>}</ol></CardContent></Card></aside>
        </div>
      </main>
    </CollaborationAnalyticsProvider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
