import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { useFieldControl } from "./field";

export const textareaVariants = tv({
  base: [
    "block w-full rounded-card border border-input bg-surface text-foreground",
    "placeholder:text-muted-foreground",
    "transition-[border-color,box-shadow] duration-fast ease-standard",
    "focus-visible:border-transparent focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
  ],
  variants: {
    size: {
      sm: "min-h-16 rounded-control px-2.5 py-1.5 text-[13px]",
      md: "min-h-20 px-3 py-2 text-sm",
      lg: "min-h-24 px-3.5 py-2.5 text-base",
    },
    /** Grow with the content (CSS field-sizing; browsers without it keep a fixed height). */
    autoResize: {
      true: "field-sizing-content resize-none",
      false: "resize-y",
    },
  },
  defaultVariants: { size: "md", autoResize: false },
});

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  isInvalid?: boolean;
}

/** A multi-line text field that can grow with its content (autoResize). */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, autoResize, isInvalid, ...rest }, ref) => {
    const props = useFieldControl({ ...rest, "aria-invalid": isInvalid || rest["aria-invalid"] || undefined });
    return <textarea ref={ref} className={cn(textareaVariants({ size, autoResize }), className)} {...props} />;
  },
);
Textarea.displayName = "Textarea";
