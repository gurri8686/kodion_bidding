import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, AppliedJob, Profiles } from '@/lib/db/models';
import { Op, Sequelize } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  const { userId } = context.params;

  const {
    tech,
    rating,
    date,
    startDate,
    endDate,
    page = '1',
    limit = '5',
    searchTerm,
    title,
    stage,
  } = Object.fromEntries(req.nextUrl.searchParams);

  const keyword = searchTerm || title;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let jobWhereCondition: any = {};
    if (rating) {
      jobWhereCondition.rating = { [Op.gte]: parseFloat(rating) };
    }

    // Handle job tech filter
    if (tech) {
      const techArray = Array.isArray(tech) ? tech : [tech];
      jobWhereCondition[Op.or] = techArray.map((t: string) => ({
        [Op.or]: [
          { selectedTech: t },
          Sequelize.where(
            Sequelize.fn('JSON_CONTAINS', Sequelize.col('techStack'), `"${t}"`),
            1
          ),
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
      const formattedDate = new Date(date).toISOString().split('T')[0];
      appliedJobWhere = {
        ...appliedJobWhere,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('DATE', Sequelize.col('applied_at')),
            formattedDate
          ),
        ],
      };
    }

    // Handle date range
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
      limit: parseInt(limit),
    });

    return NextResponse.json({
      jobs: appliedJobs,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Error fetching applied jobs' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
