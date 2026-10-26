import type * as React from "react";
import { Button, cn, Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@junco/react";
import { defaultBrand, defaultNav, defaultPrimaryAction } from "./content";
import { MenuIcon } from "./icons";
import { BrandMark, Container, type Action, type Brand, type NavLink } from "./layout";
import { MarketingLink } from "./link";

export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  brand?: Brand;
  links?: NavLink[];
  /** The main call to action on the right. */
  cta?: Action | null;
  /** A quieter link next to it, e.g. "Sign in". */
  secondaryCta?: Action | null;
  /** Href of the current page, marked with aria-current. */
  currentHref?: string;
  /** Stick to the top while scrolling. Default true. */
  isSticky?: boolean;
  /** Extra controls on the right (theme toggle, search). */
  actions?: React.ReactNode;
  classNames?: { root?: string; inner?: string; nav?: string; link?: string };
}

/** The top bar: logo, links, call to action. Below `md` the links move into a menu sheet. */
export function SiteHeader({
  brand = defaultBrand,
  links = defaultNav,
  cta = defaultPrimaryAction,
  secondaryCta = { label: "Sign in", href: "/login" },
  currentHref,
  isSticky = true,
  actions,
  className,
  classNames,
  ...props
}: SiteHeaderProps) {
  const logo = (
    <MarketingLink
      href={brand.href ?? "/"}
      className="flex items-center gap-2 rounded-control text-[15px] font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      {brand.logo ?? <BrandMark />}
      {brand.name}
    </MarketingLink>
  );

  return (
    <header
      className={cn(
        "z-sticky w-full border-b border-border/70 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70",
        isSticky && "sticky top-0",
        classNames?.root,
        className,
      )}
      {...props}
    >
      <Container className={cn("flex h-14 items-center gap-6", classNames?.inner)}>
        {logo}
        <nav aria-label="Main" className={cn("hidden flex-1 md:block", classNames?.nav)}>
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <MarketingLink
                  href={link.href}
                  aria-current={currentHref === link.href ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center rounded-control px-3 text-sm text-muted-foreground",
                    "transition-colors duration-fast ease-standard hover:text-foreground aria-[current=page]:text-foreground",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    classNames?.link,
                  )}
                >
                  {link.label}
                </MarketingLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {actions}
          {secondaryCta && (
            <Button asChild variant="ghost" size="sm" className="max-sm:hidden">
              <MarketingLink href={secondaryCta.href}>{secondaryCta.label}</MarketingLink>
            </Button>
          )}
          {cta && (
            <Button asChild size="sm">
              <MarketingLink href={cta.href}>{cta.label}</MarketingLink>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {brand.logo ?? <BrandMark />}
                  {brand.name}
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Main" className="mt-2">
                <ul className="grid gap-1">
                  {links.map((link) => (
                    <li key={link.href}>
                      <SheetClose asChild>
                        <MarketingLink
                          href={link.href}
                          aria-current={currentHref === link.href ? "page" : undefined}
                          className="flex h-11 items-center rounded-control px-3 text-base font-medium hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-accent"
                        >
                          {link.label}
                        </MarketingLink>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-6 grid gap-2">
                {cta && (
                  <Button asChild size="lg">
                    <MarketingLink href={cta.href}>{cta.label}</MarketingLink>
                  </Button>
                )}
                {secondaryCta && (
                  <Button asChild size="lg" variant="outline">
                    <MarketingLink href={secondaryCta.href}>{secondaryCta.label}</MarketingLink>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
