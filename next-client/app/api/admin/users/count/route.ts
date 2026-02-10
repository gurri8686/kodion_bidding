import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { User } from '@/lib/db/models';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const totalUsers = await User.count({
      where: {
        role: { [Op.ne]: 'admin' },
      },
    });

    return NextResponse.json({ totalUsers });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
