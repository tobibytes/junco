import { isRouteErrorResponse, useRouteError } from "react-router";
import { LinkProvider, NotFoundPage, ServerErrorPage } from "@junco/blocks/marketing";
import { app } from "../config";
import { RouterLink } from "../lib/links";

const brand = { name: app.name, href: "/" };
// An admin panel has no marketing site, so the error pages drop the site header and footer.
const slots = { header: null, footer: null };

export function NotFound() {
  return (
    <NotFoundPage
      brand={brand}
      homeAction={{ label: "Back to overview", href: "/" }}
      suggestions={[
        { label: "Users", href: "/users" },
        { label: "Settings", href: "/settings/profile" },
      ]}
      searchAction={null}
      slots={slots}
    />
  );
}

/** Catches errors thrown while rendering a route. It renders outside the root layout, so it brings its own LinkProvider. */
export function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <LinkProvider component={RouterLink}>
        <NotFound />
      </LinkProvider>
    );
  }
  console.error(error);
  return (
    <LinkProvider component={RouterLink}>
      <ServerErrorPage brand={brand} homeHref="/" statusHref={null} onRetry={() => window.location.reload()} slots={slots} />
    </LinkProvider>
  );
}
