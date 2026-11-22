import type { NextConfig } from "next";

// Server-only (no NEXT_PUBLIC_), e.g. https://pulse-server-g89f.onrender.com
const API_PROXY_TARGET = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
  // The browser calls /api/v1/* on our own origin; Next forwards it to the
  // backend server-side. Same-origin → no CORS check in the browser.
  async rewrites() {
    if (!API_PROXY_TARGET) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_PROXY_TARGET}/api/v1/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
