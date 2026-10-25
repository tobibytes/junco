import * as React from "react";
import { cn } from "../lib/cn";
import { PopoverPrimitive } from "../lib/primitives";

/**
 *   <Popover>
 *     <PopoverTrigger asChild><Button variant="outline">Share</Button></PopoverTrigger>
 *     <PopoverContent>...</PopoverContent>
 *   </Popover>
 *
 * Focus moves into the popover on open and back to the trigger on close. Esc and outside clicks close it.
 */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 6, collisionPadding = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(
        "z-dropdown w-72 max-w-[calc(100vw-1rem)] rounded-card border border-border bg-popover p-4 text-sm text-popover-foreground shadow-float",
        "origin-(--radix-popover-content-transform-origin) focus-visible:outline-none",
        "data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = "PopoverContent";
