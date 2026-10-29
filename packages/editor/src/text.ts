import * as Y from "yjs";

/** Text inside an element: inline text joined, child blocks on their own lines. */
function elementText(el: Y.XmlElement | Y.XmlFragment): string {
  const children = el.toArray();
  const blocks = children.some((c) => c instanceof Y.XmlElement);
  return children
    .map((c) => (c instanceof Y.XmlText ? (c.toDelta() as { insert: unknown }[]).map((d) => (typeof d.insert === "string" ? d.insert : "")).join("") : elementText(c as Y.XmlElement)))
    .join(blocks ? "\n" : "");
}

/**
 * A collaborative editor's document as plain text, one block per line. Use it to compare versions:
 * `towheeAdapter({ room, textOf: (doc) => editorText(doc) })`.
 */
export function editorText(doc: Y.Doc, field = "default"): string {
  return elementText(doc.getXmlFragment(field));
}
