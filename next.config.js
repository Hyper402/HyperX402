/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Keep all your aliases/fallbacks, no TS types needed in JS.
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // force the browser build of @irys/upload
      "@irys/upload": "@irys/upload/dist/web/index.js",

      // never bundle node-only deps on the client
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

module.exports = nextConfig;
