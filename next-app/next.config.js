/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes work properly on Vercel
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Allow images from external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;
