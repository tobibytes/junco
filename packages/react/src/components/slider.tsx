import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { SliderPrimitive } from "../lib/primitives";
import { useFieldControl } from "./field";

export const sliderVariants = tv({
  slots: {
    root: [
      "relative flex w-full touch-none items-center select-none",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
      "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
    ],
    track: "relative grow overflow-hidden rounded-pill bg-border data-[orientation=vertical]:w-1.5",
    range: "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
    thumb: [
      "block rounded-pill border border-border-strong bg-surface shadow-float",
      "transition-[transform,border-color] duration-fast ease-standard hover:border-primary",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "data-[disabled]:pointer-events-none",
    ],
  },
  variants: {
    size: {
      sm: { track: "h-1", thumb: "size-3.5" },
      md: { track: "h-1.5", thumb: "size-4" },
    },
  },
  defaultVariants: { size: "md" },
});

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
  /** One accessible name per thumb, e.g. ["Minimum", "Maximum"] for a range. A single thumb also takes `aria-label`. */
  thumbLabels?: string[];
  /** What screen readers say for a value, e.g. (v) => `${v} minutes`. */
  getValueLabel?: (value: number) => string;
  classNames?: { root?: string; track?: string; range?: string; thumb?: string };
}

/** Pick a number, or a range with two thumbs, by dragging or with the arrow keys. */
export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, classNames, size, thumbLabels, getValueLabel, "aria-label": ariaLabel, ...rest }, ref) => {
    const { id, ...props } = useFieldControl(rest) as SliderProps;
    // Thumbs are spans, which a <label for> can't name, so a Field's label is linked by id instead.
    const fieldLabelId = !rest.id && id ? `${id}-label` : undefined;
    const values = props.value ?? props.defaultValue ?? [props.min ?? 0];
    const styles = sliderVariants({ size });
    return (
      <SliderPrimitive.Root ref={ref} className={styles.root({ className: cn(classNames?.root, className) })} {...props}>
        <SliderPrimitive.Track className={styles.track({ className: classNames?.track })}>
          <SliderPrimitive.Range className={styles.range({ className: classNames?.range })} />
        </SliderPrimitive.Track>
        {values.map((v, i) => (
          <SliderPrimitive.Thumb
            // biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional and never reorder
            key={i}
            id={i === 0 ? id : undefined}
            aria-label={thumbLabels?.[i] ?? (values.length === 1 ? ariaLabel : undefined)}
            aria-labelledby={i === 0 && !thumbLabels && !ariaLabel ? fieldLabelId : undefined}
            aria-valuetext={getValueLabel?.(v)}
            className={styles.thumb({ className: classNames?.thumb })}
          />
        ))}
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = "Slider";
