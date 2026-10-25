"use client";

import { Badge, Button, Tooltip } from "@junco/react";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { GithubIcon, LogoMark } from "./icons";
import { MobileNav } from "./mobile-nav";
import { SearchButton } from "./search";
import { ThemeToggle } from "./theme-controls";

const links = [
  { href: "/docs/", label: "Docs", match: (p: string) => p.startsWith("/docs") && !p.startsWith("/docs/theming") },
  { href: "/components/", label: "Components", match: (p: string) => p.startsWith("/components") },
  { href: "/blocks/", label: "Blocks", match: (p: string) => p.startsWith("/blocks") },
  { href: "/examples/", label: "Examples", match: (p: string) => p.startsWith("/examples") },
  { href: "/icons/", label: "Icons", match: (p: string) => p.startsWith("/icons"), wide: true },
  { href: "/motion/", label: "Motion", match: (p: string) => p.startsWith("/motion"), wide: true },
  { href: "/3d/", label: "3D", match: (p: string) => p.startsWith("/3d"), wide: true },
  { href: "/docs/theming/", label: "Theming", match: (p: string) => p.startsWith("/docs/theming"), wide: true },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <a
        href="#main"
        className="sr-only rounded-control bg-primary px-3 py-2 text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-toast"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-2 px-4 md:px-6">
        <MobileNav />
        <Link href="/" className="flex items-center gap-2 rounded-control font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <LogoMark />
          <span>Junco</span>
          <Badge variant="outline" className="hidden h-5 px-1.5 text-[11px] sm:inline-flex">
            v0
          </Badge>
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-control px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-fast ease-standard hover:text-foreground",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  "aria-[current=page]:text-foreground",
                  link.wide && "hidden lg:inline-block",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/examples/"
            aria-current={pathname.startsWith("/examples") ? "page" : undefined}
            className="rounded-control px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:text-foreground md:hidden"
          >
            Examples
          </Link>
          <SearchButton className="md:w-40 lg:w-56" />
          <Tooltip content="GitHub">
            <Button asChild variant="ghost" size="icon">
              <a href={site.github} aria-label="Junco on GitHub" rel="noreferrer">
                <GithubIcon />
              </a>
            </Button>
          </Tooltip>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
