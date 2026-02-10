import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { UserTechnology, Technology } from '@/lib/db/models';
import { sequelize } from '@/lib/db/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const result = await UserTechnology.findAll({
      attributes: [
        'technologyId',
        [sequelize.fn('COUNT', sequelize.col('userId')), 'userCount'],
      ],
      where: { is_active: 1 },
      include: [
        {
          model: Technology,
          as: 'technology',
          attributes: ['name'],
        },
      ],
      group: ['technologyId', 'technology.id'],
      order: [[sequelize.literal('userCount'), 'DESC']],
      limit: 10,
    });

    const formatted = result.map((entry: any) => ({
      technology: entry.technology.name,
      userCount: entry.get('userCount'),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'Failed to load top technologies' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
