import path from "node:path";
import type { NextConfig } from "next";

// Note: Environment variables are loaded from .env file created by prebuild script
// which fetches from AWS Secrets Manager before build

const nextRouterShimRelative =
  "./src/modules/warp/packages/client/compat/next-router-shim.ts";

const nextRouterShim =
  path.resolve(process.cwd(), nextRouterShimRelative).split(path.sep).join("/");

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    S3_BUCKET: process.env.S3_BUCKET,
    S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      "next/router": nextRouterShimRelative,
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "next/router$": nextRouterShim,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["jsdom", "formidable"],

  async rewrites() {
    return [
      {
        source: '/warp/api/:path*',
        destination: '/api/warp/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'rname, dashboardtype, languageguid, companyguid, Content-Type, Authorization, UserEmailId, encryptedemailid, password, UserGuid, ClientIP, userguid, userId, isOpsToken, browserToken, BrowserName, opsCompanyId, warpCompanyId, companyId, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, x-sk-op-authorization, CPanelCompanyId' },
        ],
      },
      {
        source: '/ghg/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'rname, dashboardtype, languageguid, companyguid, Content-Type, Authorization, UserEmailId, encryptedemailid, password, UserGuid, ClientIP, userguid, userId, isOpsToken, browserToken, BrowserName, opsCompanyId, warpCompanyId, companyId, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, x-sk-op-authorization, CPanelCompanyId' },
        ],
      },
      {
        source: '/esg/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'rname, dashboardtype, languageguid, companyguid, Content-Type, Authorization, UserEmailId, encryptedemailid, password, UserGuid, ClientIP, userguid, userId, isOpsToken, browserToken, BrowserName, opsCompanyId, warpCompanyId, companyId, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, x-sk-op-authorization, CPanelCompanyId' },
        ],
      },
    ];
  },
};

export default nextConfig;
