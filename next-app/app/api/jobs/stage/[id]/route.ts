/**
 * PUT /api/jobs/stage/[id]
 * Update the stage of an applied job (replied, interview, not-hired)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { AppliedJob, Job, User } from '@/lib/db/models';
import { notifyJobReplied, notifyJobInterviewed, notifyJobNotHired } from '@/lib/utils/notificationHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }, user: AuthenticatedUser) => {
    try {
      const params = await context.params;
      const id = parseInt(params.id);
      const { stage, date, notes } = await req.json();

      if (!stage) {
        return NextResponse.json({ message: 'Stage is required' }, { status: 400 });
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
        return NextResponse.json({ message: 'Job not found' }, { status: 404 });
      }

      const oldStage = (job as any).stage;
      (job as any).stage = stage;

      // Save fields based on stage
      if (stage === 'replied') {
        (job as any).replyDate = date || new Date();
        (job as any).replyNotes = notes || null;
      } else if (stage === 'interview') {
        (job as any).interviewDate = date || new Date();
        (job as any).interviewNotes = notes || null;
      } else if (stage === 'not-hired') {
        (job as any).notHiredDate = date || new Date();
        (job as any).notHiredNotes = notes || null;
      }

      await job.save();

      // Send notifications if stage changed
      if (oldStage !== stage) {
        try {
          const jobData = job as any;
          const jobTitle = jobData.manualJobTitle || jobData.Job?.title || 'a job';
          const targetUser = await User.findByPk(jobData.userId);

          if (targetUser) {
            const notificationData = {
              jobId: jobData.jobId,
              title: jobTitle,
              userName: `${targetUser.firstname} ${targetUser.lastname}`,
            };

            if (stage === 'replied') {
              await notifyJobReplied(jobData.userId, {
                ...notificationData,
                platform: 'Unknown Platform',
              });
            } else if (stage === 'interview') {
              await notifyJobInterviewed(jobData.userId, notificationData);
            } else if (stage === 'not-hired') {
              await notifyJobNotHired(jobData.userId, notificationData);
            }
          }
        } catch (notifError) {
          console.error('Error sending stage change notification:', notifError);
          // Don't fail the request if notification fails
        }
      }

      return NextResponse.json({
        message: 'Stage updated successfully',
        job,
      });
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ message: 'Server error updating stage' }, { status: 500 });
    }
  }
);
