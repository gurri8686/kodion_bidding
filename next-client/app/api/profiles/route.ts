import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Profiles } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const profiles = await Profiles.findAll();
    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profiles', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
