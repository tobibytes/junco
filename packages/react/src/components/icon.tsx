import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";

export const iconVariants = tv({
  base: "inline-block shrink-0 align-[-0.125em] [stroke-width:var(--icon-stroke)]",
  variants: {
    size: {
      xs: "size-3",
      sm: "size-3.5",
      md: "size-4",
      lg: "size-5",
      xl: "size-6",
    },
  },
  defaultVariants: { size: "md" },
});

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref">, VariantProps<typeof iconVariants> {
  /** The icon component to render, e.g. `Search` from lucide-react. Any SVG component works. */
  as: React.ElementType;
  /** Makes the icon meaningful: read as an image with this name. Leave it out for decorative icons. */
  label?: string;
}

/**
 * Renders any SVG icon at a type-scale size with the `--icon-stroke` weight. Decorative by
 * default (hidden from screen readers); pass `label` when the icon carries meaning on its own.
 *
 *   import { Search } from "lucide-react";
 *   <Icon as={Search} />                      // decorative, next to text
 *   <Icon as={Search} label="Search" />       // meaningful on its own
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(({ as: Comp, label, size, className, style, strokeWidth, ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(iconVariants({ size }), className)}
    style={strokeWidth === undefined ? style : { strokeWidth, ...style }}
    focusable="false"
    {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    {...props}
  />
));
Icon.displayName = "Icon";
