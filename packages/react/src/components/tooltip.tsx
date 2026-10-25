import * as React from "react";
import { cn } from "../lib/cn";
import { TooltipPrimitive } from "../lib/primitives";

const TooltipInProviderContext = React.createContext(false);

/** Put one near the root of the app. Shares the open delay so moving between tooltips is instant. */
export function TooltipProvider({
  delayDuration = 400,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipInProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
    </TooltipInProviderContext.Provider>
  );
}

export interface TooltipProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>, "children"> {
  /** What the tooltip says. Keep it short; never put the only copy of important info here. */
  content: React.ReactNode;
  /** The element that triggers the tooltip. Must accept a ref and focus (a button, a link). */
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /** Shown as a <Kbd>-like hint after the text, e.g. "⌘K". */
  shortcut?: string;
  className?: string;
}

/**
 *   <Tooltip content="Add item"><Button size="icon" aria-label="Add item">+</Button></Tooltip>
 *
 * Works without a TooltipProvider (it adds its own), but one shared provider is better.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  sideOffset = 6,
  shortcut,
  className,
  ...rootProps
}: TooltipProps) {
  const inProvider = React.useContext(TooltipInProviderContext);
  const tooltip = (
    <TooltipPrimitive.Root {...rootProps}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-toast flex max-w-xs items-center gap-2 rounded-control bg-foreground px-2 py-1 text-xs text-background shadow-float",
            "origin-(--radix-tooltip-content-transform-origin)",
            "data-[state=delayed-open]:animate-pop-in data-[state=instant-open]:animate-pop-in data-[state=closed]:animate-pop-out",
            className,
          )}
        >
          {content}
          {shortcut && <span className="font-mono text-[11px] opacity-70">{shortcut}</span>}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
  return inProvider ? tooltip : <TooltipProvider>{tooltip}</TooltipProvider>;
}
