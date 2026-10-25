import { defineConfig } from "tsup";

export default defineConfig({
  // Heavy features get their own entry so the core bundle stays small.
  entry: {
    index: "src/index.ts",
    "data-table": "src/data-table/index.ts",
    form: "src/form/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  // Shared code (Field context, Checkbox, ...) goes into common chunks, so `junco` and
  // `junco/form` use the same React contexts instead of duplicated copies.
  splitting: true,
  external: ["react", "react-dom", "@tanstack/react-table", "react-hook-form", "zod", "@hookform/resolvers"],
  banner: { js: '"use client";' },
});
