import * as React from "react";
import { cn } from "../lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, renders `children` instead of the placeholder. */
  isLoaded?: boolean;
}

/** A placeholder block for content that is loading. Size it with className, e.g. `h-4 w-32`. */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, isLoaded = false, children, ...props }, ref) => {
    if (isLoaded) return <>{children}</>;
    return (
      <div
        ref={ref}
        aria-hidden
        data-slot="skeleton"
        className={cn("animate-skeleton rounded-control bg-muted", className)}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";
