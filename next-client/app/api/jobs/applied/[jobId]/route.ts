import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { AppliedJob, Profiles, Logs } from '@/lib/db/models';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const id = context.params.jobId;
    const userId = context.user.id;

    const body = await req.json();
    const { appliedAt, platformId, existingAttachments, ...updatedFields } = body;

    if (platformId !== undefined) {
      updatedFields.platformId = platformId;
    }

    // Handle new file attachments - store only URLs
    const newAttachments: string[] = [];

    // Merge existing attachments with new ones
    const existingFiles = existingAttachments
      ? JSON.parse(existingAttachments)
      : [];
    updatedFields.attachments = [...existingFiles, ...newAttachments];

    // Fetch existing job
    const appliedJob = await AppliedJob.findOne({
      where: { id, userId },
      include: [
        {
          model: Profiles,
          as: 'profile',
          attributes: ['name'],
        },
      ],
    });

    if (!appliedJob) {
      return NextResponse.json(
        { message: 'Applied job not found' },
        { status: 404 }
      );
    }

    // CLEANUP: remove files that existed previously but were removed by the user.
    try {
      const oldAttachments = Array.isArray(appliedJob.attachments)
        ? appliedJob.attachments
        : appliedJob.attachments
        ? JSON.parse(appliedJob.attachments)
        : [];
      const newAttachmentsList = Array.isArray(updatedFields.attachments)
        ? updatedFields.attachments
        : updatedFields.attachments
        ? JSON.parse(updatedFields.attachments)
        : [];

      const toDelete = oldAttachments.filter(
        (oldUrl: string) => !newAttachmentsList.includes(oldUrl)
      );

      toDelete.forEach((fileUrl: string) => {
        const parts = fileUrl.split('/');
        const filename = parts[parts.length - 1];
        const filePath = path.join(
          process.cwd(),
          'server',
          'uploads',
          'attachments',
          filename
        );
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err)
              console.error('Failed to delete old attachment', filePath, err);
            else console.log('Deleted old attachment', filePath);
          });
        }
      });
    } catch (cleanupErr) {
      console.error('Error during attachment cleanup:', cleanupErr);
    }

    // Convert old snapshot to plain object
    const oldData = JSON.parse(JSON.stringify(appliedJob.toJSON()));

    // Ensure technologies is parsed
    if (typeof oldData.technologies === 'string') {
      try {
        oldData.technologies = JSON.parse(oldData.technologies);
      } catch {
        oldData.technologies = [];
      }
    }

    // Validate technologies array
    if (
      updatedFields.hasOwnProperty('technologies') &&
      !Array.isArray(updatedFields.technologies)
    ) {
      return NextResponse.json(
        { message: 'Technologies must be an array' },
        { status: 400 }
      );
    }

    // Validate appliedAt date
    if (appliedAt) {
      const parsedDate = new Date(appliedAt);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { message: 'Invalid appliedAt date' },
          { status: 400 }
        );
      }
      updatedFields.appliedAt = parsedDate;
    }

    // Perform update
    await appliedJob.update(updatedFields, {
      fields: Object.keys(updatedFields),
    });

    // New snapshot
    const newData = JSON.parse(JSON.stringify(appliedJob.toJSON()));

    // Generate field-level diff
    const changes: any = {};
    for (const key of Object.keys(updatedFields)) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    }

    // Save log
    await Logs.create({
      appliedJobId: id,
      changedByUserId: userId,
      oldData,
      newData,
      changes,
      changeType: 'edit',
    });

    return NextResponse.json({
      message: 'Applied job updated successfully',
      appliedJob,
    });
  } catch (err) {
    console.error('Error updating applied job:', err);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(handler);
