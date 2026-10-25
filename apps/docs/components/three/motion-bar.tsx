"use client";

import { ThemeSegmented, MotionSegmented } from "../theme-controls";

/** Sticky theme + motion controls for gallery pages, so their effect is visible right away. */
export function MotionBar({ note }: { note?: string }) {
  return (
    <div className="sticky top-14 z-sticky -mx-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Theme</span>
        <ThemeSegmented />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Motion</span>
        <MotionSegmented />
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}
