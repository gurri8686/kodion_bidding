/**
 * POST /api/jobs/apply
 * Apply to a job with file attachments
 *
 * This is a complex route demonstrating:
 * - Authentication (withAuth)
 * - File uploads (Vercel Blob)
 * - Database operations (Sequelize)
 * - Real-time notifications (Pusher)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { AppliedJob, Job, IgnoredJob, Profiles, User, Platform } from '@/lib/db/models';
import { uploadMultipleFiles, parseFilesFromFormData } from '@/lib/utils/fileUpload';
import { notifyJobApplied } from '@/lib/utils/notificationHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    // Parse FormData (for file uploads)
    const formData = await req.formData();

    // Extract fields from FormData
    const userId = user.id;
    const originalJobId = formData.get('jobId') as string | null;
    const jobTitle = formData.get('jobTitle') as string | null;
    const jobDescription = formData.get('jobDescription') as string | null;
    const upworkJobUrl = formData.get('upworkJobUrl') as string | null;
    const bidderName = formData.get('bidderName') as string;
    const profileId = parseInt(formData.get('profileId') as string);
    const technologies = formData.get('technologies') as string;
    const connectsUsed = parseInt(formData.get('connectsUsed') as string);
    const proposalLink = formData.get('proposalLink') as string | null;
    const platformId = formData.get('platformId')
      ? parseInt(formData.get('platformId') as string)
      : null;
    const submitted = formData.get('submitted') === 'true';
    const appliedAtStr = formData.get('appliedAt') as string | null;

    console.log('📝 Job application request:', { userId, originalJobId, jobTitle, profileId });

    // Parse technologies (might be JSON string from FormData)
    let parsedTechnologies: any = technologies;
    if (typeof technologies === 'string') {
      try {
        parsedTechnologies = JSON.parse(technologies);
      } catch (e) {
        parsedTechnologies = technologies;
      }
    }

    // Validate profile
    const profile = await Profiles.findOne({ where: { id: profileId } });
    if (!profile) {
      return NextResponse.json(
        { message: 'Invalid profile selected' },
        { status: 400 }
      );
    }

    // Generate jobId for manual jobs
    const jobId = originalJobId || `manual-${userId}-${Date.now()}`;

    // Check for duplicate application
    const alreadyApplied = await AppliedJob.findOne({
      where: { userId, jobId, profileId },
    });

    if (alreadyApplied) {
      return NextResponse.json(
        { message: 'Already applied to this job with this profile' },
        { status: 400 }
      );
    }

    // Handle file attachments - upload to Vercel Blob
    const files = parseFilesFromFormData(formData);
    let attachmentUrls: string[] = [];

    if (files.length > 0) {
      try {
        const uploadedFiles = await uploadMultipleFiles(files, userId, 'attachments');
        attachmentUrls = uploadedFiles.map((file) => file.url);
        console.log(`✅ Uploaded ${uploadedFiles.length} files to Vercel Blob`);
      } catch (uploadError: any) {
        console.error('File upload error:', uploadError);
        return NextResponse.json(
          { error: `File upload failed: ${uploadError.message}` },
          { status: 400 }
        );
      }
    }

    // Create applied job record
    const appliedJob = await AppliedJob.create({
      userId,
      jobId,
      bidderName,
      profileId,
      technologies: parsedTechnologies,
      connectsUsed,
      proposalLink,
      submitted,
      appliedAt: appliedAtStr ? new Date(appliedAtStr) : new Date(),
      platformId,
      manualJobTitle: jobTitle || null,
      manualJobDescription: jobDescription || null,
      manualJobUrl: upworkJobUrl || null,
      attachments: attachmentUrls, // Store as JSON array
    });

    console.log('✅ Applied job created:', appliedJob.id);

    // Update or create Job table entry
    if (originalJobId) {
      const job = await Job.findOne({ where: { jobId: originalJobId } });

      if (job) {
        job.appliedJobs = true;

        // Remove from ignored jobs if exists
        const ignored = await IgnoredJob.findOne({
          where: { userId, jobId: originalJobId },
        });

        if (ignored) {
          await ignored.destroy();
          job.ignoredJobs = false;
        }

        await job.save();
      }
    } else {
      // Manual job - create new Job entry
      await Job.create({
        jobId,
        title: jobTitle,
        link: upworkJobUrl,
        appliedJobs: true,
        ignoredJobs: false,
      });
    }

    // Send notification via Pusher
    try {
      const platform = platformId ? await Platform.findByPk(platformId) : null;

      await notifyJobApplied(userId, {
        jobId: parseInt(jobId) || 0,
        title: jobTitle || 'a job',
        platform: platform?.name || 'Unknown Platform',
        connectsUsed,
        userName: `${user.firstname} ${user.lastname}`,
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      {
        message: 'Applied job saved!',
        job: appliedJob,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in applyToJob:', error);
    return NextResponse.json(
      { message: 'Error saving applied job', error: error.message },
      { status: 500 }
    );
  }
});

