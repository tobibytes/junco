import { Outlet, ScrollRestoration } from "react-router";
import { LinkProvider } from "@junco/blocks/marketing";
import { RouterLink, useInternalLinks } from "./lib/links";

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
