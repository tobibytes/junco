import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";

export const progressVariants = tv({
  slots: {
    root: "relative w-full overflow-hidden rounded-pill bg-border",
    indicator: "h-full w-full rounded-pill transition-transform duration-slow ease-standard",
  },
  variants: {
    size: {
      sm: { root: "h-1" },
      md: { root: "h-2" },
      lg: { root: "h-3" },
    },
    color: {
      primary: { indicator: "bg-primary" },
      success: { indicator: "bg-success" },
      warning: { indicator: "bg-warning" },
      danger: { indicator: "bg-destructive" },
    },
    isIndeterminate: {
      true: { indicator: "w-2/5 animate-progress" },
    },
  },
  defaultVariants: { size: "md", color: "primary" },
});

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    Omit<VariantProps<typeof progressVariants>, "isIndeterminate"> {
  /** From 0 to `max`. Leave it out (or pass null) while the amount is unknown: the bar slides instead. */
  value?: number | null;
  max?: number;
  /** What screen readers say for the current value, e.g. "3 of 12 cards". Defaults to the percentage. */
  getValueLabel?: (value: number, max: number) => string;
  classNames?: { root?: string; indicator?: string };
}

/** Shows how far along a task is. Give it an `aria-label`, or point `aria-labelledby` at a visible label. */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, classNames, size, color, value = null, max = 100, getValueLabel, ...props }, ref) => {
    const known = value !== null && Number.isFinite(value) && max > 0;
    const clamped = known ? Math.min(Math.max(value, 0), max) : 0;
    const styles = progressVariants({ size, color, isIndeterminate: !known });
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={known ? clamped : undefined}
        aria-valuetext={known ? (getValueLabel?.(clamped, max) ?? `${Math.round((clamped / max) * 100)}%`) : undefined}
        data-state={known ? (clamped >= max ? "complete" : "loading") : "indeterminate"}
        className={styles.root({ className: cn(classNames?.root, className) })}
        {...props}
      >
        <div
          className={styles.indicator({ className: classNames?.indicator })}
          style={known ? { transform: `translateX(-${100 - (clamped / max) * 100}%)` } : undefined}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";
