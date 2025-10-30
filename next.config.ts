// next.config.ts
import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,

  // Used for production builds on Vercel too
  webpack(config) {
    // force the browser build of @irys/upload (avoids node-only code)
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@irys/upload": "@irys/upload/dist/web/index.js",

      // prevent bundling node-only deps in the browser
      inquirer: false,
      "external-editor": false,
      child_process: false,
      "node:fs": false,
      "node:path": false,
      "node:os": false,
      fs: false,
      path: false,
      os: false,
    };

    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      os: false,
      child_process: false,
    };

    return config;
  },
} satisfies NextConfig; // gives proper types, no implicit any

export default nextConfig;
