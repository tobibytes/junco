import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../lib/cn";
import { AvatarPrimitive } from "../lib/primitives";

export const avatarVariants = tv({
  slots: {
    root: "relative inline-flex shrink-0 overflow-hidden rounded-pill border border-border bg-muted align-middle",
    image: "size-full object-cover",
    fallback: "grid size-full place-items-center font-medium text-muted-foreground select-none",
  },
  variants: {
    size: {
      xs: { root: "size-6", fallback: "text-[10px]" },
      sm: { root: "size-8", fallback: "text-xs" },
      md: { root: "size-10", fallback: "text-sm" },
      lg: { root: "size-12", fallback: "text-base" },
    },
    shape: {
      circle: {},
      square: { root: "rounded-card" },
    },
  },
  defaultVariants: { size: "md", shape: "circle" },
});

/** "Ada Lovelace" -> "AL", "tobi" -> "T". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  /** The person's name. Used as the image alt text and for fallback initials. */
  name?: string;
  /** Shown while the image loads or when it fails. Defaults to the name's initials. */
  fallback?: React.ReactNode;
  classNames?: { root?: string; image?: string; fallback?: string };
}

export const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
  ({ className, classNames, size, shape, src, name, fallback, ...props }, ref) => {
    const styles = avatarVariants({ size, shape });
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={styles.root({ className: cn(classNames?.root, className) })}
        {...props}
      >
        {src && <AvatarPrimitive.Image src={src} alt={name ?? ""} className={styles.image({ className: classNames?.image })} />}
        <AvatarPrimitive.Fallback
          className={styles.fallback({ className: classNames?.fallback })}
          role={name ? "img" : undefined}
          aria-label={name}
        >
          {fallback ?? (name ? <span aria-hidden>{initials(name)}</span> : null)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  },
);
Avatar.displayName = "Avatar";
