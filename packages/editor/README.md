# @junco/editor

A rich text editor for [Junco](https://junco.madebytobi.com) on [TipTap](https://tiptap.dev): a formatting toolbar, a `/` command menu and markdown shortcuts, styled by Junco's tokens in light and dark. Give it a Y.Doc and it's collaborative, with everyone's carets.

```tsx
import { Editor } from "@junco/editor";

<Editor content="<p>Hello</p>" onUpdate={(editor) => save(editor.getJSON())} />;

// Together, on Towhee (or any Yjs provider):
<Editor doc={room.doc} provider={room} />;
```

Also: `Toolbar`, `SlashMenu`, `defaultSlashCommands` and `editorText(doc)` (a document as plain text, for version compare).

Docs: [junco.madebytobi.com/docs/editor](https://junco.madebytobi.com/docs/editor/) · Live: [junco.madebytobi.com/editor](https://junco.madebytobi.com/editor/)
