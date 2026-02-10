/**
 * POST /api/connects/cost - Update connect cost for a platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Platform } from '@/lib/db/models';

export const POST = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const { platformId, connect_cost_usd, connect_cost_inr } = await req.json();

    // Validate input
    if (!platformId) {
      return NextResponse.json(
        { message: 'platformId is required' },
        { status: 400 }
      );
    }

    // Find platform
    const platform = await Platform.findByPk(platformId);

    if (!platform) {
      return NextResponse.json(
        { message: 'Platform not found' },
        { status: 404 }
      );
    }

    // Update values
    platform.connect_cost_usd = connect_cost_usd ?? platform.connect_cost_usd;
    platform.connect_cost_inr = connect_cost_inr ?? platform.connect_cost_inr;

    await platform.save();

    return NextResponse.json({
      message: 'Connect cost updated successfully',
      data: platform,
    });
  } catch (error: any) {
    console.error('Error updating connect cost:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
