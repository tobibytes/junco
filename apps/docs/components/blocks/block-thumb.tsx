"use client";

import { useTheme } from "@junco/react";
import * as React from "react";
import { frameUrl, postToFrame } from "@/lib/frame";
import { useElementWidth } from "./use-element-width";

const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 800;

/**
 * A live, scaled-down, non-interactive render of a block for gallery cards. The frame renders at
 * desktop width so layouts look real, then scales to the card.
 */
export function BlockThumb({ slug, variant, title }: { slug: string; variant: string; title: string }) {
  const { resolvedTheme, isMounted } = useTheme();
  const [boxRef, width] = useElementWidth<HTMLDivElement>();
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = React.useState(false);
  // The first theme goes in the URL; later changes go by message so frames don't reload.
  const [initialTheme, setInitialTheme] = React.useState<"light" | "dark" | null>(null);

  React.useEffect(() => {
    if (isMounted && !initialTheme) setInitialTheme(resolvedTheme);
  }, [isMounted, resolvedTheme, initialTheme]);

  React.useEffect(() => {
    if (loaded) postToFrame(frameRef.current, { theme: resolvedTheme, motion: "off" });
  }, [loaded, resolvedTheme]);

  const scale = width / FRAME_WIDTH;
  return (
    <div ref={boxRef} className="relative aspect-[16/10] overflow-hidden bg-background" inert>
      {initialTheme && width > 0 && (
        <iframe
          ref={frameRef}
          // Motion off: thumbnails are stills, so effects show their final state and nothing runs.
          src={frameUrl(slug, variant, initialTheme, "off")}
          title={`${title} preview`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden
          onLoad={() => setLoaded(true)}
          className="pointer-events-none absolute top-0 left-0 origin-top-left border-0 transition-opacity duration-base ease-standard"
          style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }}
        />
      )}
      {!loaded && <div aria-hidden className="absolute inset-0 animate-skeleton bg-muted" />}
    </div>
  );
}
