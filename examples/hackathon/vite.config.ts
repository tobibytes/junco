import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Hosted under https://junco.madebytobi.com/demos/hackathon/, so every asset path is relative.
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    // three.js is split out and only loads when the 3D scenes scroll into view.
    chunkSizeWarningLimit: 1200,
  },
});
