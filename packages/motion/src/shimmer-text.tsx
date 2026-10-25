import * as React from "react";
import { cn } from "junco";

export interface ShimmerTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

/**
 * A light that sweeps across text. Good for in-progress labels ("Thinking…", "Deploying").
 * Plain text with motion off. Uses the muted and foreground tokens, so it passes contrast.
 */
export const ShimmerText = React.forwardRef<HTMLElement, ShimmerTextProps>(({ as: Comp = "span", className, ...props }, ref) => (
  <Comp ref={ref} className={cn("shimmer", className)} {...props} />
));
ShimmerText.displayName = "ShimmerText";
