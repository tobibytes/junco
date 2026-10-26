import { Outlet, ScrollRestoration, useLocation } from "react-router";
import {
  LinkProvider,
  SiteFooter,
  SiteHeader,
  type FooterColumn,
  type SiteFooterProps,
  type SiteHeaderProps,
} from "@junco/blocks/marketing";
import { app } from "./config";
import { useAuth } from "./lib/auth";
import { RouterLink, useInternalLinks } from "./lib/links";
import { ThemeToggle } from "./theme-toggle";

/** Wraps every route: router-aware links everywhere, and scroll back to the top on navigation. */
export function RootLayout() {
  useInternalLinks();
  return (
    <LinkProvider component={RouterLink}>
      <Outlet />
      <ScrollRestoration />
    </LinkProvider>
  );
}

/**
 * The marketing header, used as the `header` slot on every marketing page. It marks the current
 * page and swaps "Sign in" for "Open app" once you're signed in.
 */
export function MarketingHeader(props: SiteHeaderProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  return (
    <SiteHeader
      {...props}
      currentHref={pathname}
      actions={<ThemeToggle />}
      cta={user ? { label: "Open app", href: "/app" } : { label: "Start for free", href: "/signup" }}
      secondaryCta={user ? null : { label: "Sign in", href: "/login" }}
    />
  );
}

/** Footer links that point at pages this template has. Add yours as you build them. */
const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "Blog", href: "/blog" }],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create an account", href: "/signup" },
    ],
  },
];

/** The marketing footer, used as the `footer` slot: your tagline and links, no status badge. */
export function MarketingFooter(props: SiteFooterProps) {
  return <SiteFooter {...props} tagline={app.description} columns={footerColumns} status={null} />;
}

/** Header and footer for every marketing page: `<LandingPage slots={marketingSlots} />`. */
export const marketingSlots = { header: MarketingHeader, footer: MarketingFooter };
