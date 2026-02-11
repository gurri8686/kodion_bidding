import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mysql2', 'sequelize'],

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

  // Rewrites to map old Express API routes to new Next.js API routes
  async rewrites() {
    return [
      // Jobs
      { source: '/api/jobs/get-jobs', destination: '/api/jobs' },
      { source: '/api/jobs/get-ignored-jobs', destination: '/api/jobs/ignored' },
      { source: '/api/jobs/applied-jobs/:userId', destination: '/api/jobs/applied/:userId' },
      { source: '/api/jobs/all-technology-names', destination: '/api/jobs/technologies/names' },
      { source: '/api/jobs/get-hired-jobs/:userId', destination: '/api/jobs/hired/:userId' },
      { source: '/api/jobs/active/:userId', destination: '/api/jobs/technologies/:userId' },

      // Developers
      { source: '/api/get-all-developers', destination: '/api/developers' },
      { source: '/api/add-developer', destination: '/api/developers' },
      { source: '/api/edit-developer/:developerId', destination: '/api/developers/:developerId' },
      { source: '/api/delete-developer/:developerId', destination: '/api/developers/:developerId' },

      // Admin - Users
      { source: '/api/admin/allusers', destination: '/api/admin/users' },
      { source: '/api/admin/user/:id/status', destination: '/api/admin/users/:id/status' },
      { source: '/api/admin/user/activity', destination: '/api/admin/users/activity' },
      { source: '/api/admin/user/:userId/jobs', destination: '/api/admin/users/:userId/jobs' },

      // Admin - Analytics
      { source: '/api/admin/job-stats', destination: '/api/admin/analytics/job-stats' },

      // Connects
      { source: '/api/get-connects/:userId', destination: '/api/connects/:userId' },
      { source: '/api/save-connect-cost', destination: '/api/connects/cost' },
      { source: '/api/create-platform', destination: '/api/connects/platform' },

      // Targets
      { source: '/api/get-target', destination: '/api/targets' },
      { source: '/api/set-target', destination: '/api/targets' },

      // Profiles
      { source: '/api/get-all-profiles', destination: '/api/profiles' },

      // Jobs - Apply/Edit/Stage/Hired (used by modals)
      { source: '/api/jobs/apply-job', destination: '/api/jobs/apply' },
      { source: '/api/jobs/edit-apply-job/:id', destination: '/api/jobs/applied/:id' },
      { source: '/api/jobs/update-stage/:id', destination: '/api/jobs/stage/:id' },
      { source: '/api/jobs/mark-hired', destination: '/api/jobs/hired' },

      // Portfolios
      { source: '/api/portfolios/all', destination: '/api/portfolios' },

      // Technology activate/deactivate
      { source: '/api/jobs/activate', destination: '/api/jobs/technologies/activate' },
      { source: '/api/jobs/deactivate', destination: '/api/jobs/technologies/deactivate' },

      // Admin - Logs
      { source: '/api/admin/logs/:userId', destination: '/api/admin/logs/:userId' },
    ];
  },
};

export default nextConfig;
