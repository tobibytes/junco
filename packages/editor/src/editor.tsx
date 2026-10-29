import { cn } from "@junco/react";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import Placeholder from "@tiptap/extension-placeholder";
import { type Editor as TiptapEditor, EditorContent, type Extensions, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as React from "react";
import type * as Y from "yjs";
import { SlashMenu, type SlashCommand } from "./slash";
import { Toolbar } from "./toolbar";

/** Anything with a y-protocols Awareness: a Towhee room, a y-websocket or Hocuspocus provider. */
export interface AwarenessProvider {
  // biome-ignore lint/suspicious/noExplicitAny: y-protocols Awareness, typed loosely to keep it optional
  awareness: any;
}

export interface EditorProps {
  /** Starting content (HTML or TipTap JSON) when not collaborating. Ignored with `doc`: the document is the content. */
  content?: string | Record<string, unknown>;
  /** A shared Y.Doc to edit together. */
  doc?: Y.Doc;
  /** The fragment in `doc` this editor owns. Default `"default"`. */
  field?: string;
  /** Shows everyone's carets and selections. Pass the room or provider that holds the Awareness. */
  provider?: AwarenessProvider;
  /** You, as others see your caret. Towhee fills this in from the token, so it's optional there. */
  user?: { name: string; color?: string };
  placeholder?: string;
  editable?: boolean;
  /** Default true. */
  toolbar?: boolean;
  /** Commands for the "/" menu. Default: text, headings, lists, quote, code, divider. Pass [] to turn it off. */
  slashCommands?: SlashCommand[];
  /** Extra TipTap extensions. */
  extensions?: Extensions;
  onReady?: (editor: TiptapEditor) => void;
  onUpdate?: (editor: TiptapEditor) => void;
  /** Accessible name for the editing area. Default "Document". */
  label?: string;
  className?: string;
  classNames?: { root?: string; toolbar?: string; content?: string };
}

/**
 * Typography for the editing area, from Junco's tokens. Carets from other people get a neutral
 * name tag with a border in their color, so the text keeps its contrast for any color.
 */
const proseClasses = cn(
  "min-h-48 px-4 py-3 text-[15px] leading-7 text-foreground outline-none",
  "[&_.ProseMirror]:min-h-44 [&_.ProseMirror]:outline-none [&_.ProseMirror>*+*]:mt-3",
  "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li>p]:my-0",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]",
  "[&_pre]:rounded-card [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_hr]:my-6 [&_hr]:border-border [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
  "[&_.collaboration-carets\\_\\_caret]:relative [&_.collaboration-carets\\_\\_caret]:-mx-px [&_.collaboration-carets\\_\\_caret]:border-x [&_.collaboration-carets\\_\\_caret]:border-solid",
  "[&_.collaboration-carets\\_\\_label]:absolute [&_.collaboration-carets\\_\\_label]:-top-5 [&_.collaboration-carets\\_\\_label]:-left-px [&_.collaboration-carets\\_\\_label]:rounded-xs [&_.collaboration-carets\\_\\_label]:border-2 [&_.collaboration-carets\\_\\_label]:bg-popover [&_.collaboration-carets\\_\\_label]:px-1.5 [&_.collaboration-carets\\_\\_label]:text-[11px] [&_.collaboration-carets\\_\\_label]:leading-4 [&_.collaboration-carets\\_\\_label]:font-medium [&_.collaboration-carets\\_\\_label]:whitespace-nowrap [&_.collaboration-carets\\_\\_label]:text-popover-foreground [&_.collaboration-carets\\_\\_label]:select-none",
);

function caret(user: Record<string, unknown>): HTMLElement {
  const color = typeof user.color === "string" ? user.color : "var(--primary)";
  const cursor = document.createElement("span");
  cursor.className = "collaboration-carets__caret";
  cursor.style.borderColor = color;
  const label = document.createElement("span");
  label.className = "collaboration-carets__label";
  label.style.borderColor = color;
  label.textContent = typeof user.name === "string" ? user.name : "Someone";
  cursor.append(label);
  return cursor;
}

/**
 * A rich text editor: bold, italic, headings, lists, quotes, code, links, markdown shortcuts and a
 * "/" command menu. Give it a Y.Doc (and the room that holds its Awareness) and everyone edits
 * the same document with their carets showing.
 */
export function Editor({
  content,
  doc,
  field = "default",
  provider,
  user,
  placeholder = "Write something, or press / for commands",
  editable = true,
  toolbar = true,
  slashCommands,
  extensions = [],
  onReady,
  onUpdate,
  label = "Document",
  className,
  classNames,
}: EditorProps) {
  const callbacks = React.useRef({ onReady, onUpdate });
  callbacks.current = { onReady, onUpdate };

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable,
      content: doc ? undefined : content,
      extensions: [
        // Yjs brings its own undo, which only undoes your changes; ProseMirror's would undo everyone's.
        StarterKit.configure({ undoRedo: doc ? false : undefined, link: { openOnClick: false } }),
        Placeholder.configure({ placeholder }),
        ...(doc ? [Collaboration.configure({ document: doc, field })] : []),
        ...(doc && provider ? [CollaborationCaret.configure({ provider, user: user ?? {}, render: caret })] : []),
        ...extensions,
      ],
      editorProps: { attributes: { "aria-label": label, "aria-multiline": "true", role: "textbox" } },
      onCreate: ({ editor: e }) => callbacks.current.onReady?.(e),
      onUpdate: ({ editor: e }) => callbacks.current.onUpdate?.(e),
    },
    [doc, field, provider],
  );

  React.useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  return (
    <div className={cn("grid overflow-hidden rounded-card border border-border bg-surface", className, classNames?.root)}>
      {toolbar && editor && editable && <Toolbar editor={editor} className={classNames?.toolbar} />}
      <EditorContent editor={editor} className={cn(proseClasses, classNames?.content)} />
      {editor && editable && <SlashMenu editor={editor} commands={slashCommands} />}
    </div>
  );
}
