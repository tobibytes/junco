import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/server.ts"],
  format: ["esm"],
  target: "node18",
  dts: { entry: "src/server.ts" },
  clean: true,
});
