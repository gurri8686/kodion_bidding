/**
 * GET /api/jobs/hired/[bidderId]
 * Get hired jobs for a specific bidder with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { HiredJob, Job, Developer, AppliedJob } from '@/lib/db/models';
import { sequelize } from '@/lib/db/connection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ bidderId: string }> }, user: AuthenticatedUser) => {
    try {
      const params = await context.params;
      const bidderId = parseInt(params.bidderId);
      const { searchParams } = new URL(req.url);

      if (!bidderId) {
        return NextResponse.json(
          { message: 'Missing bidderId in request params.' },
          { status: 400 }
        );
      }

      const date = searchParams.get('date');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '6');

      const whereClause: any = { bidderId };

      // Handle single date filter (exact date match)
      if (date) {
        const formattedDate = new Date(date).toISOString().split('T')[0]; // 'YYYY-MM-DD'
        whereClause[Op.and] = [
          sequelize.where(sequelize.fn('DATE', sequelize.col('hiredAt')), formattedDate),
        ];
      }

      // Handle date range filter
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        console.log(
          `Hired Jobs Date Filter: ${start.toISOString()} to ${end.toISOString()}`
        );

        whereClause.hiredAt = {
          [Op.gte]: start,
          [Op.lte]: end,
        };
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.hiredAt = { [Op.gte]: start };
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.hiredAt = { [Op.lte]: end };
      }

      const offset = (page - 1) * limit;

      const { rows: hiredJobs, count } = await HiredJob.findAndCountAll({
        where: whereClause,
        include: [
          { model: Job, as: 'jobDetails' },
          { model: Developer, as: 'developerDetails' },
          {
            model: AppliedJob,
            as: 'appliedJobDetails',
            attributes: [
              'manualJobTitle',
              'manualJobDescription',
              'manualJobUrl',
              'attachments',
              'technologies',
            ],
            required: false, // LEFT JOIN
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset,
      });

      const totalPages = Math.ceil(count / limit);

      return NextResponse.json({
        hiredJobs,
        totalPages,
        totalCount: count, // Total number of hired jobs
      });
    } catch (error: any) {
      console.error('Error fetching hired jobs:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
);
