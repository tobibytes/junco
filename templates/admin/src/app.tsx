import type * as React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts";
import { NotFound, RouteError } from "./routes/errors";

/** Loads a page on demand, so the sign-in page doesn't download the whole panel. */
function page(load: () => Promise<React.ComponentType>) {
  return { lazy: { Component: load } };
}
const auth = () => import("./routes/auth");
const app = () => import("./routes/app");

/**
 * Every page in the panel. Everything except sign-in needs a session.
 * Deploying as a static site? Point unknown paths at index.html (most hosts call this an SPA
 * fallback) so deep links like /users/u-3 load.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "/login", ...page(() => auth().then((m) => m.LogIn)) },
      { path: "/forgot-password", ...page(() => auth().then((m) => m.ForgotPassword)) },
      {
        ...page(() => app().then((m) => m.AdminLayout)),
        children: [
          { index: true, ...page(() => app().then((m) => m.Overview)) },
          { path: "/users", ...page(() => app().then((m) => m.Users)) },
          { path: "/users/:id", ...page(() => app().then((m) => m.UserDetail)) },
          { path: "/settings", element: <Navigate to="/settings/profile" replace /> },
          { path: "/settings/profile", ...page(() => app().then((m) => m.Profile)) },
          { path: "/settings/team", ...page(() => app().then((m) => m.Team)) },
          { path: "/settings/api-keys", ...page(() => app().then((m) => m.ApiKeys)) },
          { path: "/settings/notifications", ...page(() => app().then((m) => m.Notifications)) },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
