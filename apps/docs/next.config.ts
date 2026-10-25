import type { NextConfig } from "next";

const config: NextConfig = {
  // Static HTML in out/, served by Cloudflare Pages.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
