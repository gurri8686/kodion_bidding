/**
 * GET /api/admin/jobs/count
 * Get total job count
 */

import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { Job } from '@/lib/db/models';

export const GET = withAdminAuth(async () => {
  try {
    const totalJobs = await Job.count();

    return NextResponse.json({ totalJobs });
  } catch (error: any) {
    console.error('Error fetching job count:', error.message);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
});
