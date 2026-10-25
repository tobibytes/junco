import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { XIcon } from "../lib/icons";
import { DialogPrimitive } from "../lib/primitives";

/**
 *   <Dialog>
 *     <DialogTrigger asChild><Button>Edit profile</Button></DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>
 *         <DialogTitle>Edit profile</DialogTitle>
 *         <DialogDescription>Changes show up for your whole team.</DialogDescription>
 *       </DialogHeader>
 *       ...
 *       <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose></DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 *
 * Every dialog needs a DialogTitle. Hide it visually with `<DialogTitle isHidden>` when the design has no heading.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

/** The dimmed scrim behind dialogs and sheets. */
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-overlay bg-background/75",
      "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const dialogVariants = tv({
  slots: {
    content: [
      "fixed top-1/2 left-1/2 z-overlay grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto",
      "rounded-card border border-border bg-popover p-6 text-popover-foreground shadow-overlay",
      "focus-visible:outline-none",
      "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
    ],
    close: [
      "absolute top-3 right-3 grid size-8 place-items-center rounded-control text-muted-foreground",
      "transition-colors duration-fast ease-standard hover:bg-accent hover:text-foreground",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    ],
  },
  variants: {
    size: {
      sm: { content: "max-w-sm" },
      md: { content: "max-w-lg" },
      lg: { content: "max-w-2xl" },
      xl: { content: "max-w-4xl" },
      full: { content: "h-[calc(100dvh-2rem)] max-w-none" },
    },
  },
  defaultVariants: { size: "md" },
});

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  /** Show the × button in the corner. Default true. */
  showClose?: boolean;
  /** Accessible name for the × button. Default "Close". */
  closeLabel?: string;
  classNames?: { overlay?: string; content?: string; close?: string };
}

export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, classNames, size, showClose = true, closeLabel = "Close", children, ...props }, ref) => {
    const styles = dialogVariants({ size });
    return (
      <DialogPortal>
        <DialogOverlay className={classNames?.overlay} />
        <DialogPrimitive.Content
          ref={ref}
          className={styles.content({ className: cn(classNames?.content, className) })}
          {...props}
        >
          {children}
          {showClose && (
            <DialogPrimitive.Close className={styles.close({ className: classNames?.close })} aria-label={closeLabel}>
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5 pr-8", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export interface DialogTitleProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  /** Keep the title for screen readers but hide it on screen. */
  isHidden?: boolean;
}

export const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, DialogTitleProps>(
  ({ className, isHidden, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg leading-6 font-semibold tracking-tight", isHidden && "sr-only", className)}
      {...props}
    />
  ),
);
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = "DialogDescription";
