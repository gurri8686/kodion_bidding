import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Platform } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { platformName, connect_cost_usd, connect_cost_inr } = await req.json();

    if (!platformName) {
      return NextResponse.json(
        { message: 'Platform name is required' },
        { status: 400 }
      );
    }

    const exists = await Platform.findOne({ where: { name: platformName } });
    if (exists) {
      return NextResponse.json(
        { message: 'Platform already exists' },
        { status: 409 }
      );
    }

    const newPlatform = await Platform.create({
      name: platformName,
      connect_cost_usd,
      connect_cost_inr,
    });

    return NextResponse.json({
      message: 'Platform created successfully',
      data: newPlatform,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      message: 'Internal server error',
      error: (error as Error).message,
    }, { status: 500 });
  }
}

export const POST = withAuth(handler);
