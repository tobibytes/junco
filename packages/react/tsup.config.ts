import { defineConfig } from "tsup";

const external = ["react", "react-dom", "@tanstack/react-table", "react-hook-form", "zod", "@hookform/resolvers"];

export default defineConfig([
  {
    // Heavy features get their own entry so the core bundle stays small.
    entry: {
      index: "src/index.ts",
      "data-table": "src/data-table/index.ts",
      form: "src/form/index.ts",
    },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    // Shared code (Field context, Checkbox, ...) goes into common chunks, so `@junco/react` and
    // `@junco/react/form` use the same React contexts instead of duplicated copies.
    splitting: true,
    external,
    banner: { js: '"use client";' },
  },
  {
    // Server-safe helpers. Built on its own (no shared chunks, no "use client" banner) so nothing
    // in it turns into a client reference.
    entry: { server: "src/server.ts" },
    format: ["esm"],
    dts: true,
    sourcemap: true,
    splitting: false,
    external,
  },
]);
