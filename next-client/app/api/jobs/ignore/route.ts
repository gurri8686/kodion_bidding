import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, IgnoredJob } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const body = await req.json();
    const { reason, customReason, job } = body;
    const userId = context.user.id;

    if (!reason && !customReason) {
      return NextResponse.json(
        { error: 'Please provide a reason or custom reason.' },
        { status: 400 }
      );
    }

    // Update Job to mark it ignored
    const [updated] = await Job.update(
      { ignoredJobs: true },
      { where: { jobId: job.jobId } }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Store reason and optional customReason
    await IgnoredJob.create({
      jobId: job.jobId,
      reason: reason || 'Custom',
      customReason: customReason || null,
      userId,
    });

    return NextResponse.json(
      { message: 'Job marked as ignored' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error ignoring job:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
