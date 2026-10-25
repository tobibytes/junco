import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { XIcon } from "../lib/icons";
import { DialogPrimitive } from "../lib/primitives";
import { DialogOverlay, useReturnFocus } from "./dialog";

interface SheetContextValue {
  setOpen: (open: boolean) => void;
}
const SheetContext = React.createContext<SheetContextValue | null>(null);

export interface SheetProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

/**
 * A panel that slides in from an edge. On phones (under 640px) side sheets become bottom sheets
 * you can swipe down to close, unless `mobileSide="same"`.
 *
 *   <Sheet>
 *     <SheetTrigger asChild><Button>Filters</Button></SheetTrigger>
 *     <SheetContent side="right">
 *       <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
 *       ...
 *     </SheetContent>
 *   </Sheet>
 */
export function Sheet({ open: openProp, defaultOpen = false, onOpenChange, ...props }: SheetProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );
  const ctx = React.useMemo(() => ({ setOpen }), [setOpen]);
  return (
    <SheetContext.Provider value={ctx}>
      <DialogPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </SheetContext.Provider>
  );
}

export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const sheetVariants = tv({
  slots: {
    content: [
      "fixed z-overlay flex flex-col gap-4 overflow-y-auto border-border bg-popover p-6 text-popover-foreground shadow-overlay",
      "focus-visible:outline-none",
      "data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out",
    ],
    // The bar is small; the ::before gives it a finger-sized hit area.
    handle: [
      "relative mx-auto -mt-3 -mb-1 hidden h-1.5 w-10 shrink-0 cursor-grab touch-none rounded-pill bg-border active:cursor-grabbing",
      "before:absolute before:-inset-x-6 before:-inset-y-3 before:content-['']",
    ],
    close: [
      "absolute top-3 right-3 grid size-8 place-items-center rounded-control text-muted-foreground",
      "transition-colors duration-fast ease-standard hover:bg-accent hover:text-foreground",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    ],
  },
  variants: {
    side: {
      right: { content: "inset-y-0 right-0 h-full w-[min(24rem,calc(100vw-3rem))] border-l [--slide-from:100%_0]" },
      left: { content: "inset-y-0 left-0 h-full w-[min(24rem,calc(100vw-3rem))] border-r [--slide-from:-100%_0]" },
      top: { content: "inset-x-0 top-0 max-h-[85dvh] border-b [--slide-from:0_-100%]" },
      bottom: {
        content:
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-card border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] [--slide-from:0_100%]",
        handle: "block",
      },
    },
    /** What side sheets do on phones. "bottom" (default) turns them into swipeable bottom sheets. */
    mobileSide: {
      bottom: {
        content: [
          "max-sm:inset-x-0 max-sm:top-auto max-sm:bottom-0 max-sm:h-auto max-sm:max-h-[85dvh] max-sm:w-full",
          "max-sm:rounded-t-card max-sm:border-x-0 max-sm:border-t max-sm:border-b-0 max-sm:[--slide-from:0_100%]",
          "max-sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        ],
        handle: "max-sm:block",
      },
      same: {},
    },
  },
  defaultVariants: { side: "right", mobileSide: "bottom" },
});

const MOBILE_QUERY = "(max-width: 639px)";

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showClose?: boolean;
  closeLabel?: string;
  classNames?: { overlay?: string; content?: string; handle?: string; close?: string };
}

export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  (
    {
      className,
      classNames,
      side = "right",
      mobileSide = "bottom",
      showClose = true,
      closeLabel = "Close",
      onOpenAutoFocus,
      onCloseAutoFocus,
      children,
      ...props
    },
    ref,
  ) => {
    const ctx = React.useContext(SheetContext);
    const styles = sheetVariants({ side, mobileSide });
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const drag = React.useRef<{ y: number; t: number; dy: number } | null>(null);

    const isBottom = () =>
      side === "bottom" ||
      (mobileSide === "bottom" && typeof window !== "undefined" && !!window.matchMedia?.(MOBILE_QUERY).matches);

    // Swipe down on the handle to close a bottom sheet. Keyboard users have Esc and the close button.
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isBottom() || !ctx) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { y: e.clientY, t: performance.now(), dy: 0 };
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current || !contentRef.current) return;
      const dy = Math.max(0, e.clientY - drag.current.y);
      drag.current.dy = dy;
      contentRef.current.style.translate = `0 ${dy}px`;
    };
    const onPointerUp = () => {
      const d = drag.current;
      const el = contentRef.current;
      drag.current = null;
      if (!d || !el) return;
      const velocity = d.dy / Math.max(1, performance.now() - d.t);
      if (d.dy > Math.max(80, el.offsetHeight * 0.25) || velocity > 0.5) {
        ctx?.setOpen(false); // the slide-out picks up from where the finger let go
      } else if (d.dy > 0) {
        el.style.transition = "translate calc(var(--duration-base) * var(--motion-scale)) var(--ease-spring)";
        el.style.translate = "";
        window.setTimeout(() => (el.style.transition = ""), 400);
      }
    };

    const setRefs = (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const focus = useReturnFocus(onOpenAutoFocus, onCloseAutoFocus);

    return (
      <DialogPrimitive.Portal>
        <DialogOverlay className={classNames?.overlay} />
        <DialogPrimitive.Content
          ref={setRefs}
          data-side={side}
          className={styles.content({ className: cn(classNames?.content, className) })}
          {...focus}
          {...props}
        >
          <div
            aria-hidden
            data-slot="sheet-handle"
            className={styles.handle({ className: classNames?.handle })}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          {children}
          {showClose && (
            <DialogPrimitive.Close className={styles.close({ className: classNames?.close })} aria-label={closeLabel}>
              <XIcon className="size-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  },
);
SheetContent.displayName = "SheetContent";

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5 pr-8", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

export interface SheetTitleProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  isHidden?: boolean;
}

export const SheetTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, SheetTitleProps>(
  ({ className, isHidden, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg leading-6 font-semibold tracking-tight", isHidden && "sr-only", className)}
      {...props}
    />
  ),
);
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = "SheetDescription";
