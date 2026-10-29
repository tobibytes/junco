import { cn } from "@junco/react";
import type { Editor } from "@tiptap/react";
import * as React from "react";
import { createPortal } from "react-dom";
import { CodeBlockIcon, ListIcon, ListOrderedIcon, MinusIcon, QuoteIcon, TextIcon } from "./icons";

export interface SlashCommand {
  id: string;
  label: string;
  /** Extra words to match while typing. */
  keywords?: string;
  icon?: React.ReactNode;
  /** Runs after the "/query" text is removed. */
  run: (editor: Editor) => void;
}

const heading = (level: 1 | 2 | 3): SlashCommand => ({
  id: `h${level}`,
  label: `Heading ${level}`,
  keywords: `title h${level}`,
  icon: <span className="text-xs font-semibold">H{level}</span>,
  run: (e) => e.chain().focus().setHeading({ level }).run(),
});

export const defaultSlashCommands: SlashCommand[] = [
  { id: "text", label: "Text", keywords: "paragraph plain", icon: <TextIcon className="size-4" />, run: (e) => e.chain().focus().setParagraph().run() },
  heading(1),
  heading(2),
  heading(3),
  { id: "bullet", label: "Bulleted list", keywords: "ul unordered", icon: <ListIcon className="size-4" />, run: (e) => e.chain().focus().toggleBulletList().run() },
  { id: "ordered", label: "Numbered list", keywords: "ol ordered", icon: <ListOrderedIcon className="size-4" />, run: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: "quote", label: "Quote", keywords: "blockquote", icon: <QuoteIcon className="size-4" />, run: (e) => e.chain().focus().setBlockquote().run() },
  { id: "code", label: "Code block", keywords: "pre snippet", icon: <CodeBlockIcon className="size-4" />, run: (e) => e.chain().focus().setCodeBlock().run() },
  { id: "divider", label: "Divider", keywords: "hr rule line", icon: <MinusIcon className="size-4" />, run: (e) => e.chain().focus().setHorizontalRule().run() },
];

interface Open {
  from: number;
  to: number;
  query: string;
  left: number;
  top: number;
}

/** "/" at the start of a line or after a space, then letters: the open command and where it is. */
function findSlash(editor: Editor): Omit<Open, "left" | "top"> | null {
  const { state } = editor;
  const { $from, empty } = state.selection;
  if (!empty || $from.parent.type.spec.code) return null;
  const before = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
  const match = /(?:^|\s)\/([\w-]{0,24})$/.exec(before);
  if (!match) return null;
  return { from: $from.pos - match[1]!.length - 1, to: $from.pos, query: match[1]!.toLowerCase() };
}

/** The "/" command menu. Arrow keys move, Enter runs, Escape closes. Shown by `Editor`. */
export function SlashMenu({ editor, commands = defaultSlashCommands }: { editor: Editor; commands?: SlashCommand[] }) {
  const [open, setOpen] = React.useState<Open | null>(null);
  const [index, setIndex] = React.useState(0);
  const [dismissedAt, setDismissedAt] = React.useState<number | null>(null);
  const listId = React.useId();

  const matches = React.useMemo(
    () => (open ? commands.filter((c) => `${c.label} ${c.keywords ?? ""}`.toLowerCase().includes(open.query)) : []),
    [commands, open],
  );

  React.useEffect(() => {
    if (commands.length === 0) return;
    const update = () => {
      const found = findSlash(editor);
      if (!found || found.from === dismissedAt) {
        setOpen(null);
        return;
      }
      const at = editor.view.coordsAtPos(found.from);
      setOpen((prev) => {
        // A new "/" or a changed query starts at the first match; other transactions keep the highlight.
        if (!prev || prev.from !== found.from || prev.query !== found.query) setIndex(0);
        return { ...found, left: at.left, top: at.bottom + 6 };
      });
    };
    const close = () => setOpen(null);
    editor.on("transaction", update);
    editor.on("blur", close);
    return () => {
      editor.off("transaction", update);
      editor.off("blur", close);
    };
  }, [editor, commands.length, dismissedAt]);

  const choose = React.useCallback(
    (command: SlashCommand | undefined) => {
      if (!command || !open) return;
      editor.chain().focus().deleteRange({ from: open.from, to: open.to }).run();
      command.run(editor);
      setOpen(null);
    },
    [editor, open],
  );

  React.useEffect(() => {
    if (!open || matches.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      const handled = ["ArrowDown", "ArrowUp", "Enter", "Tab", "Escape"].includes(e.key);
      if (handled) {
        // The editor listens on the same element: keep the key from also moving the caret or splitting the line.
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const step = e.key === "ArrowDown" ? 1 : -1;
        setIndex((i) => (i + step + matches.length) % matches.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        choose(matches[index]);
      } else if (e.key === "Escape") {
        setDismissedAt(open.from);
        setOpen(null);
      }
    };
    const dom = editor.view.dom;
    dom.addEventListener("keydown", onKey, true);
    return () => dom.removeEventListener("keydown", onKey, true);
  }, [editor, open, matches, index, choose]);

  // Typing a new "/" somewhere else brings the menu back.
  React.useEffect(() => {
    if (dismissedAt !== null && findSlash(editor)?.from !== dismissedAt) setDismissedAt(null);
  });

  React.useEffect(() => {
    editor.view.dom.setAttribute("aria-expanded", String(Boolean(open && matches.length)));
    if (open && matches.length) {
      editor.view.dom.setAttribute("aria-controls", listId);
      editor.view.dom.setAttribute("aria-activedescendant", `${listId}-${matches[index]?.id}`);
    } else {
      editor.view.dom.removeAttribute("aria-activedescendant");
    }
  }, [editor, open, matches, index, listId]);

  if (!open || matches.length === 0 || typeof document === "undefined") return null;
  return createPortal(
    <div
      id={listId}
      role="listbox"
      aria-label="Commands"
      className="fixed z-popover w-60 animate-pop-in overflow-hidden rounded-card border border-border bg-popover p-1 text-popover-foreground shadow-float"
      style={{ left: open.left, top: open.top }}
    >
      {matches.map((c, i) => (
        <div
          key={c.id}
          id={`${listId}-${c.id}`}
          role="option"
          tabIndex={-1}
          aria-selected={i === index}
          onMouseDown={(e) => {
            e.preventDefault();
            choose(c);
          }}
          onMouseEnter={() => setIndex(i)}
          className={cn("flex h-9 cursor-default items-center gap-2.5 rounded-control px-2 text-sm", i === index && "bg-accent text-accent-foreground")}
        >
          <span className="grid size-6 place-items-center rounded-xs border border-border bg-surface text-muted-foreground">{c.icon}</span>
          {c.label}
        </div>
      ))}
    </div>,
    document.body,
  );
}
