/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@irys/upload': '@irys/upload/dist/web/index.js',
      inquirer: false,
      'external-editor': false,
      'child_process': false,
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
