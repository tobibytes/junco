import type * as React from "react";
import {
  BlogIndexPage,
  BlogPostPage,
  ChangelogPage,
  LandingPage,
  NotFoundPage,
  PricingPage,
  ServerErrorPage,
  WaitlistPage,
} from "@junco/blocks/marketing";

export interface PreviewRoute {
  path: string;
  title: string;
  element: React.ReactNode;
}

/** Every marketing page and variant, for the blocks preview app. */
export const marketingRoutes: PreviewRoute[] = [
  { path: "/marketing/landing", title: "Landing (product)", element: <LandingPage variant="product" /> },
  { path: "/marketing/landing-bold", title: "Landing (bold)", element: <LandingPage variant="bold" /> },
  { path: "/marketing/landing-minimal", title: "Landing (minimal)", element: <LandingPage variant="minimal" /> },
  { path: "/marketing/pricing", title: "Pricing", element: <PricingPage /> },
  { path: "/marketing/pricing-simple", title: "Pricing (simple)", element: <PricingPage variant="simple" /> },
  { path: "/marketing/changelog", title: "Changelog", element: <ChangelogPage /> },
  { path: "/marketing/changelog-compact", title: "Changelog (compact)", element: <ChangelogPage variant="compact" /> },
  { path: "/marketing/blog", title: "Blog index", element: <BlogIndexPage /> },
  { path: "/marketing/blog-list", title: "Blog index (list)", element: <BlogIndexPage variant="list" /> },
  { path: "/marketing/blog-post", title: "Blog post", element: <BlogPostPage /> },
  { path: "/marketing/blog-post-centered", title: "Blog post (centered)", element: <BlogPostPage variant="centered" /> },
  { path: "/marketing/waitlist", title: "Waitlist", element: <WaitlistPage /> },
  { path: "/marketing/waitlist-split", title: "Waitlist (split)", element: <WaitlistPage variant="split" /> },
  { path: "/marketing/404", title: "404", element: <NotFoundPage /> },
  { path: "/marketing/500", title: "500", element: <ServerErrorPage /> },
];

export default marketingRoutes;
