import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";

export const badgeVariants = tv({
  base: [
    "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-pill border px-2",
    "text-xs leading-none font-medium",
  ],
  variants: {
    variant: {
      solid: "border-transparent",
      outline: "border-border bg-transparent",
    },
    color: {
      neutral: "",
      primary: "",
      success: "",
      warning: "",
      danger: "",
    },
    /** Adds a leading dot. Pair it with a text label: status is never shown by color alone. */
    hasDot: {
      true: "before:size-1.5 before:rounded-pill before:bg-current before:content-['']",
    },
  },
  compoundVariants: [
    { variant: "solid", color: "neutral", class: "border-border bg-secondary text-secondary-foreground" },
    { variant: "solid", color: "primary", class: "bg-primary text-primary-foreground" },
    { variant: "solid", color: "success", class: "bg-success text-success-foreground" },
    { variant: "solid", color: "warning", class: "bg-warning text-warning-foreground" },
    { variant: "solid", color: "danger", class: "bg-destructive text-destructive-foreground" },
    { variant: "outline", color: "neutral", class: "text-foreground" },
    { variant: "outline", color: "primary", class: "text-primary" },
    { variant: "outline", color: "success", class: "text-success-text" },
    { variant: "outline", color: "warning", class: "text-warning-text" },
    { variant: "outline", color: "danger", class: "text-destructive-text" },
  ],
  defaultVariants: { variant: "solid", color: "neutral", hasDot: false },
});

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof badgeVariants> {}

/** A short label for status or counts. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, color, hasDot, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, color, hasDot }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";
