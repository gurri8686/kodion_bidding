/**
 * GET /api/jobs/applied/[userId]
 * Get applied jobs for a specific user with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { AppliedJob, Job, Profiles } from '@/lib/db/models';

export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ userId: string }> }, user: AuthenticatedUser) => {
    try {
      const params = await context.params;
      const userId = parseInt(params.userId);
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

      // Handle job tech filter
      if (tech) {
        const techArray = Array.isArray(tech) ? tech : [tech];
        jobWhereCondition[Op.or] = techArray.map((t) => ({
          [Op.or]: [
            { selectedTech: t },
            Sequelize.where(Sequelize.fn('JSON_CONTAINS', Sequelize.col('techStack'), `"${t}"`), 1),
          ],
        }));
      }

      // Main AppliedJob filter
      let appliedJobWhere: any = { userId };
      if (stage) {
        appliedJobWhere.stage = stage;
      }

      // Handle single date filter
      if (date) {
        const formattedDate = new Date(date).toISOString().split('T')[0]; // 'YYYY-MM-DD'
        appliedJobWhere = {
          ...appliedJobWhere,
          [Op.and]: [Sequelize.where(Sequelize.fn('DATE', Sequelize.col('applied_at')), formattedDate)],
        };
      }

      // Handle date range
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        console.log(`Date Filter: ${start.toISOString()} to ${end.toISOString()}`);

        appliedJobWhere.appliedAt = {
          [Op.gte]: start,
          [Op.lte]: end,
        };
      }

      // Handle search
      if (keyword) {
        appliedJobWhere[Op.or] = [
          { manualJobTitle: { [Op.like]: `%${keyword}%` } },
          Sequelize.literal(`Job.title LIKE '%${keyword}%'`),
        ];
      }

      // Count total matching records
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

      // Get paginated results
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
