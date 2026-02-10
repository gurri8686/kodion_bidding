/**
 * PUT /api/jobs/applied/[jobId]
 * Edit an applied job with file attachments
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { AppliedJob, Profiles, Logs } from '@/lib/db/models';
import { uploadMultipleFiles, parseFilesFromFormData, deleteFile } from '@/lib/utils/fileUpload';

export const PUT = withAuth(
  async (req: NextRequest, context: { params: Promise<{ jobId: string }> }, user: AuthenticatedUser) => {
    try {
      const params = await context.params;
      const id = parseInt(params.jobId);
      const userId = user.id;

      // Parse FormData (for file uploads)
      const formData = await req.formData();

      // Extract fields from FormData
      const appliedAtStr = formData.get('appliedAt') as string | null;
      const platformId = formData.get('platformId') as string | null;
      const existingAttachments = formData.get('existingAttachments') as string | null;

      // Build updatedFields object
      const updatedFields: any = {};

      // Copy all other fields from formData
      for (const [key, value] of formData.entries()) {
        if (
          key !== 'appliedAt' &&
          key !== 'platformId' &&
          key !== 'existingAttachments' &&
          key !== 'attachments'
        ) {
          updatedFields[key] = value;
        }
      }

      if (platformId !== null) {
        updatedFields.platformId = platformId ? parseInt(platformId) : null;
      }

      // Handle file attachments
      const newFiles = parseFilesFromFormData(formData);
      let newAttachmentUrls: string[] = [];

      if (newFiles.length > 0) {
        try {
          const uploadedFiles = await uploadMultipleFiles(newFiles, userId, 'attachments');
          newAttachmentUrls = uploadedFiles.map((file) => file.url);
          console.log(`✅ Uploaded ${uploadedFiles.length} new files`);
        } catch (uploadError: any) {
          console.error('File upload error:', uploadError);
          return NextResponse.json(
            { error: `File upload failed: ${uploadError.message}` },
            { status: 400 }
          );
        }
      }

      // Merge existing attachments with new ones
      const existingFiles = existingAttachments ? JSON.parse(existingAttachments) : [];
      updatedFields.attachments = JSON.stringify([...existingFiles, ...newAttachmentUrls]);

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
        return NextResponse.json({ message: 'Applied job not found' }, { status: 404 });
      }

      // CLEANUP: remove files that existed previously but were removed by the user
      try {
        const oldAttachments = Array.isArray((appliedJob as any).attachments)
          ? (appliedJob as any).attachments
          : (appliedJob as any).attachments
          ? JSON.parse((appliedJob as any).attachments)
          : [];

        const newAttachmentsList = Array.isArray(updatedFields.attachments)
          ? updatedFields.attachments
          : updatedFields.attachments
          ? JSON.parse(updatedFields.attachments)
          : [];

        const toDelete = oldAttachments.filter((oldUrl: string) => !newAttachmentsList.includes(oldUrl));

        // Delete removed files from Vercel Blob
        for (const fileUrl of toDelete) {
          try {
            await deleteFile(fileUrl);
            console.log('Deleted old attachment:', fileUrl);
          } catch (err) {
            console.error('Failed to delete old attachment', fileUrl, err);
          }
        }
      } catch (cleanupErr) {
        console.error('Error during attachment cleanup:', cleanupErr);
      }

      // Convert old snapshot to plain object
      const oldData = JSON.parse(JSON.stringify((appliedJob as any).toJSON()));

      // Ensure technologies is parsed
      if (typeof oldData.technologies === 'string') {
        try {
          oldData.technologies = JSON.parse(oldData.technologies);
        } catch {
          oldData.technologies = [];
        }
      }

      // Validate technologies array
      if (updatedFields.hasOwnProperty('technologies') && !Array.isArray(updatedFields.technologies)) {
        return NextResponse.json({ message: 'Technologies must be an array' }, { status: 400 });
      }

      // Validate appliedAt date
      if (appliedAtStr) {
        const parsedDate = new Date(appliedAtStr);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ message: 'Invalid appliedAt date' }, { status: 400 });
        }
        updatedFields.appliedAt = parsedDate;
      }

      // Perform update
      await appliedJob.update(updatedFields, {
        fields: Object.keys(updatedFields),
      });

      // New snapshot
      const newData = JSON.parse(JSON.stringify((appliedJob as any).toJSON()));

      // Generate field-level diff
      const changes: any = {};
      for (const key of Object.keys(updatedFields)) {
        const oldValue = oldData[key];
        const newValue = newData[key];

        // Compare JSON safely
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
    } catch (err: any) {
      console.error('Error updating applied job:', err);
      return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
  }
);
