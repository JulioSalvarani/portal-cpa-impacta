import type { NextConfig } from "next";

const ipsExtras = process.env.DEV_ALLOWED_ORIGINS
  ? process.env.DEV_ALLOWED_ORIGINS.split(",").map((ip) => ip.trim()).filter(Boolean)
  : [];

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    ...ipsExtras,
  ],  
  cacheComponents: false,
  partialPrefetching: false,
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
