/**
 * GET /api/jobs/applied/[id] - Get applied jobs for a specific user (id = userId)
 * PUT /api/jobs/applied/[id] - Edit an applied job (id = appliedJobId)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { AppliedJob, Job, Profiles, Logs } from '@/lib/db/models';
import { uploadMultipleFiles, parseFilesFromFormData, deleteFile } from '@/lib/utils/fileUpload';

/**
 * GET - Get applied jobs for a specific user with filtering
 */
export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }, user: AuthenticatedUser) => {
    try {
      const params = await context.params;
      const userId = parseInt(params.id);
      const { searchParams } = new URL(req.url);

      const tech = searchParams.get('tech');
      const rating = searchParams.get('rating');
      const date = searchParams.get('date');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '5');
      const searchTerm = searchParams.get('searchTerm');
      const title = searchParams.get('title');
      const stage = searchParams.get('stage');

      const keyword = searchTerm || title;
      const offset = (page - 1) * limit;

      let jobWhereCondition: any = {};
      if (rating) {
        jobWhereCondition.rating = { [Op.gte]: parseFloat(rating) };
      }

      if (tech) {
        const techArray = Array.isArray(tech) ? tech : [tech];
        jobWhereCondition[Op.or] = techArray.map((t) => ({
          [Op.or]: [
            { selectedTech: t },
            Sequelize.where(Sequelize.fn('JSON_CONTAINS', Sequelize.col('techStack'), `"${t}"`), 1),
          ],
        }));
      }

      let appliedJobWhere: any = { userId };
      if (stage) {
        appliedJobWhere.stage = stage;
      }

      if (date) {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        appliedJobWhere = {
          ...appliedJobWhere,
          [Op.and]: [Sequelize.where(Sequelize.fn('DATE', Sequelize.col('applied_at')), formattedDate)],
        };
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        appliedJobWhere.appliedAt = {
          [Op.gte]: start,
          [Op.lte]: end,
        };
      }

      if (keyword) {
        appliedJobWhere[Op.or] = [
          { manualJobTitle: { [Op.like]: `%${keyword}%` } },
          Sequelize.literal(`Job.title LIKE '%${keyword}%'`),
        ];
      }

      const totalCount = await AppliedJob.count({
        where: appliedJobWhere,
        include: [
          {
            model: Job,
            where: jobWhereCondition,
            required: false,
          },
          {
            model: Profiles,
            as: 'profile',
            attributes: ['id', 'name'],
          },
        ],
      });

      const appliedJobs = await AppliedJob.findAll({
        where: appliedJobWhere,
        include: [
          {
            model: Job,
            where: jobWhereCondition,
            required: false,
          },
          {
            model: Profiles,
            as: 'profile',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        offset,
        limit,
      });

      return NextResponse.json({
        jobs: appliedJobs,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      });
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ message: 'Error fetching applied jobs' }, { status: 500 });
    }
  }
);

/**
 * PUT - Edit an applied job with file attachments
 */
export const PUT = withAuth(
  async (req: NextRequest, context: { params: Promise<{ id: string }> }, user: AuthenticatedUser) => {
    try {
      const params = await context.params;
      const id = parseInt(params.id);
      const userId = user.id;

      const formData = await req.formData();

      const appliedAtStr = formData.get('appliedAt') as string | null;
      const platformId = formData.get('platformId') as string | null;
      const existingAttachments = formData.get('existingAttachments') as string | null;

      const updatedFields: any = {};

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

      const newFiles = parseFilesFromFormData(formData);
      let newAttachmentUrls: string[] = [];

      if (newFiles.length > 0) {
        try {
          const uploadedFiles = await uploadMultipleFiles(newFiles, userId, 'attachments');
          newAttachmentUrls = uploadedFiles.map((file) => file.url);
        } catch (uploadError: any) {
          console.error('File upload error:', uploadError);
          return NextResponse.json(
            { error: `File upload failed: ${uploadError.message}` },
            { status: 400 }
          );
        }
      }

      const existingFiles = existingAttachments ? JSON.parse(existingAttachments) : [];
      updatedFields.attachments = [...existingFiles, ...newAttachmentUrls];

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

      // Cleanup removed files
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

        for (const fileUrl of toDelete) {
          try {
            await deleteFile(fileUrl);
          } catch (err) {
            console.error('Failed to delete old attachment', fileUrl, err);
          }
        }
      } catch (cleanupErr) {
        console.error('Error during attachment cleanup:', cleanupErr);
      }

      const oldData = JSON.parse(JSON.stringify((appliedJob as any).toJSON()));

      if (typeof oldData.technologies === 'string') {
        try {
          oldData.technologies = JSON.parse(oldData.technologies);
        } catch {
          oldData.technologies = [];
        }
      }

      if (updatedFields.hasOwnProperty('technologies') && !Array.isArray(updatedFields.technologies)) {
        return NextResponse.json({ message: 'Technologies must be an array' }, { status: 400 });
      }

      if (appliedAtStr) {
        const parsedDate = new Date(appliedAtStr);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json({ message: 'Invalid appliedAt date' }, { status: 400 });
        }
        updatedFields.appliedAt = parsedDate;
      }

      await appliedJob.update(updatedFields, {
        fields: Object.keys(updatedFields),
      });

      const newData = JSON.parse(JSON.stringify((appliedJob as any).toJSON()));

      const changes: any = {};
      for (const key of Object.keys(updatedFields)) {
        const oldValue = oldData[key];
        const newValue = newData[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes[key] = { old: oldValue, new: newValue };
        }
      }

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
