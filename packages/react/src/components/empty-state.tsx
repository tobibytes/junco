import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";

export const emptyStateVariants = tv({
  slots: {
    root: "flex flex-col items-center justify-center text-center",
    icon: "mb-4 grid place-items-center rounded-card border border-border bg-surface text-muted-foreground",
    title: "font-semibold tracking-tight text-foreground",
    description: "mt-1 max-w-sm text-sm text-muted-foreground text-balance",
    actions: "mt-5 flex flex-wrap items-center justify-center gap-2",
  },
  variants: {
    size: {
      sm: { root: "px-4 py-8", icon: "size-9 [&_svg]:size-4", title: "text-sm" },
      md: { root: "px-6 py-12", icon: "size-11 [&_svg]:size-5", title: "text-base" },
      lg: { root: "px-8 py-16", icon: "size-14 [&_svg]:size-6", title: "text-lg" },
    },
    /** A dashed outline, for an empty area the user can fill (drop zone, first item). */
    isBordered: {
      true: { root: "rounded-card border border-dashed border-border" },
    },
  },
  defaultVariants: { size: "md", isBordered: false },
});

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons for the next step. Lead with one primary action. */
  actions?: React.ReactNode;
  /** Heading level for the title. Default h3. */
  titleAs?: "h2" | "h3" | "h4" | "p";
  classNames?: Partial<Record<"root" | "icon" | "title" | "description" | "actions", string>>;
}

/** What to show when there is nothing to show: say why, and offer the next step. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, classNames, size, isBordered, icon, title, description, actions, titleAs: Title = "h3", children, ...props },
    ref,
  ) => {
    const styles = emptyStateVariants({ size, isBordered });
    return (
      <div ref={ref} data-slot="empty-state" className={styles.root({ className: cn(classNames?.root, className) })} {...props}>
        {icon && (
          <div aria-hidden className={styles.icon({ className: classNames?.icon })}>
            {icon}
          </div>
        )}
        <Title className={styles.title({ className: classNames?.title })}>{title}</Title>
        {description && <p className={styles.description({ className: classNames?.description })}>{description}</p>}
        {actions && <div className={styles.actions({ className: classNames?.actions })}>{actions}</div>}
        {children}
      </div>
    );
  },
);
EmptyState.displayName = "EmptyState";
