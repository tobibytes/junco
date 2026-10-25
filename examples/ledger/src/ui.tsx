import * as React from "react";
import { cn } from "@junco/react";
import { categoryById, usd, type CategoryId } from "./data";
import { categoryIcon } from "./icons";

/** Category tints come from the chart tokens, always next to the name, never on their own. */
const TINT: Record<CategoryId, string> = {
  rent: "bg-chart-1/12 text-chart-1",
  groceries: "bg-chart-2/12 text-chart-2",
  dining: "bg-chart-3/15 text-chart-3",
  transport: "bg-chart-4/12 text-chart-4",
  shopping: "bg-chart-5/12 text-chart-5",
  subscriptions: "bg-chart-1/12 text-chart-1",
  fun: "bg-chart-4/12 text-chart-4",
  health: "bg-chart-2/12 text-chart-2",
  income: "bg-success/12 text-success-text",
  savings: "bg-primary/12 text-primary",
};

export function CategoryIcon({ category, className }: { category: CategoryId; className?: string }) {
  const Icon = categoryIcon[category];
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-card", TINT[category], className)} aria-hidden>
      <Icon className="size-4" />
    </span>
  );
}

export function Amount({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("font-medium tabular-nums", value > 0 && "text-success-text", className)}>
      {usd(value, { sign: true })}
    </span>
  );
}

/**
 * A progress bar with a real progressbar role. `tone` changes the fill, and callers always show the
 * numbers in text too (over budget is never shown by color alone).
 */
export function Meter({
  value,
  max,
  label,
  tone = "primary",
  size = "md",
  className,
}: {
  value: number;
  max: number;
  label: string;
  tone?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(Math.min(value, max))}
      aria-valuetext={`${usd(value, { cents: false })} of ${usd(max, { cents: false })}`}
      className={cn(
        "overflow-hidden rounded-pill bg-muted",
        size === "sm" && "h-1.5",
        size === "md" && "h-2",
        size === "lg" && "h-3",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-pill transition-[width] duration-slow ease-standard",
          tone === "primary" && "bg-primary",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "danger" && "bg-destructive",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function categoryLabel(id: CategoryId) {
  return categoryById[id].label;
}

/** A section heading with an optional action on the right. */
export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}
