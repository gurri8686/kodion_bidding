/**
 * GET /api/developers - Get all developers
 * POST /api/developers - Create a new developer
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Developer } from '@/lib/db/models';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const developers = await Developer.findAll();

    return NextResponse.json(developers);
  } catch (error: any) {
    console.error('Error fetching developers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch developers', details: error.message },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const { name, email, contact } = await req.json();

    const developer = await Developer.create({
      developerId: uuidv4(),
      name,
      email,
      contact,
    });

    return NextResponse.json(developer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating developer:', error);
    return NextResponse.json(
      { error: 'Failed to add developer', details: error.message },
      { status: 500 }
    );
  }
});
