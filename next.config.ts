import type { NextConfig } from "next";

// Per-environment upstream (uat/beta/production). Strip any trailing slash so
// the rewrite destination never becomes `https://host//api/...`.
const API_UPSTREAM = process.env.API_UPSTREAM?.replace(/\/+$/, "");

const securityHeaders = [
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  { key: "X-XSS-Protection",          value: "1; mode=block" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",        // build self-contained → .next/standalone/server.js (run with `node`, no Next.js install needed)
  skipTrailingSlashRedirect: true,

  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },

  async rewrites() {
    if (!API_UPSTREAM) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${API_UPSTREAM}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
