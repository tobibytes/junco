import * as React from "react";
import { cn } from "junco";

/**
 * A segmented control for choosing one option that changes the view (date range, a filter).
 * It's a radio group, not Tabs: Tabs need tab panels, and these options don't own any.
 * Arrow keys move the selection; only the selected option is in the tab order.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + options.length) % options.length;
    onChange(options[next]!.value);
    refs.current[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex items-center gap-0.5 rounded-control border border-border bg-muted p-0.5", className)}
    >
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "inline-flex h-7 flex-1 items-center justify-center rounded-xs px-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground",
              "transition-colors duration-fast ease-standard hover:text-foreground",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              checked && "bg-surface text-foreground shadow-[0_0_0_1px_var(--border)]",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
