/**
 * PUT /api/developers/[developerId] - Edit a developer
 * DELETE /api/developers/[developerId] - Delete a developer
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Developer } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ developerId: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const { developerId } = params;
    const { name, email, contact } = await req.json();

    const developer = await Developer.findByPk(developerId);

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    }

    developer.name = name || developer.name;
    developer.email = email || developer.email;
    developer.contact = contact || developer.contact;

    await developer.save();

    return NextResponse.json(developer);
  } catch (error: any) {
    console.error('Error updating developer:', error);
    return NextResponse.json(
      { error: 'Failed to update developer', details: error.message },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ developerId: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const { developerId } = params;

    const developer = await Developer.findByPk(developerId);

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    }

    await developer.destroy();

    return NextResponse.json({ message: 'Developer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting developer:', error);
    return NextResponse.json(
      { error: 'Failed to delete developer', details: error.message },
      { status: 500 }
    );
  }
});
