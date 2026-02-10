import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Portfolio } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { portfolios } = await req.json();

    if (!Array.isArray(portfolios) || portfolios.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Portfolios array is required'
      }, { status: 400 });
    }

    const updatePromises = portfolios.map((item: any) =>
      Portfolio.update(
        { display_order: item.display_order },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Portfolios reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering portfolios:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reorder portfolios',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export const PATCH = withAuth(handler);
