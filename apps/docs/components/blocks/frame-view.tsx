"use client";

import { applyTheme, toast } from "junco";
import * as React from "react";
import { renderBlock } from "@/content/blocks/render";
import { FRAME_PREFIX, type FrameMessage } from "@/lib/frame";

/** The inside of a preview frame: the block itself, plus listeners for theme/motion and demo links. */
export function FrameView({ slug, variant }: { slug: string; variant: string }) {
  React.useEffect(() => {
    function onMessage(e: MessageEvent<FrameMessage>) {
      if (e.origin !== window.location.origin || e.data?.source !== "junco-docs") return;
      const el = document.documentElement;
      const theme = e.data.theme ?? (el.dataset.theme === "dark" ? "dark" : "light");
      const motion = e.data.motion ?? ((el.dataset.motion as FrameMessage["motion"]) || "full");
      applyTheme(theme, motion);
    }
    // The fake product's links (/pricing, /login, ...) don't exist on this site. Keep the preview
    // where it is instead of loading the docs 404 inside the frame. Hash links (#/users) still work.
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname || url.pathname.startsWith(FRAME_PREFIX)) return;
      e.preventDefault();
      toast(`Demo link: ${url.pathname}`, { description: "In your app this goes to your own route." });
    }
    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return <>{renderBlock(slug, variant)}</>;
}
