"use client";

import { tokens } from "@junco/tokens";
import { cn } from "@/lib/cn";
import * as React from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";
import { Segmented } from "./segmented";

type FrameTheme = "auto" | "light" | "dark";

const isThemed = (value: string) => value.startsWith("oklch(") || value.includes("oklch(");

function varsFor(mode: "light" | "dark"): React.CSSProperties {
  const source = mode === "light" ? tokens.light : { ...tokens.light, ...tokens.dark };
  const style: Record<string, string> = { colorScheme: mode };
  for (const [name, value] of Object.entries(source)) {
    if (isThemed(value)) style[`--${name}`] = value;
  }
  return style as React.CSSProperties;
}

const lightVars = varsFor("light");
const darkVars = varsFor("dark");

/**
 * A preview area that can be pinned to light or dark regardless of the site theme,
 * by re-declaring the color tokens on the frame. Portaled content (menus, tooltips)
 * still follows the site theme.
 */
export function PreviewFrame({
  children,
  className,
  toolbar,
  minHeight = 176,
}: {
  children: React.ReactNode;
  className?: string;
  /** Extra controls shown on the left of the frame's top bar. */
  toolbar?: React.ReactNode;
  minHeight?: number;
}) {
  const [theme, setTheme] = React.useState<FrameTheme>("auto");
  const style = theme === "light" ? lightVars : theme === "dark" ? darkVars : undefined;

  return (
    <div className={cn("overflow-hidden rounded-card border border-border", className)}>
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border bg-surface px-2">
        <div className="flex min-w-0 items-center gap-2">{toolbar}</div>
        <Segmented<FrameTheme>
          label="Preview theme"
          iconOnly
          value={theme}
          onChange={setTheme}
          options={[
            { value: "auto", label: "Match site", icon: <MonitorIcon width={13} height={13} /> },
            { value: "light", label: "Light", icon: <SunIcon width={13} height={13} /> },
            { value: "dark", label: "Dark", icon: <MoonIcon width={13} height={13} /> },
          ]}
        />
      </div>
      <div
        data-theme={theme === "auto" ? undefined : theme}
        className={cn("preview-canvas text-foreground", theme === "dark" && "dark")}
        style={style}
      >
        <div
          className="flex min-h-36 flex-wrap items-center justify-center gap-3 p-6 sm:min-h-(--preview-min-h) sm:p-10"
          style={{ "--preview-min-h": `${minHeight}px` } as React.CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
