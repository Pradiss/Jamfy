import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  // Proxies browser-side API calls through this same origin instead of
  // hitting the backend's own domain directly. Without this, the frontend
  // (vercel.app) and backend (onrender.com) count as different sites, and
  // Safari/iOS blocks the session cookie as third-party even though it's
  // set correctly with SameSite=None — the request "succeeds" but the
  // cookie never sticks, so login silently doesn't persist. Routing
  // through a same-origin rewrite makes the cookie first-party instead.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
  images: {
    // Lets next/image optimize photos served from Supabase Storage (the
    // only external image host this app uses).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
