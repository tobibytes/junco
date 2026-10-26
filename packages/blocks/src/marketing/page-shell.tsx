import type * as React from "react";
import { cn } from "@junco/react";

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  classNames?: { root?: string; main?: string };
}

/** Page frame: skip link, header, <main>, footer. Every marketing page renders inside one. */
export function PageShell({ header, footer, className, classNames, children, ...props }: PageShellProps) {
  return (
    <div className={cn("flex min-h-dvh flex-col bg-background text-foreground", classNames?.root, className)} {...props}>
      <a
        href="#main"
        className="sr-only z-toast rounded-control bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      {header}
      <main id="main" tabIndex={-1} className={cn("flex-1 outline-none", classNames?.main)}>
        {children}
      </main>
      {footer}
    </div>
  );
}
