import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow importing code from outside the Next.js app directory
    externalDir: true,
  },
};

export default nextConfig;
