import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { TabsPrimitive } from "../lib/primitives";

export const tabsVariants = tv({
  slots: {
    list: "inline-flex items-center",
    trigger: [
      "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted-foreground",
      "transition-colors duration-fast ease-standard hover:text-foreground",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:text-foreground",
    ],
    content: "mt-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=active]:animate-fade",
  },
  variants: {
    variant: {
      /** Underline under the active tab. For page sections. */
      line: {
        list: "w-full gap-4 border-b border-border",
        trigger: [
          "relative -mb-px h-9 border-b-2 border-transparent px-0.5",
          "data-[state=active]:border-foreground",
        ],
      },
      /** Segmented control look. For switching views in a small area. */
      segmented: {
        list: "gap-0.5 rounded-control border border-border bg-muted p-0.5",
        trigger: "h-7 rounded-xs px-2.5 data-[state=active]:bg-surface data-[state=active]:shadow-[0_0_0_1px_var(--border)]",
      },
    },
  },
  defaultVariants: { variant: "line" },
});

type TabsVariant = VariantProps<typeof tabsVariants>["variant"];
const TabsVariantContext = React.createContext<TabsVariant>("line");

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsVariants> {}

/**
 * Switches between views in the same space. Variants line (page sections) and segmented (small view switchers).
 *
 *   <Tabs defaultValue="overview">
 *     <TabsList><TabsTrigger value="overview">Overview</TabsTrigger>...</TabsList>
 *     <TabsContent value="overview">...</TabsContent>
 *   </Tabs>
 */
export const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
  ({ variant = "line", ...props }, ref) => (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root ref={ref} {...props} />
    </TabsVariantContext.Provider>
  ),
);
Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  return <TabsPrimitive.List ref={ref} className={tabsVariants({ variant }).list({ className })} {...props} />;
});
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  return <TabsPrimitive.Trigger ref={ref} className={tabsVariants({ variant }).trigger({ className })} {...props} />;
});
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext);
  return <TabsPrimitive.Content ref={ref} className={cn(tabsVariants({ variant }).content(), className)} {...props} />;
});
TabsContent.displayName = "TabsContent";
