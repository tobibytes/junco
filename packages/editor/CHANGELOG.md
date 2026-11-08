# @junco/editor

## 0.1.2

### Patch Changes

- d9cb0bb: Interface details pass, following Vercel's Web Interface Guidelines and Anthropic's frontend-design skill.

  - Tokens set `color-scheme` (light and dark), so native scrollbars, date pickers and form controls follow the theme.
  - Inputs, textareas, the command palette search and the `.input`/`.textarea`/`.select` classes are 16px on phones, so iOS Safari no longer zooms in on focus. Wider screens keep the design size.
  - Base styles: no grey tap flash, `touch-action: manipulation` on controls (no double-tap zoom wait), balanced headings and pretty paragraphs.
  - Dialog, Sheet and Command lists keep scrolling inside (`overscroll-contain`) instead of scrolling the page behind.
  - Collab `AvatarStack`: the color ring is drawn inside each avatar, so overlapping avatars no longer hide each other's initials.
  - Editor: the toolbar no longer stretches when the editor has a min height.
  - Blocks `Hero` and `CtaSection`: no arrow icons on the buttons.

- Updated dependencies [d9cb0bb]
  - @junco/react@0.3.1

## 0.1.1

### Patch Changes

- Updated dependencies [91ea769]
  - @junco/react@0.3.0

## 0.1.0

### Minor Changes

- 6c37090: First release of the rich text editor: TipTap with Junco's look, a formatting toolbar, a / command menu and markdown shortcuts. Pass a Y.Doc and a provider to edit together with named carets; editorText turns a document into plain text for version compare.
