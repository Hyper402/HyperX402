// next.config.ts
import type { NextConfig } from "next";

/**
 * We intentionally type the webpack args as `any` to avoid TS
 * compiler complaints in CI (Vercel) where Next's internal types
 * aren't exported in a stable path.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  webpack(config: any, _ctx: any) {
    // Ensure objects exist
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Force the browser build of @irys/upload (avoids node-only code)
      "@irys/upload": "@irys/upload/dist/web/index.js",

      // Never bundle node-only deps in the client
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
};

export default nextConfig;
