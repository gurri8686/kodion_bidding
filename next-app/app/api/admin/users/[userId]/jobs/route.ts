/**
 * GET /api/admin/users/[userId]/jobs
 * Get all jobs (applied, hired, ignored) for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { AppliedJob, Job, HiredJob, IgnoredJob, Platform, Profiles } from '@/lib/db/models';

export const GET = withAdminAuth(async (req: NextRequest, context: { params: any }) => {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const userIdInt = parseInt(userId);

    // Get applied jobs for the user
    const appliedJobs = await AppliedJob.findAll({
      where: { userId: userIdInt },
      include: [
        {
          model: Job,
          required: false,
        },
        {
          model: Platform,
          as: 'platform',
          required: false,
        },
        {
          model: Profiles,
          as: 'profile',
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Get hired jobs for the user
    const hiredJobs = await HiredJob.findAll({
      include: [
        {
          model: AppliedJob,
          as: 'appliedJobDetails',
          where: { userId: userIdInt },
          required: true,
          include: [
            {
              model: Job,
              required: false,
            },
            {
              model: Platform,
              as: 'platform',
              required: false,
            },
            {
              model: Profiles,
              as: 'profile',
              required: false,
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Get ignored jobs for the user
    const ignoredJobs = await IgnoredJob.findAll({
      where: { userId: userIdInt },
      include: [
        {
          model: Job,
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({
      appliedJobs,
      hiredJobs,
      ignoredJobs,
      summary: {
        totalApplied: appliedJobs.length,
        totalHired: hiredJobs.length,
        totalIgnored: ignoredJobs.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user jobs:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
});
