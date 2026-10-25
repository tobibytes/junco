import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";

export const spinnerVariants = tv({
  base: "inline-block shrink-0 animate-spinner rounded-pill border-current border-r-transparent",
  variants: {
    size: {
      sm: "size-3 border-[1.5px]",
      md: "size-4 border-2",
      lg: "size-6 border-[2.5px]",
    },
  },
  defaultVariants: { size: "md" },
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof spinnerVariants> {
  /** Read by screen readers. Pass `null` when something nearby already announces the loading state. */
  label?: string | null;
}

/** A loading indicator. It keeps turning (slower) with motion off, since it carries meaning. */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, label = "Loading", ...props }, ref) => (
    <span
      ref={ref}
      role={label ? "status" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  ),
);
Spinner.displayName = "Spinner";
