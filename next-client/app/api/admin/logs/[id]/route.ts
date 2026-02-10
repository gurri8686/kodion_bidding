import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Logs, AppliedJob, Profiles } from '@/lib/db/models';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const userId = context.params.id;
    const { date, startDate, endDate } = Object.fromEntries(req.nextUrl.searchParams);

    const whereClause: any = { changedByUserId: userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.createdAt = { [Op.between]: [startOfDay, endOfDay] };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt = { [Op.between]: [start, end] };
    }

    const logs = await Logs.findAll({
      where: whereClause,
      include: [
        {
          model: AppliedJob,
          as: 'appliedJob',
          attributes: ['id', 'profileId', 'manual_job_title'],
          include: [
            {
              model: Profiles,
              as: 'profile',
              attributes: ['name'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user logs.' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
