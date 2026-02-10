import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, AppliedJob, HiredJob, Developer } from '@/lib/db/models';
import { Op } from 'sequelize';
import { sequelize } from '@/lib/db/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { bidderId } = context.params;
    const { date, startDate, endDate, page = '1', limit = '6' } = Object.fromEntries(req.nextUrl.searchParams);

    if (!bidderId) {
      return NextResponse.json(
        { message: 'Missing bidderId in request params.' },
        { status: 400 }
      );
    }

    const whereClause: any = { bidderId };

    // Handle single date filter
    if (date) {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.fn('DATE', sequelize.col('hired_at')),
          formattedDate
        ),
      ];
    }

    // Handle date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

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

    const offset = (parseInt(page) - 1) * parseInt(limit);

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
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return NextResponse.json({
      hiredJobs,
      totalPages,
      totalCount: count
    });
  } catch (error) {
    console.error('Error fetching hired jobs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
