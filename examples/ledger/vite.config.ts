import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base "./" + hash routing: the built app works from any subpath (it's hosted at /demos/ledger/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
