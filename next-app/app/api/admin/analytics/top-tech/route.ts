/**
 * GET /api/admin/analytics/top-tech
 * Get top 10 technologies by user count
 */

import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { UserTechnologies, Technologies } from '@/lib/db/models';
import { fn, col, literal } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async () => {
  try {
    const result = await UserTechnologies.findAll({
      attributes: [
        'technologyId',
        [fn('COUNT', col('userId')), 'userCount'],
      ],
      where: { is_active: 1 },
      include: [
        {
          model: Technologies,
          as: 'technology',
          attributes: ['name'],
        },
      ],
      group: ['technologyId', 'technology.id'],
      order: [[literal('userCount'), 'DESC']],
      limit: 10,
    });

    // Format for frontend
    const formatted = result.map((entry: any) => ({
      technology: entry.technology.name,
      userCount: entry.get('userCount'),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching top technologies:', error);
    return NextResponse.json(
      { message: 'Failed to load top technologies', error: error.message },
      { status: 500 }
    );
  }
});
