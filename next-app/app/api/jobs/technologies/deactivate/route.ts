/**
 * POST /api/jobs/technologies/deactivate
 * Deactivate a technology for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Technologies, UserTechnologies } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth(async (req: NextRequest, context: any, user: AuthenticatedUser) => {
  try {
    const { userId, technologyName } = await req.json();

    if (!userId || !technologyName) {
      return NextResponse.json(
        { message: 'userId and technologyName are required' },
        { status: 400 }
      );
    }

    const formattedTechName = technologyName.trim().toLowerCase();

    const technology = await Technologies.findOne({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), formattedTechName),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('aliases')), {
            [Op.like]: `%${formattedTechName}%`,
          }),
        ],
      },
    });

    if (!technology) {
      return NextResponse.json({ message: 'Technology not found' }, { status: 404 });
    }

    const [updated] = await UserTechnologies.update(
      { is_active: false },
      { where: { userId, technologyId: (technology as any).id } }
    );

    if (updated === 0) {
      return NextResponse.json(
        { message: 'Technology not associated with user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `${technologyName} deactivated for user ${userId}`,
    });
  } catch (error: any) {
    console.error('Error deactivating technology:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
});
