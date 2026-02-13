/**
 * GET /api/admin/users/[userId]/jobs
 * Get all jobs (applied, hired, ignored) for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { AppliedJob, Job, HiredJob, IgnoredJob, Platform, Profiles, User, Developer } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: NextRequest, context: { params?: any }) => {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const userIdInt = parseInt(id);

    // Get user info
    const user = await User.findByPk(userIdInt, {
      attributes: ['id', 'firstname', 'lastname', 'email'],
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

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
        {
          model: Developer,
          as: 'developerDetails',
          required: false,
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

    // Count stage-based stats from applied jobs
    const appliedPlain = appliedJobs.map((j) => j.get({ plain: true }));
    const repliedCount = appliedPlain.filter((j) => j.stage === 'replied').length;
    const interviewCount = appliedPlain.filter((j) => j.stage === 'interview').length;
    const notHiredCount = appliedPlain.filter((j) => j.stage === 'not-hired').length;

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`.trim() || user.firstname,
        email: user.email,
      },
      appliedJobs,
      hiredJobs,
      ignoredJobs,
      summary: {
        totalApplied: appliedJobs.length,
        totalHired: hiredJobs.length,
        totalIgnored: ignoredJobs.length,
        totalReplied: repliedCount,
        totalInterviewed: interviewCount,
        totalNotHired: notHiredCount,
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
