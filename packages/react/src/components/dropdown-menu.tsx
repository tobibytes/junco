import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { CheckIcon, ChevronRightIcon, DotIcon } from "../lib/icons";
import { DropdownMenuPrimitive } from "../lib/primitives";
import { Slottable } from "../lib/slot";

/**
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild><Button variant="outline">Options</Button></DropdownMenuTrigger>
 *     <DropdownMenuContent align="end">
 *       <DropdownMenuLabel>Account</DropdownMenuLabel>
 *       <DropdownMenuItem shortcut="⌘P">Profile</DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem variant="danger">Log out</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 *
 * Arrow keys move, Enter/Space select, typing jumps to an item, Esc closes and returns focus.
 */
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const surface = [
  "z-dropdown min-w-44 max-w-[calc(100vw-1rem)] overflow-hidden rounded-card border border-border bg-popover p-1 text-popover-foreground shadow-float",
  "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
];

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, collisionPadding = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        surface,
        "max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto origin-(--radix-dropdown-menu-content-transform-origin)",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const menuItemVariants = tv({
  base: [
    "relative flex h-8 cursor-default items-center gap-2 rounded-control px-2 text-sm outline-none select-none",
    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ],
  variants: {
    variant: {
      default: "",
      danger: "text-destructive-text data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground",
    },
    /** Indent to line up with items that have a check or icon. */
    inset: { true: "pl-8" },
  },
  defaultVariants: { variant: "default" },
});

/** Keyboard hint at the end of an item. Visual only: wire the shortcut up yourself. */
export function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto pl-4 font-mono text-xs tracking-wide text-muted-foreground group-data-[highlighted]:text-current", className)}
      {...props}
    />
  );
}

export interface DropdownMenuItemProps
  extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof menuItemVariants> {
  /** Shorthand for a trailing <DropdownMenuShortcut>. */
  shortcut?: string;
}

export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, DropdownMenuItemProps>(
  ({ className, variant, inset, shortcut, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Item ref={ref} className={cn("group", menuItemVariants({ variant, inset }), className)} {...props}>
      {/* With asChild the Slot needs one marked element; Slottable marks it and keeps the shortcut inside it. */}
      {props.asChild ? <Slottable>{children}</Slottable> : children}
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </DropdownMenuPrimitive.Item>
  ),
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem ref={ref} className={cn(menuItemVariants({ inset: true }), className)} {...props}>
    <span className="absolute left-2 grid size-4 place-items-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem ref={ref} className={cn(menuItemVariants({ inset: true }), className)} {...props}>
    <span className="absolute left-2 grid size-4 place-items-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotIcon />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", inset && "pl-8", className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(menuItemVariants({ inset }), "data-[state=open]:bg-accent", className)}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto text-muted-foreground" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, sideOffset = 4, collisionPadding = 8, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(surface, "origin-(--radix-dropdown-menu-content-transform-origin)", className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";
