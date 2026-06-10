import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Compressed product images (<1MB each) are uploaded via server actions.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
