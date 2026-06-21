import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers for all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
        ],
      },
      {
        // API routes: no caching
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  // Prevent source map exposure in production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
