"use client";

import { Badge, Button } from "junco";
import { cn } from "@/lib/cn";
import * as React from "react";
import { accentCss, makeAccent, presets, setSiteAccent, useSiteAccent } from "@/lib/accent";
import { CheckIcon, RefreshIcon } from "./icons";
import { CodeBlock, CopyButton } from "./code-block";

/** The preset colors as a radio group. Picking one re-themes the whole site. */
export function AccentSwatches({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { hue, chroma, touched } = useSiteAccent();
  return (
    <div role="radiogroup" aria-label="Accent color" className={cn("flex flex-wrap gap-2", className)}>
      {presets.map((p) => {
        const checked = touched ? p.hue === hue && p.chroma === chroma : p.name === "Blue";
        return (
          <button
            key={p.name}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={p.name}
            title={p.name}
            onClick={() => setSiteAccent({ hue: p.hue, chroma: p.chroma })}
            className={cn(
              "grid place-items-center rounded-pill border border-border transition-transform duration-fast ease-standard hover:scale-105",
              size === "sm" ? "size-7" : "size-8",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "aria-checked:ring-2 aria-checked:ring-foreground aria-checked:ring-offset-2 aria-checked:ring-offset-background",
            )}
            style={{ background: makeAccent(p.hue, p.chroma).light.primary }}
          >
            {checked && <CheckIcon width={14} height={14} className="text-white" strokeWidth={2.5} />}
          </button>
        );
      })}
    </div>
  );
}

/** Pick a hue, see the whole site re-theme, and get the CSS. */
export function AccentPicker({ compact = false }: { compact?: boolean }) {
  const { hue, chroma, touched } = useSiteAccent();
  const accent = React.useMemo(() => makeAccent(hue, chroma), [hue, chroma]);
  const pick = (h: number, c: number) => setSiteAccent({ hue: h, chroma: c });
  const reset = () => setSiteAccent(null);

  const allPass = accent.checks.every((c) => c.ratio >= 4.5);

  return (
    <div className="grid gap-5">
      <AccentSwatches />

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <label className="grid gap-2 text-sm">
          <span className="flex justify-between">
            <span className="font-medium">Hue</span>
            <span className="font-mono text-xs text-muted-foreground">{Math.round(hue)}°</span>
          </span>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => pick(Number(e.target.value), chroma)}
            className="h-2 w-full cursor-pointer appearance-none rounded-pill accent-(--primary)"
            style={{
              background:
                "linear-gradient(to right, oklch(0.62 0.18 0), oklch(0.62 0.18 60), oklch(0.62 0.18 120), oklch(0.62 0.18 180), oklch(0.62 0.18 240), oklch(0.62 0.18 300), oklch(0.62 0.18 360))",
            }}
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="flex justify-between">
            <span className="font-medium">Chroma</span>
            <span className="font-mono text-xs text-muted-foreground">{chroma.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={0.25}
            step={0.01}
            value={chroma}
            onChange={(e) => pick(hue, Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-pill accent-(--primary)"
            style={{ background: `linear-gradient(to right, oklch(0.62 0 ${hue}), oklch(0.62 0.25 ${hue}))` }}
          />
        </label>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium">Contrast checks</span>
          <Badge variant="outline" color={allPass ? "success" : "danger"} hasDot>
            {allPass ? "All pass 4.5:1" : "Some fail"}
          </Badge>
        </div>
        <ul className={cn("grid gap-1.5 text-sm", !compact && "sm:grid-cols-2")}>
          {accent.checks.map((c) => (
            <li key={c.label + c.mode} className="flex items-center justify-between gap-2 rounded-control border border-border bg-surface px-3 py-1.5">
              <span className="text-muted-foreground">
                {c.label} <span className="text-xs">({c.mode})</span>
              </span>
              <span className={cn("font-mono text-xs tabular-nums", c.ratio >= 4.5 ? "text-success-text" : "text-destructive-text")}>
                {c.ratio.toFixed(2)}:1 {c.ratio >= 4.5 ? "pass" : "fail"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {!compact && (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your CSS</span>
            <CopyButton text={accentCss(accent)} label="Copy CSS" />
          </div>
          <CodeBlock lang="css" code={accentCss(accent)} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={reset} disabled={!touched}>
          <RefreshIcon width={14} height={14} /> Reset to default
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {touched ? "Previewing on this whole site until you reset or reload." : "Pick a color to re-theme the site."}
        </span>
      </div>
    </div>
  );
}
