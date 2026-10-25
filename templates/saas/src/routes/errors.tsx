import { isRouteErrorResponse, useRouteError } from "react-router";
import { LinkProvider, NotFoundPage, ServerErrorPage } from "@junco/blocks/marketing";
import { brand, marketingNav } from "../config";
import { marketingSlots } from "../layouts";
import { RouterLink } from "../lib/links";

export function NotFound() {
  return (
    <NotFoundPage
      brand={brand}
      nav={marketingNav}
      homeAction={{ label: "Back to home", href: "/" }}
      suggestions={marketingNav}
      searchAction={null}
      slots={marketingSlots}
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
      <ServerErrorPage
        brand={brand}
        nav={marketingNav}
        homeHref="/"
        statusHref={null}
        onRetry={() => window.location.reload()}
        slots={marketingSlots}
      />
    </LinkProvider>
  );
}
