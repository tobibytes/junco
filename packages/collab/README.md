# @junco/collab

Collaboration UI and adapters for Junco apps. The base entry provides provider-neutral data types, adapter interfaces, an in-memory fake adapter, and UI for presence, comments, history, sharing, save status and room activity. The optional `./liveblocks` entry adds a Liveblocks room provider, presence stack, cursor layer, realtime comment threads, comment activity, and Storage version history preview/restore.

```tsx
import { CollaborationShowcase } from "@junco/collab";

<CollaborationShowcase />
```

Install Liveblocks peers to use real rooms:

```sh
pnpm add @junco/collab @liveblocks/client @liveblocks/react @liveblocks/react-ui
```

Junco collaboration components use Tailwind classes. Add the installed package to Tailwind v4's sources in your app stylesheet:

```css
@import "tailwindcss";
@import "@junco/tailwind";
@source "../node_modules/@junco/react/dist";
@source "../node_modules/@junco/collab/dist";
```

Use `authEndpoint` for private rooms in production. `publicApiKey` is available for intentionally open prototypes. Never put a Liveblocks secret in browser code. Import `@liveblocks/react-ui/styles.css` in your app stylesheet when rendering `LiveblocksComments`.

Liveblocks handles realtime presence and comments. History and sharing depend on app-owned document storage and permissions, so their interfaces are provided for adapters without assuming a backend.

For comments, pass `resolveUsers` and `resolveMentionSuggestions` to `LiveblocksCollabProvider` to enable display names, avatars, and mention suggestions. `LiveblocksComments` accepts thread metadata so apps can attach discussions to a document, section, or other app-owned anchor.

For `LiveblocksHistoryPanel`, pass any app-specific `initialStorage` to the provider and enable version history in the Liveblocks project settings. The panel lists available snapshots, previews a selected Storage snapshot and restores it. Yjs editors can use the matching Liveblocks editor integration for version previews.

## Product analytics

Wrap collaboration UI in `CollaborationAnalyticsProvider` to receive typed interaction events. They include the room ID, event name, timestamp and a small set of numeric/status properties. They never include comment text, email addresses, display names or document contents.

```tsx
import { CollaborationAnalyticsProvider } from "@junco/collab";

<CollaborationAnalyticsProvider
  roomId={document.id}
  onTrack={(event) => analytics.capture(event.name, event.properties)}
>
  <DocumentCollaboration />
</CollaborationAnalyticsProvider>
```

## Junco-hosted demo room

The public example at `/examples/collaboration/` can connect to `https://collab-auth.junco.madebytobi.com/auth` after the Worker is deployed. That endpoint runs in `apps/collab-auth`, only grants access to one disposable public demo room, and is not suitable for app authentication. Private apps must validate their own user session and membership before issuing room-scoped tokens.
