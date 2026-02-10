import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Portfolio } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { userId } = context.params;
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const { count, rows: portfolios } = await Portfolio.findAndCountAll({
      where: { user_id: userId },
      order: [
        ['display_order', 'ASC'],
        ['created_at', 'DESC']
      ],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      success: true,
      count: portfolios.length,
      totalCount: count,
      totalPages,
      currentPage: page,
      data: portfolios
    });
  } catch (error) {
    console.error('Error fetching user portfolios:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export const GET = withAuth(handler);
