/**
 * POST /api/jobs/ignore
 * Mark a job as ignored
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Job, IgnoredJob } from '@/lib/db/models';

export const POST = withAuth(async (req: NextRequest, context: any, user: AuthenticatedUser) => {
  try {
    const { reason, customReason, job } = await req.json();
    const userId = user.id;

    if (!reason && !customReason) {
      return NextResponse.json(
        { error: 'Please provide a reason or custom reason.' },
        { status: 400 }
      );
    }

    // Update Job to mark it ignored
    const [updated] = await Job.update({ ignoredJobs: true }, { where: { jobId: job.jobId } });

    if (!updated) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Store reason and optional customReason
    await IgnoredJob.create({
      jobId: job.jobId,
      reason: reason || 'Custom',
      customReason: customReason || null,
      userId,
    });

    return NextResponse.json({ message: 'Job marked as ignored' });
  } catch (err: any) {
    console.error('Error ignoring job:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
});
