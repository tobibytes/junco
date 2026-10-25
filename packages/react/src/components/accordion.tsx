import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { ChevronDownIcon } from "../lib/icons";
import { AccordionPrimitive } from "../lib/primitives";

export const accordionVariants = tv({
  slots: {
    root: "w-full",
    item: "",
    trigger: [
      "group flex w-full flex-1 items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground",
      "transition-colors duration-fast ease-standard hover:underline underline-offset-4",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    icon: [
      "size-4 shrink-0 text-muted-foreground",
      "transition-transform duration-base ease-standard group-data-[state=open]:rotate-180",
    ],
    content: [
      "overflow-hidden text-sm text-muted-foreground",
      "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
    ],
    contentInner: "pb-4",
  },
  variants: {
    variant: {
      /** Rows divided by hairlines. The default. */
      line: { item: "border-b border-border last:border-b-0" },
      /** Each item is its own bordered card with a gap between. */
      card: {
        root: "grid gap-2",
        item: "rounded-card border border-border bg-card px-4",
      },
    },
  },
  defaultVariants: { variant: "line" },
});

type AccordionVariant = VariantProps<typeof accordionVariants>["variant"];
const AccordionVariantContext = React.createContext<AccordionVariant>("line");

export type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> &
  VariantProps<typeof accordionVariants>;

/**
 * Stacked sections that expand and collapse. Good for FAQs and settings groups.
 * `type="single"` opens one at a time (add `collapsible` to allow closing it); `type="multiple"` doesn't.
 *
 *   <Accordion type="single" collapsible>
 *     <AccordionItem value="a">
 *       <AccordionTrigger>Is it free?</AccordionTrigger>
 *       <AccordionContent>Yes, MIT licensed.</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 */
export const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, AccordionProps>(
  ({ className, variant = "line", ...props }, ref) => (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionPrimitive.Root
        ref={ref}
        className={accordionVariants({ variant }).root({ className })}
        {...(props as React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>)}
      />
    </AccordionVariantContext.Provider>
  ),
);
Accordion.displayName = "Accordion";

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(AccordionVariantContext);
  return <AccordionPrimitive.Item ref={ref} className={accordionVariants({ variant }).item({ className })} {...props} />;
});
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  /** The heading level wrapping the trigger, for a correct document outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  classNames?: { heading?: string; icon?: string };
}

export const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, AccordionTriggerProps>(
  ({ className, classNames, headingLevel = 3, children, ...props }, ref) => {
    const styles = accordionVariants();
    const Heading = `h${headingLevel}` as "h3";
    return (
      <AccordionPrimitive.Header asChild>
        <Heading className={cn("flex", classNames?.heading)}>
          <AccordionPrimitive.Trigger ref={ref} className={styles.trigger({ className })} {...props}>
            {children}
            <ChevronDownIcon className={styles.icon({ className: classNames?.icon })} />
          </AccordionPrimitive.Trigger>
        </Heading>
      </AccordionPrimitive.Header>
    );
  },
);
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & { classNames?: { inner?: string } }
>(({ className, classNames, children, ...props }, ref) => {
  const styles = accordionVariants();
  return (
    <AccordionPrimitive.Content ref={ref} className={styles.content({ className })} {...props}>
      <div className={styles.contentInner({ className: classNames?.inner })}>{children}</div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = "AccordionContent";
