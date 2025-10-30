/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Webpack customization (used in production builds)
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),

      // Force the browser build of @irys/upload (avoid Node-only imports)
      '@irys/upload': '@irys/upload/dist/web/index.js',

      // Prevent bundling of Node-only dependencies for browser builds
      inquirer: false,
      'external-editor': false,
      'child_process': false,
      'node:fs': false,
      'node:path': false,
      'node:os': false,
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

// ❌ Removed invalid experimental.turbo block (Next.js 16 no longer supports it)
module.exports = nextConfig;
