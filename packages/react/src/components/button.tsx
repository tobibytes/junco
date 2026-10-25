import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

/**
 * Reference component. Every Junco component should follow this shape:
 * - variants from tailwind-variants
 * - tokens only (no raw colors)
 * - className override, asChild for links
 * - accessible states (disabled, aria-busy)
 */
export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "rounded-control border text-sm font-medium",
    "transition-colors duration-fast ease-standard",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      solid: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border-border bg-surface text-foreground hover:bg-accent",
      soft: "border-transparent bg-secondary text-secondary-foreground hover:bg-accent",
      ghost: "border-transparent bg-transparent text-foreground hover:bg-accent",
      danger: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    size: {
      sm: "h-8 px-2.5 text-[13px]",
      md: "h-9 px-3.5",
      lg: "h-11 px-4.5 text-[15px]",
      icon: "size-9 p-0",
    },
  },
  defaultVariants: { variant: "solid", size: "md" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (for example a link) instead of a button. */
  asChild?: boolean;
  /** Shows a spinner, disables the button and sets aria-busy. */
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={asChild ? undefined : disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && !asChild ? (
          <>
            <Spinner label={null} className="size-3.5" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
