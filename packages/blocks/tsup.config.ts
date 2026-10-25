import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/app/index.ts", "src/marketing/index.ts", "src/lib/fake.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  external: ["react", "react-dom", "junco"],
  banner: { js: '"use client";' },
});
