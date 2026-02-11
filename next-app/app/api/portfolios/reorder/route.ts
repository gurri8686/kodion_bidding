/**
 * PATCH /api/portfolios/reorder - Reorder portfolios
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Portfolio } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const { portfolios } = await req.json();

    if (!Array.isArray(portfolios) || portfolios.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Portfolios array is required',
        },
        { status: 400 }
      );
    }

    // Update each portfolio's display_order
    const updatePromises = portfolios.map((item: any) =>
      Portfolio.update(
        { display_order: item.display_order },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Portfolios reordered successfully',
    });
  } catch (error: any) {
    console.error('Error reordering portfolios:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reorder portfolios',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
