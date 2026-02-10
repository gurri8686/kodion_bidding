/**
 * GET /api/admin/logs/[id]
 * Get user logs with optional date filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { Logs, AppliedJob, Profiles } from '@/lib/db/models';
import { Op } from 'sequelize';

export const GET = withAdminAuth(async (req: NextRequest, context: { params: any }) => {
  try {
    const { id: userId } = await context.params;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Fetching user logs for userId:', userId);

    const whereClause: any = { changedByUserId: userId };

    // Support both single date & range
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
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user logs.', error: error.message },
      { status: 500 }
    );
  }
});
