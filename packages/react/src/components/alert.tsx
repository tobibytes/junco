import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";

export const alertVariants = tv({
  slots: {
    root: [
      "relative grid w-full grid-cols-[auto_1fr_auto] items-start gap-x-3 rounded-card border bg-card p-4 text-sm text-card-foreground",
    ],
    icon: "mt-0.5 shrink-0 [&_svg]:size-4",
    body: "col-start-2 grid min-w-0 gap-1",
    title: "font-medium leading-snug",
    description: "text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4",
    action: "col-start-3 row-start-1 -my-1 flex items-center gap-2",
  },
  variants: {
    color: {
      neutral: { root: "border-border", icon: "text-foreground" },
      primary: { root: "border-border", icon: "text-primary" },
      success: { root: "border-success/40", icon: "text-success-text", title: "text-success-text" },
      warning: { root: "border-warning/50", icon: "text-warning-text", title: "text-warning-text" },
      danger: { root: "border-destructive/40", icon: "text-destructive-text", title: "text-destructive-text" },
    },
  },
  defaultVariants: { color: "neutral" },
});

type AlertStyles = ReturnType<typeof alertVariants>;
const AlertContext = React.createContext<AlertStyles>(alertVariants());

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">, VariantProps<typeof alertVariants> {
  /** Shown before the text. The title still says what kind of message it is: color alone never does. */
  icon?: React.ReactNode;
  /** Buttons or links on the right, e.g. Retry or Dismiss. */
  action?: React.ReactNode;
  classNames?: { root?: string; icon?: string; body?: string; action?: string };
}

/**
 * A message that stays on the page: an error, a warning, a note. For short-lived feedback use a toast.
 * Danger alerts default to role="alert" (read out at once); the others to role="status".
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, classNames, color, icon, action, role, children, ...props }, ref) => {
    const styles = alertVariants({ color });
    return (
      <AlertContext.Provider value={styles}>
        <div
          ref={ref}
          role={role ?? (color === "danger" ? "alert" : "status")}
          className={styles.root({ className: cn(classNames?.root, className) })}
          {...props}
        >
          {icon && (
            <span aria-hidden className={styles.icon({ className: classNames?.icon })}>
              {icon}
            </span>
          )}
          <div className={styles.body({ className: cn(!icon && "col-start-1 col-end-3", classNames?.body) })}>{children}</div>
          {action && <div className={styles.action({ className: classNames?.action })}>{action}</div>}
        </div>
      </AlertContext.Provider>
    );
  },
);
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const styles = React.useContext(AlertContext);
  return <p ref={ref} className={styles.title({ className })} {...props} />;
});
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const styles = React.useContext(AlertContext);
  return <div ref={ref} className={styles.description({ className })} {...props} />;
});
AlertDescription.displayName = "AlertDescription";
