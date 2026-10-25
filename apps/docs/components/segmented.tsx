"use client";

import { cn } from "@/lib/cn";
import * as React from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

/**
 * A small radiogroup styled as a segmented control. Arrow keys move the selection,
 * as the ARIA radio pattern expects; only the checked option is in the tab order.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  iconOnly = false,
  className,
}: {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  iconOnly?: boolean;
  className?: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + options.length) % options.length;
    onChange(options[next]!.value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-control border border-border bg-muted p-0.5", className)}
    >
      {options.map((option, i) => {
        const checked = option.value === value;
        const noneChecked = !options.some((o) => o.value === value);
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={iconOnly ? option.label : undefined}
            title={iconOnly ? option.label : undefined}
            tabIndex={checked || (noneChecked && i === 0) ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex h-6 items-center justify-center gap-1.5 rounded-xs px-2 text-xs font-medium text-muted-foreground",
              "transition-colors duration-fast ease-standard hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
              "aria-checked:bg-surface aria-checked:text-foreground aria-checked:shadow-[0_0_0_1px_var(--border)]",
              iconOnly && "w-7 px-0",
            )}
          >
            {option.icon}
            {!iconOnly && option.label}
          </button>
        );
      })}
    </div>
  );
}
