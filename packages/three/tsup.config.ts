import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    "particle-field": "src/particle-field.ts",
    "shader-gradient": "src/shader-gradient.ts",
    globe: "src/globe.ts",
    "model-viewer": "src/model-viewer.ts",
    "tilt-card": "src/tilt-card.tsx",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  external: ["react", "react-dom", "three", /^three\//, "@react-three/fiber", "@react-three/drei", "junco", "@junco/tokens"],
  banner: { js: '"use client";' },
});
