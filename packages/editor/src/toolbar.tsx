import { cn, Tooltip } from "@junco/react";
import { type Editor, useEditorState } from "@tiptap/react";
import type * as React from "react";
import { BoldIcon, CodeBlockIcon, CodeIcon, ItalicIcon, ListIcon, ListOrderedIcon, QuoteIcon, RedoIcon, StrikeIcon, UndoIcon } from "./icons";

const mod = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl+";

function Tool({ label, shortcut, active, disabled, onClick, children }: { label: string; shortcut?: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip content={shortcut ? `${label} (${shortcut})` : label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active === undefined ? undefined : active}
        disabled={disabled}
        // Keep the selection: a mousedown on the button would otherwise blur the editor first.
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={cn(
          "inline-grid size-8 place-items-center rounded-control text-muted-foreground transition-colors duration-fast ease-standard",
          "hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40",
          active && "bg-accent text-foreground",
        )}
      >
        {children}
      </button>
    </Tooltip>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px bg-border" />;

/** Formatting buttons that reflect the selection. Shown by `Editor`; use it on its own with any TipTap editor. */
export function Toolbar({ editor, className }: { editor: Editor; className?: string }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const run = (fn: (c: ReturnType<Editor["chain"]>) => ReturnType<Editor["chain"]>) => fn(editor.chain().focus()).run();
  return (
    <div role="toolbar" aria-label="Formatting" className={cn("flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-2 py-1.5", className)}>
      <Tool label="Bold" shortcut={`${mod}B`} active={s.bold} onClick={() => run((c) => c.toggleBold())}>
        <BoldIcon className="size-4" />
      </Tool>
      <Tool label="Italic" shortcut={`${mod}I`} active={s.italic} onClick={() => run((c) => c.toggleItalic())}>
        <ItalicIcon className="size-4" />
      </Tool>
      <Tool label="Strikethrough" active={s.strike} onClick={() => run((c) => c.toggleStrike())}>
        <StrikeIcon className="size-4" />
      </Tool>
      <Tool label="Inline code" active={s.code} onClick={() => run((c) => c.toggleCode())}>
        <CodeIcon className="size-4" />
      </Tool>
      <Divider />
      {([1, 2, 3] as const).map((level) => (
        <Tool key={level} label={`Heading ${level}`} active={s[`h${level}`]} onClick={() => run((c) => c.toggleHeading({ level }))}>
          <span className="text-xs font-semibold">H{level}</span>
        </Tool>
      ))}
      <Divider />
      <Tool label="Bulleted list" active={s.bullet} onClick={() => run((c) => c.toggleBulletList())}>
        <ListIcon className="size-4" />
      </Tool>
      <Tool label="Numbered list" active={s.ordered} onClick={() => run((c) => c.toggleOrderedList())}>
        <ListOrderedIcon className="size-4" />
      </Tool>
      <Tool label="Quote" active={s.quote} onClick={() => run((c) => c.toggleBlockquote())}>
        <QuoteIcon className="size-4" />
      </Tool>
      <Tool label="Code block" active={s.codeBlock} onClick={() => run((c) => c.toggleCodeBlock())}>
        <CodeBlockIcon className="size-4" />
      </Tool>
      <Divider />
      <Tool label="Undo" shortcut={`${mod}Z`} disabled={!s.canUndo} onClick={() => run((c) => c.undo())}>
        <UndoIcon className="size-4" />
      </Tool>
      <Tool label="Redo" shortcut={`${mod}Shift+Z`} disabled={!s.canRedo} onClick={() => run((c) => c.redo())}>
        <RedoIcon className="size-4" />
      </Tool>
    </div>
  );
}
