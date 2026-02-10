import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Platform } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { platformId, connect_cost_usd, connect_cost_inr } = await req.json();

    if (!platformId) {
      return NextResponse.json(
        { message: 'platformId is required' },
        { status: 400 }
      );
    }

    const platform = await Platform.findByPk(platformId);

    if (!platform) {
      return NextResponse.json(
        { message: 'Platform not found' },
        { status: 404 }
      );
    }

    platform.connect_cost_usd = connect_cost_usd ?? platform.connect_cost_usd;
    platform.connect_cost_inr = connect_cost_inr ?? platform.connect_cost_inr;

    await platform.save();

    return NextResponse.json({
      message: 'Connect cost updated successfully',
      data: platform
    });
  } catch (error) {
    console.error('Error updating connect cost:', error);
    return NextResponse.json({
      message: 'Internal server error',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export const POST = withAuth(handler);
