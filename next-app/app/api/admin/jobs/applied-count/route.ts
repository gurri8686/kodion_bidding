/**
 * GET /api/admin/jobs/applied-count
 * Get total applied jobs count
 */

import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { AppliedJob } from '@/lib/db/models';

export const GET = withAdminAuth(async () => {
  try {
    const totalAppliedJobs = await AppliedJob.count();

    return NextResponse.json({ totalAppliedJobs });
  } catch (error: any) {
    console.error('Error fetching applied job count:', error.message);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
});
