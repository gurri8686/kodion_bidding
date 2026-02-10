import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, AppliedJob, HiredJob, IgnoredJob, Platform, Profiles } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { userId } = context.params;

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get applied jobs for the user
    const appliedJobs = await AppliedJob.findAll({
      where: { userId: parseInt(userId) },
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
          where: { userId: parseInt(userId) },
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
      where: { userId: parseInt(userId) },
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
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
