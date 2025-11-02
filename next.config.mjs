/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure all Metaplex + Bundlr packages are properly transpiled for Next.js
  transpilePackages: [
    "@metaplex-foundation/mpl-token-metadata",
    "@metaplex-foundation/umi",
    "@metaplex-foundation/umi-bundle-defaults",
    "@metaplex-foundation/umi-uploader-bundlr",
  ],

  webpack: (config) => {
    // Fix for packages that rely on Node modules
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@irys/upload": "@irys/upload/dist/web/index.js",
      inquirer: false,
      "external-editor": false,
      "child_process": false,
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
