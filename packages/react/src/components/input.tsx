import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { useFieldControl } from "./field";

export const inputVariants = tv({
  base: [
    "block w-full border border-input bg-surface text-foreground",
    "placeholder:text-muted-foreground",
    "transition-[border-color,box-shadow] duration-fast ease-standard",
    "focus-visible:border-transparent focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  ],
  variants: {
    size: {
      sm: "h-8 rounded-control px-2.5 text-[13px]",
      md: "h-9 rounded-card px-3 text-sm",
      lg: "h-11 rounded-card px-3.5 text-base",
    },
  },
  defaultVariants: { size: "md" },
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Marks the field invalid (sets aria-invalid). Pair it with an error message linked by aria-describedby. */
  isInvalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", isInvalid, ...rest }, ref) => {
    const props = useFieldControl({ ...rest, "aria-invalid": isInvalid || rest["aria-invalid"] || undefined });
    return <input ref={ref} type={type} className={cn(inputVariants({ size }), className)} {...props} />;
  },
);
Input.displayName = "Input";
