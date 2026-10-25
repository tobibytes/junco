import type * as React from "react";

export interface PreviewRoute {
  /** Hash path without the leading "#", e.g. "/dashboard". */
  path: string;
  title: string;
  /** Group heading on the index page. */
  group?: string;
  element: React.ReactNode;
}
