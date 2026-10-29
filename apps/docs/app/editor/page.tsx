import type { Metadata } from "next";
import { Badge } from "@junco/react";
import Link from "next/link";
import { DocsEditor } from "@/components/editor/docs-editor";

export const metadata: Metadata = {
  title: "Collaborative docs editor",
  description:
    "A live Google Docs-style editor built from @junco/editor and @junco/collab, running on Towhee: shared cursors, comments with mentions, an inbox, version history with compare and restore.",
};

export default function EditorPage() {
  return (
    <div className="overflow-x-clip">
      <section className="hero-glow relative border-b border-border">
        <div className="mx-auto grid max-w-3xl justify-items-center gap-3 px-4 pt-14 pb-10 text-center">
          <Badge variant="outline" hasDot color="success" className="animate-rise">
            Live, on Towhee
          </Badge>
          <h1 className="animate-rise text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">Write together</h1>
          <p className="animate-rise max-w-xl text-base text-pretty text-muted-foreground">
            A shared document built from <Link className="underline underline-offset-4" href="/docs/editor/">@junco/editor</Link> and{" "}
            <Link className="underline underline-offset-4" href="/docs/collaboration/">@junco/collab</Link>. Open this page in a second
            window to see the other cursor.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <DocsEditor />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Runs on the public Towhee demo server at{" "}
          <a className="underline underline-offset-4" href="https://towhee.madebytobi.com">
            towhee.madebytobi.com
          </a>
          . You get a random bird name; documents reset a day after they&apos;re made.
        </p>
      </div>
    </div>
  );
}
