"use client";

import { Editor } from "@junco/editor";
import { PreviewFrame } from "../preview";

const SAMPLE = `<h2>Release notes</h2>
<p>Select some text and try the toolbar, or type <code>/</code> on a new line.</p>
<ul><li><p><strong>Faster sync</strong> on slow networks</p></li><li><p>Comments on any block</p></li></ul>
<blockquote><p>Markdown works too: start a line with # or - or &gt;.</p></blockquote>`;

/** The editor on its own, not shared. */
export function EditorPreview() {
  return (
    <PreviewFrame minHeight={360}>
      <div className="w-full max-w-2xl text-left">
        <Editor content={SAMPLE} />
      </div>
    </PreviewFrame>
  );
}
