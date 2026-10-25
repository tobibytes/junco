import * as React from "react";
import { cn } from "../lib/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Shows a required marker. Also set `required` on the control so assistive tech knows. */
  isRequired?: boolean;
}

/** A form label with an optional required marker. */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, isRequired, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 text-sm leading-5 font-medium text-foreground select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {isRequired && (
        <span aria-hidden className="text-destructive-text">
          *
        </span>
      )}
    </label>
  ),
);
Label.displayName = "Label";
