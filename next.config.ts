import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Strict mode catches double-render bugs early ──────────────────────────
  reactStrictMode: true,

  // ── Image optimization ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ── Security headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "cookie", key: "sb-access-token" }],
        destination: "/home",
        permanent: false,
      },
    ];
  },

  // ── Webpack: suppress Supabase realtime ws warning ────────────────────────
  webpack(config) {
    config.resolve.fallback = { ...config.resolve.fallback, net: false, tls: false };
    return config;
  },
};

export default nextConfig;