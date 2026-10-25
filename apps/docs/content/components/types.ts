import type * as React from "react";

export type ControlDef =
  | { name: string; label?: string; type: "select"; options: readonly string[]; default: string }
  | { name: string; label?: string; type: "boolean"; default: boolean }
  | { name: string; label?: string; type: "text"; default: string };

export type ControlValues = Record<string, string | boolean>;

export interface Example {
  title: string;
  description?: string;
  /** A component, so examples can use hooks. */
  Preview: React.ComponentType;
  /** The code shown under the preview. Keep it identical to what Preview renders. */
  code: string;
}

export interface PropDef {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface ComponentDoc {
  /** Names imported from "junco" (or `importFrom`), shown in the install snippet. */
  imports: string[];
  /** Module the imports come from. Default "junco"; e.g. "junco/data-table". */
  importFrom?: string;
  /** Extra npm packages to install alongside junco (optional peers of subpath entries). */
  installExtra?: string[];
  playground?: {
    controls: ControlDef[];
    render: (values: ControlValues) => React.ReactNode;
    code: (values: ControlValues) => string;
  };
  /** Usage at each level. `installed` is required; leave a level out when it does not apply. */
  usage: {
    installed: string;
    utilities?: string;
    semantic?: string;
  };
  examples: Example[];
  /** One table per exported part. */
  props: { component: string; description?: string; props: PropDef[] }[];
  keyboard?: { keys: string[]; action: string }[];
  a11y: string[];
  /** Set false for things that only make sense installed (none yet). Default true. */
  copyIn?: boolean;
}
