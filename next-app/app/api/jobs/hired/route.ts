/**
 * POST /api/jobs/hired - Mark a job as hired
 * GET /api/jobs/hired - Get all hired jobs (not used in Express - placeholder)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { HiredJob, Job, AppliedJob, User } from '@/lib/db/models';
import { notifyJobHired } from '@/lib/utils/notificationHelper';

/**
 * POST /api/jobs/hired
 * Mark a job as hired
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req: NextRequest, context: any, user: AuthenticatedUser) => {
  try {
    const {
      jobId,
      bidderId,
      developerId,
      hiredAt,
      notes,
      budgetType,
      budgetAmount,
      clientName,
      profileName,
      hiredDate,
    } = await req.json();

    // Required validations
    if (
      !jobId ||
      !bidderId ||
      !developerId ||
      !hiredAt ||
      !budgetType ||
      !budgetAmount ||
      !clientName ||
      !profileName
    ) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // Find the applied job to verify it exists
    const appliedJob = await AppliedJob.findOne({ where: { jobId } });
    if (!appliedJob) {
      return NextResponse.json({ message: 'Applied job not found.' }, { status: 404 });
    }

    // Check if already hired using the string jobId
    const existing = await HiredJob.findOne({ where: { jobId } });
    if (existing) {
      return NextResponse.json(
        { message: 'This job has already been marked as hired.' },
        { status: 409 }
      );
    }

    // Create hired record with the string jobId (matches Job.jobId and AppliedJob.jobId)
    const hiredJob = await HiredJob.create({
      jobId,
      bidderId,
      developerId,
      hiredAt,
      notes: notes || null,
      budgetType,
      budgetAmount,
      clientName,
      profileName,
      hiredDate,
    });

    // DO NOT REMOVE FROM applied_jobs
    // Instead, update stage to 'hired'
    await AppliedJob.update(
      {
        stage: 'hired',
        hiredDate: hiredDate,
      },
      { where: { jobId } }
    );

    // Optional: update jobs table (if needed)
    await Job.update({ hiredJobs: 1 }, { where: { jobId } });

    // SEND NOTIFICATION
    try {
      const job = await Job.findOne({ where: { jobId } });
      const targetUser = await User.findByPk(bidderId);

      if (targetUser) {
        await notifyJobHired(bidderId, {
          jobId: parseInt(jobId) || 0,
          jobTitle: (job as any)?.title || 'the job',
          clientName,
          budget: budgetAmount,
          userName: `${targetUser.firstname} ${targetUser.lastname}`,
        });
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      {
        message: 'Job successfully marked as hired.',
        hiredJob,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error marking job as hired:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
});
