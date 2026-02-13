/**
 * GET /api/connects/[userId] - Get connects usage for profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { AppliedJob, User, Profiles } from '@/lib/db/models';
import { Op, Sequelize } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
  user: AuthenticatedUser
) => {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const whereClause: any = {};
    if (date) {
      const startOfDay = new Date(date + 'T00:00:00');
      const endOfDay = new Date(date + 'T23:59:59');
      whereClause.created_at = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    const usage = await AppliedJob.findAll({
      attributes: [
        'userId',
        'profileId',
        [Sequelize.fn('SUM', Sequelize.col('applied_jobs.connects_used')), 'total_connects'],
        [Sequelize.fn('COUNT', Sequelize.col('applied_jobs.id')), 'total_entries'],
        [Sequelize.fn('MAX', Sequelize.col('applied_jobs.created_at')), 'last_used'],
      ],
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'firstname', 'email'],
        },
        {
          model: Profiles,
          as: 'profile',
          attributes: ['id', 'name'],
        },
      ],
      group: [
        'applied_jobs.userId',
        'applied_jobs.profileId',
        'User.id',
        'profile.id',
      ],
      order: [[Sequelize.fn('MAX', Sequelize.col('applied_jobs.created_at')), 'DESC']],
    });

    return NextResponse.json(usage);
  } catch (error: any) {
    console.error('Error fetching connects usage:', error);
    return NextResponse.json(
      { message: 'Error fetching connects usage' },
      { status: 500 }
    );
  }
});
