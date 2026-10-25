import * as React from "react";
import { cn } from "junco";
import { Reveal } from "@junco/motion";

/** Page-width wrapper with responsive side padding. */
export const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" | "lg" }>(
  ({ className, size = "lg", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "sm" ? "max-w-3xl" : size === "md" ? "max-w-5xl" : "max-w-6xl",
        className,
      )}
      {...props}
    />
  ),
);
Container.displayName = "Container";

/** A vertical band of the page with consistent rhythm. */
export const Section = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { spacing?: "sm" | "md" | "lg" }>(
  ({ className, spacing = "md", ...props }, ref) => (
    <section
      ref={ref}
      className={cn(spacing === "sm" ? "py-12 sm:py-16" : spacing === "lg" ? "py-24 sm:py-32" : "py-20 sm:py-24", className)}
      {...props}
    />
  ),
);
Section.displayName = "Section";

export interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "start";
  /** Heading level for the title. Default 2. */
  level?: 1 | 2 | 3;
  classNames?: { eyebrow?: string; title?: string; description?: string };
}

/** Eyebrow + title + description, the standard intro of a section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  level = 2,
  className,
  classNames,
  ...props
}: SectionHeadingProps) {
  const H = `h${level}` as "h2";
  return (
    <Reveal
      className={cn("flex max-w-2xl flex-col gap-3", align === "center" ? "mx-auto items-center text-center" : "items-start", className)}
      {...props}
    >
      {eyebrow && <p className={cn("text-sm font-medium text-primary", classNames?.eyebrow)}>{eyebrow}</p>}
      <H className={cn("text-3xl font-semibold tracking-tighter text-balance sm:text-4xl", classNames?.title)}>{title}</H>
      {description && (
        <p className={cn("text-base text-pretty text-muted-foreground sm:text-lg", classNames?.description)}>{description}</p>
      )}
    </Reveal>
  );
}

/** The default product mark: a planet with an orbit. Replace it with your logo via `brand.logo`. */
export function BrandMark({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable={false} className={cn("size-6", className)} {...props}>
      <circle cx="12" cy="12" r="5" fill="var(--primary)" />
      <ellipse cx="12" cy="12" rx="10.5" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-25 12 12)" />
    </svg>
  );
}

export interface Brand {
  name: string;
  href?: string;
  /** Your logo. Defaults to the Orbit mark. */
  logo?: React.ReactNode;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Action {
  label: string;
  href: string;
}
