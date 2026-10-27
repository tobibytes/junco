import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", liveblocks: "src/liveblocks.tsx" },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  splitting: true,
  external: ["react", "react-dom", "@junco/react", "@liveblocks/client", "@liveblocks/react", "@liveblocks/react-ui"],
  banner: { js: '"use client";' },
});
