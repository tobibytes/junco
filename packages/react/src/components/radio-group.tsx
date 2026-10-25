import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { RadioGroupPrimitive } from "../lib/primitives";

export const radioVariants = tv({
  base: [
    "peer inline-grid shrink-0 place-items-center rounded-pill border border-border-strong bg-surface",
    "transition-colors duration-fast ease-standard",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:border-primary",
  ],
  variants: {
    size: {
      sm: "size-3.5 [&>span>span]:size-1.5",
      md: "size-4 [&>span>span]:size-2",
      lg: "size-5 [&>span>span]:size-2.5",
    },
  },
  defaultVariants: { size: "md" },
});

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {}

/** Arrow keys move between options; Tab leaves the group. Give the group an aria-label or aria-labelledby. */
export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("grid gap-2 data-[orientation=horizontal]:flex data-[orientation=horizontal]:gap-4", className)}
      {...props}
    />
  ),
);
RadioGroup.displayName = "RadioGroup";

export interface RadioProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioVariants> {}

export const Radio = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, RadioProps>(
  ({ className, size, ...props }, ref) => (
    <RadioGroupPrimitive.Item ref={ref} className={cn(radioVariants({ size }), className)} {...props}>
      <RadioGroupPrimitive.Indicator className="grid place-items-center">
        <span className="block rounded-pill bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  ),
);
Radio.displayName = "Radio";
