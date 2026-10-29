import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react", "react-dom", "@junco/react", /^@tiptap\//, "yjs", "y-protocols"],
  banner: { js: '"use client";' },
});
