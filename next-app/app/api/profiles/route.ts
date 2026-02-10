/**
 * GET /api/profiles - Get all profile names
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Profile } from '@/lib/db/models';

export const GET = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const profiles = await Profile.findAll();

    return NextResponse.json(profiles);
  } catch (error: any) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles', details: error.message },
      { status: 500 }
    );
  }
});
