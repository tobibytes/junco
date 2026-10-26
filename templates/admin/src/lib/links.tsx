import * as React from "react";
import { Link, useNavigate } from "react-router";
import type { RenderLink } from "@junco/blocks/app";
import type { LinkComponentProps } from "@junco/blocks/marketing";

/** For <LinkProvider>: marketing blocks render their links through React Router. */
export const RouterLink = React.forwardRef<HTMLAnchorElement, LinkComponentProps>(({ href, ...props }, ref) => (
  <Link ref={ref} to={href} {...props} />
));
RouterLink.displayName = "RouterLink";

/** For <AppShell sidebar={{ renderLink }}>: sidebar items navigate without a page load. */
export const renderLink: RenderLink = (item, { children, ...props }) => (
  <Link to={item.href ?? "#"} {...props}>
    {children}
  </Link>
);

/**
 * Some blocks render plain <a href> tags (settings tabs, "View all" links). This routes clicks on
 * same-origin links through React Router so they don't reload the page. New-tab clicks, downloads,
 * external links and in-page anchors behave normally.
 */
export function useInternalLinks() {
  const navigate = useNavigate();
  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download") || anchor.origin !== window.location.origin) return;
      const href = anchor.getAttribute("href") ?? "";
      if (href.startsWith("#")) return;
      event.preventDefault();
      navigate(anchor.pathname + anchor.search + anchor.hash);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);
}
