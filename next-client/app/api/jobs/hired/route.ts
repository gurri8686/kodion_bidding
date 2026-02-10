import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, AppliedJob, HiredJob, User } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
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
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Find the applied job to get its numeric ID
    const appliedJob = await AppliedJob.findOne({ where: { jobId } });
    if (!appliedJob) {
      return NextResponse.json(
        { message: 'Applied job not found.' },
        { status: 404 }
      );
    }

    // Check if already hired using the applied job's ID
    const existing = await HiredJob.findOne({ where: { jobId: appliedJob.id } });
    if (existing) {
      return NextResponse.json(
        { message: 'This job has already been marked as hired.' },
        { status: 409 }
      );
    }

    // Create hired record with the applied job's numeric ID
    const hiredJob = await HiredJob.create({
      jobId: appliedJob.id,
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

    // Update stage to 'hired'
    await AppliedJob.update(
      {
        stage: 'hired',
        hiredDate: hiredDate,
      },
      { where: { jobId } }
    );

    // Update jobs table
    await Job.update({ hiredJobs: 1 }, { where: { jobId } });

    // Send notification
    try {
      const { notifyJobHired } = await import('@/lib/utils/notificationHelper');
      const io = (req as any).io;
      const job = await Job.findOne({ where: { jobId } });
      const user = await User.findByPk(bidderId);

      if (io && user) {
        await notifyJobHired(io, bidderId, {
          jobId,
          jobTitle: job?.title || 'the job',
          clientName,
          budget: budgetAmount,
          userName: `${user.firstname} ${user.lastname}`,
        });
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    return NextResponse.json({
      message: 'Job successfully marked as hired.',
      hiredJob,
    }, { status: 201 });
  } catch (error) {
    console.error('Error marking job as hired:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
