import * as React from "react";
import { cn } from "junco";
import { defaultBrand, defaultFooterColumns, type FooterColumn } from "./content";
import { BrandMark, Container, type Brand } from "./layout";
import { MarketingLink } from "./link";

export interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {
  brand?: Brand;
  tagline?: React.ReactNode;
  columns?: FooterColumn[];
  /** The bottom line. Defaults to "© {year} {brand}". */
  legal?: React.ReactNode;
  /** Small status line, e.g. "All systems normal". */
  status?: { label: string; href: string; state?: "ok" | "degraded" | "down" } | null;
  /** Extra controls in the bottom row (theme toggle, language). */
  actions?: React.ReactNode;
  /** "full" has link columns; "minimal" is one quiet row, for focused pages like a waitlist. */
  variant?: "full" | "minimal";
  classNames?: { root?: string; columns?: string; bottom?: string };
}

const statusDot = { ok: "bg-success", degraded: "bg-warning", down: "bg-destructive" } as const;

/** Links grouped in columns, brand, legal line and system status. */
export function SiteFooter({
  brand = defaultBrand,
  tagline = "The calm issue tracker for teams who ship.",
  columns = defaultFooterColumns,
  legal,
  status = { label: "All systems normal", href: "/status", state: "ok" },
  actions,
  variant = "full",
  className,
  classNames,
  ...props
}: SiteFooterProps) {
  const legalLine = legal ?? `© ${new Date().getFullYear()} ${brand.name}. All rights reserved.`;
  if (variant === "minimal") {
    return (
      <footer className={cn("border-t border-border", classNames?.root, className)} {...props}>
        <Container className="flex flex-col gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{legalLine}</p>
          <div className="flex flex-wrap items-center gap-4">
            {columns.flatMap((c) => c.links).map((link) => (
              <MarketingLink key={link.href} href={link.href} className="rounded-control hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                {link.label}
              </MarketingLink>
            ))}
            {actions}
          </div>
        </Container>
      </footer>
    );
  }
  return (
    <footer className={cn("border-t border-border", classNames?.root, className)} {...props}>
      <Container className="py-14 sm:py-16">
        <div className={cn("grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]", classNames?.columns)}>
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <MarketingLink
              href={brand.href ?? "/"}
              className="flex w-fit items-center gap-2 rounded-control font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {brand.logo ?? <BrandMark />}
              {brand.name}
            </MarketingLink>
            {tagline && <p className="max-w-xs text-sm text-muted-foreground">{tagline}</p>}
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-medium">{col.title}</h2>
              <ul className="mt-4 grid gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <MarketingLink
                      href={link.href}
                      className="rounded-control text-sm text-muted-foreground transition-colors duration-fast ease-standard hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {link.label}
                    </MarketingLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div
          className={cn(
            "mt-12 flex flex-col-reverse gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
            classNames?.bottom,
          )}
        >
          <p>{legalLine}</p>
          <div className="flex flex-wrap items-center gap-4">
            {status && (
              <MarketingLink
                href={status.href}
                className="inline-flex items-center gap-2 rounded-control hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span aria-hidden className={cn("size-2 rounded-pill", statusDot[status.state ?? "ok"])} />
                {status.label}
              </MarketingLink>
            )}
            {actions}
          </div>
        </div>
      </Container>
    </footer>
  );
}
