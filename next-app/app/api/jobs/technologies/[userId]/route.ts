/**
 * GET /api/jobs/technologies/[userId]
 * Get all technologies for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { UserTechnologies, Technologies } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async (req: NextRequest, context: { params: Promise<{ userId: string }> }, user: AuthenticatedUser) => {
    try {
      const params = await context.params;
      const userId = parseInt(params.userId);

      if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
      }

      const allTechnologies = await UserTechnologies.findAll({
        where: { userId },
        include: [
          {
            model: Technologies,
            as: 'technology',
            attributes: ['id', 'name'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const formattedTechs = allTechnologies.map((entry: any) => ({
        id: entry.technology.id,
        name: entry.technology.name,
        is_active: entry.is_active,
      }));

      return NextResponse.json({ technologies: formattedTechs });
    } catch (error: any) {
      console.error('Error fetching technologies:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
);
