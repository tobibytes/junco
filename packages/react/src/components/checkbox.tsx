import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { CheckIcon, MinusIcon } from "../lib/icons";
import { CheckboxPrimitive } from "../lib/primitives";
import { useFieldControl } from "./field";

export const checkboxVariants = tv({
  base: [
    "peer inline-grid shrink-0 place-items-center rounded-xs border border-border-strong bg-surface text-primary-foreground",
    "transition-colors duration-fast ease-standard",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
    "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
    "aria-invalid:border-destructive",
  ],
  variants: {
    size: {
      sm: "size-3.5 [&_svg]:size-2.5",
      md: "size-4 [&_svg]:size-3",
      lg: "size-5 [&_svg]:size-3.5",
    },
  },
  defaultVariants: { size: "md" },
});

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  isInvalid?: boolean;
}

/** A checkbox. `checked` can be true, false or "indeterminate". Pair it with a <Label htmlFor>. */
export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size, isInvalid, ...rest }, ref) => {
    const props = useFieldControl({ ...rest, "aria-invalid": isInvalid || rest["aria-invalid"] || undefined });
    return (
      <CheckboxPrimitive.Root ref={ref} className={cn(checkboxVariants({ size }), className)} {...props}>
        <CheckboxPrimitive.Indicator className="group grid place-items-center">
          <CheckIcon strokeWidth={3} className="group-data-[state=indeterminate]:hidden" />
          <MinusIcon strokeWidth={3} className="hidden group-data-[state=indeterminate]:block" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );
  },
);
Checkbox.displayName = "Checkbox";
