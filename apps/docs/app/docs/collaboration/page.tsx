import type { Metadata } from "next";
import { CollaborationShowcase } from "@junco/collab";
import { CodeBlock } from "@/components/code-block";
import { Pager } from "@/components/docs/pager";
import { C, DocHeader, Note, P, Section } from "@/components/docs/prose";

export const metadata: Metadata = {
  title: "Collaboration",
  description: "Presence, comments, activity, product analytics, history and sharing with Junco's collaboration package and Liveblocks adapter.",
};

export default function CollaborationPage() {
  return (
    <>
      <DocHeader eyebrow="Patterns" title="Collaboration" description="Composable collaboration UI, room activity, privacy-safe tracking and an opt-in Liveblocks adapter for real rooms." />
      <div className="mt-10 grid gap-12">
        <Section id="preview" title="Explore the UI">
          <P>Try presence, comments, history, sharing and room activity below. This preview uses an in-memory fake adapter, so changes stay in this page. The Collaboration workspace example also shows the local analytics event log and optional hosted Liveblocks room.</P>
          <CollaborationShowcase />
        </Section>
        <Section id="install" title="Install">
          <CodeBlock lang="bash" code="pnpm add @junco/collab @liveblocks/client @liveblocks/react @liveblocks/react-ui" />
          <P>Use the base package for adapter interfaces and fake data. Import the Liveblocks entry only in apps that use Liveblocks; those dependencies are optional peers.</P>
        </Section>
        <Section id="liveblocks" title="Connect a Liveblocks room">
          <CodeBlock code={`import "@liveblocks/react-ui/styles.css";
import { CollaborationAnalyticsProvider } from "@junco/collab";
import {
  LiveblocksCollabProvider,
  LiveblocksActivityPanel,
  LiveblocksComments,
  LiveblocksCursorLayer,
  LiveblocksEditingStatus,
  LiveblocksHistoryPanel,
  LiveblocksPresenceStack,
} from "@junco/collab/liveblocks";

<CollaborationAnalyticsProvider roomId={document.id} onTrack={(event) => analytics.capture(event.name, event.properties)}>
  <LiveblocksCollabProvider
    roomId={document.id}
    authEndpoint="/api/liveblocks-auth"
    user={currentUser}
    initialStorage={{ title: document.title }}
    resolveUsers={getUsersById}
    resolveMentionSuggestions={searchMentionableUsers}
  >
    <LiveblocksEditingStatus editing={isEditing} />
    <header className="flex items-center justify-between">
      <h1>{document.title}</h1>
      <LiveblocksPresenceStack />
    </header>
    <LiveblocksCursorLayer><DocumentCanvas /></LiveblocksCursorLayer>
    <LiveblocksComments metadata={{ documentId: document.id, anchor: "overview" }} />
    <LiveblocksActivityPanel />
    <LiveblocksHistoryPanel />
  </LiveblocksCollabProvider>
</CollaborationAnalyticsProvider>`} />
          <Note title="Authentication belongs to your app">
            The collaboration example can use a Junco hosted endpoint restricted to one public, disposable room. For private rooms, deploy an endpoint alongside your app, verify its session and project permissions, then issue a scoped Liveblocks token. The Junco demo endpoint is not an app auth service; Junco never embeds a Liveblocks secret.
          </Note>
        </Section>
        <Section id="adapters" title="Adapter coverage">
          <P>
            The fake adapter demonstrates presence, anchored comments, replies, reactions, version restore, member roles and room activity. The Liveblocks entry connects realtime presence, cursors and comment threads; it also provides comment activity and Storage snapshot preview/restore. Enable Liveblocks version history in project settings to populate its history panel. Sharing stays behind app-owned adapters because it depends on your permission model.
          </P>
        </Section>
        <Section id="tracking" title="Activity and analytics tracking">
          <P><C>ActivityPanel</C> shows fake room events; <C>LiveblocksActivityPanel</C> shows real comment and reply activity. <C>CollaborationAnalyticsProvider</C> sends opt-in, typed events to a callback you connect to your analytics provider. Events exclude comment text, email addresses, display names and document content.</P>
          <CodeBlock code={`import { CollaborationAnalyticsProvider } from "@junco/collab";

<CollaborationAnalyticsProvider
  roomId={document.id}
  onTrack={(event) => posthog.capture(event.name, event.properties)}
>
  <DocumentCollaboration />
</CollaborationAnalyticsProvider>`} />
          <P>The event callback runs only in the browser app that renders the components. The docs example keeps events in local state and sends nothing to an analytics vendor.</P>
        </Section>
      </div>
      <Pager href="/docs/collaboration/" />
    </>
  );
}
