# @junco/collab

Collaboration UI for [Junco](https://junco.madebytobi.com): avatar stack, live cursors, who's-editing bar, connection status, comment threads with mentions and reactions, version history and an inbox.

Every component takes plain data and callbacks, reads from a `CollabProvider` when there is one, and shows realistic fake data when there's neither. Backends plug in through an adapter; there's one for [Towhee](https://towhee.madebytobi.com) and an in-memory fake.

```tsx
import { createClient } from "@towhee/client";
import { AvatarStack, CollabProvider, CommentsPanel, ConnectionStatus, CursorSurface, InboxButton, towheeAdapter } from "@junco/collab";

const client = createClient({ url: "wss://towhee.example.com", authEndpoint: "/api/towhee-token" });
const adapter = towheeAdapter({ room: client.enter("doc:42"), inbox: client.inbox });

<CollabProvider adapter={adapter}>
  <ConnectionStatus /> <AvatarStack /> <InboxButton />
  <CursorSurface>{/* your document */}</CursorSurface>
  <CommentsPanel />
</CollabProvider>;
```

| Component | |
| --- | --- |
| `AvatarStack` | Who's here, ringed in their color, `+N` past `max` |
| `CursorSurface`, `LiveCursors` | Share your pointer; draw everyone else's |
| `EditingBar` | "Ada and Bo are editing the introduction" |
| `ConnectionStatus` | Live, connecting, reconnecting, offline |
| `CommentsPanel`, `CommentThread`, `CommentComposer` | Threads, replies, @mentions, reactions, resolve |
| `HistoryPanel` | Save, compare with now, restore, undo restore |
| `VersionCompare` | A word diff of two texts, changes announced in words |
| `ShareDialog` | Invite by email with a role, change or remove people, link access, copy link |
| `InboxButton` | Unread count, mentions and replies, mark read |

Adapters: `towheeAdapter({ room, inbox, restoreOptions })`, `createFakeAdapter(options)`, or implement `CollabAdapter` for another backend.

The package doesn't depend on Towhee: the adapter is typed by shape, so any `@towhee/client` room fits. Pass `textOf` (a Y.Doc to plain text) to turn on version compare.

Install: `npm i @junco/collab @junco/react @junco/tailwind`.

Docs: [junco.madebytobi.com/docs/collaboration](https://junco.madebytobi.com/docs/collaboration/).
