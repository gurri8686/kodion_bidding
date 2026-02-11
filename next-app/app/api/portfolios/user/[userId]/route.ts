/**
 * GET /api/portfolios/user/[userId] - Get all portfolios for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Portfolio } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const { userId } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const { count, rows: portfolios } = await Portfolio.findAndCountAll({
      where: { user_id: userId },
      order: [
        ['display_order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      count: portfolios.length,
      totalCount: count,
      totalPages,
      currentPage: page,
      data: portfolios,
    });
  } catch (error: any) {
    console.error('Error fetching user portfolios:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch portfolios',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
