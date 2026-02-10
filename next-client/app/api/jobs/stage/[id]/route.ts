import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, AppliedJob, User } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const { stage, date, notes } = await req.json();

    if (!stage) {
      return NextResponse.json(
        { message: 'Stage is required' },
        { status: 400 }
      );
    }

    const job = await AppliedJob.findByPk(id, {
      include: [
        {
          model: Job,
          attributes: ['title', 'jobId'],
        },
      ],
    });

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    const oldStage = job.stage;
    job.stage = stage;

    // Save fields based on stage
    if (stage === 'replied') {
      job.replyDate = date || new Date();
      job.replyNotes = notes || null;
    } else if (stage === 'interview') {
      job.interviewDate = date || new Date();
      job.interviewNotes = notes || null;
    } else if (stage === 'not-hired') {
      job.notHiredDate = date || new Date();
      job.notHiredNotes = notes || null;
    }

    await job.save();

    // Send notifications if stage changed
    if (oldStage !== stage) {
      try {
        const { notifyJobReplied, notifyJobInterviewed, notifyJobNotHired } = await import('@/lib/utils/notificationHelper');
        const io = (req as any).io;
        const user = await User.findByPk(job.userId);
        const jobTitle = job.manualJobTitle || job.Job?.title || 'a job';

        if (io && user) {
          const notificationData = {
            jobId: job.jobId,
            title: jobTitle,
            userName: `${user.firstname} ${user.lastname}`,
          };

          if (stage === 'replied') {
            await notifyJobReplied(io, job.userId, notificationData);
          } else if (stage === 'interview') {
            await notifyJobInterviewed(io, job.userId, notificationData);
          } else if (stage === 'not-hired') {
            await notifyJobNotHired(io, job.userId, notificationData);
          }
        }
      } catch (notifError) {
        console.error('Error sending stage change notification:', notifError);
      }
    }

    return NextResponse.json({
      message: 'Stage updated successfully',
      job,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Server error updating stage' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(handler);
