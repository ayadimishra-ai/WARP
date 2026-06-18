// /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["jsx", "js", "tsx", "ts"],
  transpilePackages: [
    "@warp/client",
    "@warp/server",
    "@warp/graphql",
    "@warp/shared",
    "@warp/secrets",
  ],
  experimental: {
    esmExternals: false,
    instrumentationHook: true, // Enable instrumentation for loading secrets
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = config.resolve.fallback || {};
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

module.exports = nextConfig;
