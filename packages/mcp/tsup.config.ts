import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/server.ts", "src/remote.ts"],
  format: ["esm"],
  target: "node18",
  dts: { entry: ["src/server.ts", "src/remote.ts"] },
  clean: true,
  // The remote entry bundles the token files so Workers need no file access or special loaders.
  noExternal: [/^@junco\/tokens\/tokens\.(css|json)$/],
  loader: { ".css": "text" },
});
