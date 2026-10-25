import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { SwitchPrimitive } from "../lib/primitives";
import { useFieldControl } from "./field";

export const switchVariants = tv({
  slots: {
    root: [
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-pill border border-transparent bg-input p-px",
      "transition-colors duration-base ease-standard",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary",
    ],
    thumb: [
      "pointer-events-none block rounded-pill bg-surface shadow-float",
      "transition-transform duration-base ease-spring data-[state=unchecked]:translate-x-0",
    ],
  },
  variants: {
    size: {
      sm: { root: "h-4 w-7", thumb: "size-3.5 data-[state=checked]:translate-x-3" },
      md: { root: "h-5 w-9", thumb: "size-[18px] data-[state=checked]:translate-x-4" },
      lg: { root: "h-6 w-11", thumb: "size-[22px] data-[state=checked]:translate-x-5" },
    },
  },
  defaultVariants: { size: "md" },
});

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  classNames?: { root?: string; thumb?: string };
}

/** An on/off toggle that applies immediately. For a choice submitted with a form, prefer Checkbox. */
export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, classNames, size, ...rest }, ref) => {
    const props = useFieldControl(rest);
    const styles = switchVariants({ size });
    return (
      <SwitchPrimitive.Root ref={ref} className={styles.root({ className: cn(classNames?.root, className) })} {...props}>
        <SwitchPrimitive.Thumb className={styles.thumb({ className: classNames?.thumb })} />
      </SwitchPrimitive.Root>
    );
  },
);
Switch.displayName = "Switch";
