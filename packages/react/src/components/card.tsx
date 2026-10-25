import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";

export const cardVariants = tv({
  base: "flex flex-col rounded-card text-card-foreground",
  variants: {
    variant: {
      /** Border on the card background. The default. */
      outline: "border border-border bg-card",
      /** A quiet filled panel, for grouping inside another card or a sidebar. */
      muted: "border border-transparent bg-muted",
      /** Floats above the page (menus, hover cards). The only card with a shadow. */
      elevated: "border border-border bg-popover text-popover-foreground shadow-float",
      /** No border or fill; just the spacing and parts. */
      ghost: "border border-transparent",
    },
    /** Hover and focus styles for a card that is itself a link or button. */
    isInteractive: {
      true: [
        "cursor-pointer transition-colors duration-fast ease-standard hover:border-foreground/20 hover:bg-accent/40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      ],
    },
  },
  defaultVariants: { variant: "outline", isInteractive: false },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

/**
 * A bordered container for grouping related content, with header, title, description, action, content and footer parts.
 *
 *   <Card>
 *     <CardHeader><CardTitle>Usage</CardTitle><CardDescription>Last 30 days</CardDescription></CardHeader>
 *     <CardContent>...</CardContent>
 *     <CardFooter>...</CardFooter>
 *   </Card>
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant, isInteractive, ...props }, ref) => (
  <div ref={ref} data-slot="card" className={cn(cardVariants({ variant, isInteractive }), className)} {...props} />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn("grid gap-1 px-5 pt-5 [&:last-child]:pb-5 has-[[data-slot=card-action]]:grid-cols-[1fr_auto]", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level. Default h3. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Comp = "h3", ...props }, ref) => (
    <Comp ref={ref} data-slot="card-title" className={cn("text-base leading-6 font-semibold tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

/** Top-right slot in a CardHeader, for a button or menu. */
export const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  ),
);
CardAction.displayName = "CardAction";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-content" className={cn("px-5 pt-4 [&:first-child]:pt-5 [&:last-child]:pb-5", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("mt-auto flex items-center gap-2 px-5 pt-4 pb-5 [&:first-child]:pt-5", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";
