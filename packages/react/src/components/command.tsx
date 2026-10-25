import * as React from "react";
import { cn } from "../lib/cn";
import { SearchIcon } from "../lib/icons";
import { CommandPrimitive } from "../lib/primitives";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";

/**
 * A searchable list of actions, built on cmdk. Use it inline, or as a ⌘K palette with CommandDialog:
 *
 *   <CommandDialog>
 *     <CommandInput placeholder="Search…" />
 *     <CommandList>
 *       <CommandEmpty>No results.</CommandEmpty>
 *       <CommandGroup heading="Pages">
 *         <CommandItem onSelect={() => go("/settings")}>Settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
 *       </CommandGroup>
 *     </CommandList>
 *   </CommandDialog>
 */
export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn("flex size-full flex-col overflow-hidden rounded-card bg-popover text-popover-foreground", className)}
    {...props}
  />
));
Command.displayName = "Command";

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center gap-2 border-b border-border px-3" data-slot="command-input-wrapper">
    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = "CommandInput";

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-80 scroll-py-1 overflow-x-hidden overflow-y-auto p-1", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty ref={ref} className={cn("py-8 text-center text-sm text-muted-foreground", className)} {...props} />
));
CommandEmpty.displayName = "CommandEmpty";

export const CommandLoading = CommandPrimitive.Loading;

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden text-foreground",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
CommandSeparator.displayName = "CommandSeparator";

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "group relative flex h-9 cursor-default items-center gap-2 rounded-control px-2 text-sm outline-none select-none",
      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = "CommandItem";

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto font-mono text-xs tracking-wide text-muted-foreground", className)} {...props} />;
}

export interface CommandDialogProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Letter that opens the palette with ⌘ (Mac) or Ctrl. Default "k". Pass null to turn the shortcut off. */
  shortcut?: string | null;
  /** Read by screen readers. Default "Command palette". */
  title?: string;
  description?: string;
  classNames?: { content?: string; command?: string };
}

export function CommandDialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  shortcut = "k",
  title = "Command palette",
  description = "Search for a command to run.",
  className,
  classNames,
  children,
  ...props
}: CommandDialogProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const openRef = React.useRef(open);
  openRef.current = open;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  React.useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === shortcut.toLowerCase() && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        setOpen(!openRef.current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showClose={false}
        className={cn("top-[15dvh] translate-y-0 gap-0 overflow-hidden p-0 sm:top-[20dvh]", classNames?.content)}
      >
        <DialogTitle isHidden>{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command className={cn(classNames?.command, className)} {...props}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}
