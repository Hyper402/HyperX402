/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack is still used for production builds; keep aliases in both places
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // force the browser build of @irys/upload
      '@irys/upload': '@irys/upload/dist/web/index.js',

      // never try to bundle these node-only deps for the client
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

  // Turbopack dev mode needs its own alias map
  experimental: {
    turbo: {
      resolveAlias: {
        '@irys/upload': '@irys/upload/dist/web/index.js',
        inquirer: false,
        'external-editor': false,
        'child_process': false,
        'node:fs': false,
        'node:path': false,
        'node:os': false,
        fs: false,
        path: false,
        os: false,
      },
    },
  },
};

module.exports = nextConfig;
