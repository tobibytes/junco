"use client";

import { Button, Spinner, Tooltip, useTheme } from "@junco/react";
import * as React from "react";
import { cn } from "@/lib/cn";
import { frameUrl, postToFrame, type FrameTheme } from "@/lib/frame";
import type { BlockEntry } from "@/content/blocks/catalog";
import { ExternalIcon, LaptopIcon, MonitorIcon, MoonIcon, PhoneIcon, RefreshIcon, SunIcon, TabletIcon } from "../icons";
import { Segmented } from "../segmented";
import { useElementWidth } from "./use-element-width";

type Device = "desktop" | "tablet" | "phone";
type ThemeChoice = "site" | FrameTheme;

const PAGE_SIZES: Record<Device, { w: number; h: number }> = {
  desktop: { w: 1280, h: 800 },
  tablet: { w: 768, h: 1024 },
  phone: { w: 390, h: 844 },
};

/** Tallest the stage gets on screen; bigger frames scale down to fit. */
const MAX_STAGE_HEIGHT = 760;

function frameSize(entry: BlockEntry, device: Device) {
  const page = PAGE_SIZES[device];
  if (!entry.height) return page;
  // Sections: desktop uses the section's own height; smaller screens stack, so give them room.
  if (device === "desktop") return { w: page.w, h: entry.height };
  return { w: page.w, h: Math.min(page.h, Math.round(entry.height * (device === "tablet" ? 1.4 : 2))) };
}

/**
 * A live preview of a block or page in an iframe at a real device width, scaled to fit. The frame
 * is the same page you'd get in an app, so media queries, sticky headers and sheets behave for real.
 */
export function BlockViewer({
  entry,
  variant,
  onVariantChange,
}: {
  entry: BlockEntry;
  variant: string;
  onVariantChange: (variant: string) => void;
}) {
  const { resolvedTheme, motion, isMounted } = useTheme();
  const [device, setDevice] = React.useState<Device>("desktop");
  // On a phone, a scaled-down desktop render is unreadable; start with the phone layout.
  React.useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setDevice("phone");
  }, []);
  const [themeChoice, setThemeChoice] = React.useState<ThemeChoice>("site");
  const [loading, setLoading] = React.useState(true);
  const [reloadKey, setReloadKey] = React.useState(0);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const [stageRef, stageWidth] = useElementWidth<HTMLDivElement>();

  const theme: FrameTheme = themeChoice === "site" ? resolvedTheme : themeChoice;
  const themeRef = React.useRef(theme);
  themeRef.current = theme;
  const motionRef = React.useRef(motion);
  motionRef.current = motion;

  // A new src (variant change, reload) carries the current theme in its URL so it paints right
  // the first time; theme changes after that go by message, without reloading the frame.
  const [src, setSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!isMounted) return;
    setLoading(true);
    setSrc(frameUrl(entry.slug, variant, themeRef.current, motionRef.current));
  }, [isMounted, entry.slug, variant, reloadKey]);

  React.useEffect(() => {
    if (!loading) postToFrame(frameRef.current, { theme, motion });
  }, [theme, motion, loading]);

  const size = frameSize(entry, device);
  const available = Math.max(stageWidth - 32, 0);
  const scale = available ? Math.min(1, available / size.w, MAX_STAGE_HEIGHT / size.h) : 0;

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-card border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-2 py-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {entry.variants.length > 1 && (
            <Segmented
              label="Variant"
              value={variant}
              onChange={onVariantChange}
              options={entry.variants.map((v) => ({ value: v.value, label: v.label }))}
            />
          )}
          <Segmented<Device>
            label="Device"
            iconOnly
            value={device}
            onChange={setDevice}
            options={[
              { value: "desktop", label: "Desktop (1280px)", icon: <LaptopIcon width={14} height={14} /> },
              { value: "tablet", label: "Tablet (768px)", icon: <TabletIcon width={14} height={14} /> },
              { value: "phone", label: "Phone (390px)", icon: <PhoneIcon width={14} height={14} /> },
            ]}
          />
        </div>
        <div className="flex items-center gap-1">
          <Segmented<ThemeChoice>
            label="Preview theme"
            iconOnly
            value={themeChoice}
            onChange={setThemeChoice}
            options={[
              { value: "site", label: "Match site", icon: <MonitorIcon width={13} height={13} /> },
              { value: "light", label: "Light", icon: <SunIcon width={13} height={13} /> },
              { value: "dark", label: "Dark", icon: <MoonIcon width={13} height={13} /> },
            ]}
          />
          <Tooltip content="Reload preview">
            <Button variant="ghost" size="icon" className="size-7" aria-label="Reload preview" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshIcon width={14} height={14} />
            </Button>
          </Tooltip>
          <Tooltip content="Open in a new tab">
            <Button asChild variant="ghost" size="icon" className="size-7">
              <a href={frameUrl(entry.slug, variant, theme)} target="_blank" rel="noreferrer" aria-label="Open preview in a new tab">
                <ExternalIcon width={14} height={14} />
              </a>
            </Button>
          </Tooltip>
        </div>
      </div>
      <div ref={stageRef} className="preview-canvas relative flex justify-center p-4">
        <div
          className={cn(
            "relative overflow-hidden bg-background transition-[width,height] duration-base ease-standard",
            device === "desktop" ? "rounded-control border border-border" : "rounded-[1.25rem] border-4 border-foreground/10 shadow-float",
          )}
          style={{ width: size.w * scale, height: size.h * scale }}
        >
          {src && scale > 0 && (
            <iframe
              key={`${entry.slug}-${variant}-${reloadKey}`}
              ref={frameRef}
              src={src}
              title={`${entry.title} preview, ${variant}, ${device}`}
              onLoad={() => setLoading(false)}
              className="absolute top-0 left-0 origin-top-left border-0 bg-background"
              style={{ width: size.w, height: size.h, transform: `scale(${scale})` }}
            />
          )}
          {loading && (
            <div className="absolute inset-0 grid place-items-center bg-background">
              <Spinner label="Loading preview" />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {size.w}px{scale > 0 && scale < 1 ? ` at ${Math.round(scale * 100)}%` : ""}
        </span>
        <span>Scroll inside the preview to see the rest.</span>
      </div>
    </div>
  );
}
