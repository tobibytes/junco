import * as React from "react";
import { cn } from "../lib/cn";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

/** A keyboard key, e.g. `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. Give symbols a `title` so they read clearly. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    className={cn(
      "inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-b-2 border-border bg-surface px-1.5",
      "font-mono text-[11px] leading-none text-muted-foreground",
      className,
    )}
    {...props}
  />
));
Kbd.displayName = "Kbd";
