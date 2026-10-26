import type * as React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts";
import { NotFound, RouteError } from "./routes/errors";

/** Loads a page on demand, so visitors to the landing page don't download the dashboard. */
function page(load: () => Promise<React.ComponentType>) {
  return { lazy: { Component: load } };
}
const marketing = () => import("./routes/marketing");
const auth = () => import("./routes/auth");
const app = () => import("./routes/app");

/**
 * Every page in the app. Marketing pages are public, /app/* needs a session.
 * Deploying as a static site? Point unknown paths at index.html (most hosts call this an SPA
 * fallback) so deep links like /app/settings/billing load.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", ...page(() => marketing().then((m) => m.Home)) },
      { path: "/pricing", ...page(() => marketing().then((m) => m.Pricing)) },
      { path: "/changelog", ...page(() => marketing().then((m) => m.Changelog)) },
      { path: "/blog", ...page(() => marketing().then((m) => m.Blog)) },
      { path: "/blog/:slug", ...page(() => marketing().then((m) => m.BlogPost)) },

      { path: "/login", ...page(() => auth().then((m) => m.LogIn)) },
      { path: "/signup", ...page(() => auth().then((m) => m.SignUp)) },
      { path: "/forgot-password", ...page(() => auth().then((m) => m.ForgotPassword)) },
      { path: "/onboarding", ...page(() => auth().then((m) => m.Onboarding)) },

      {
        path: "/app",
        ...page(() => app().then((m) => m.AppLayout)),
        children: [
          { index: true, ...page(() => app().then((m) => m.Dashboard)) },
          { path: "customers", ...page(() => app().then((m) => m.Customers)) },
          { path: "settings", element: <Navigate to="profile" replace /> },
          { path: "settings/profile", ...page(() => app().then((m) => m.Profile)) },
          { path: "settings/billing", ...page(() => app().then((m) => m.Billing)) },
          { path: "settings/team", ...page(() => app().then((m) => m.Team)) },
          { path: "settings/api-keys", ...page(() => app().then((m) => m.ApiKeys)) },
          { path: "settings/notifications", ...page(() => app().then((m) => m.Notifications)) },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
],
  // Vite's base path. Leave it at "/" unless you host the app under a subpath (vite build --base /app/).
  { basename: import.meta.env.BASE_URL },
);
