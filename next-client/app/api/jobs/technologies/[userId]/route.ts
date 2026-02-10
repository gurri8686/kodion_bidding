import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Technologies, UserTechnologies } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  const { userId } = context.params;

  if (!userId) {
    return NextResponse.json(
      { message: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const allTechnologies = await UserTechnologies.findAll({
      where: { userId },
      include: [{
        model: Technologies,
        as: 'technology',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedTechs = allTechnologies.map((entry: any) => ({
      id: entry.technology.id,
      name: entry.technology.name,
      is_active: entry.is_active
    }));

    return NextResponse.json({ technologies: formattedTechs });
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
