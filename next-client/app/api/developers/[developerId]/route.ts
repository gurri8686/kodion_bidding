import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Developer } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function putHandler(req: NextRequest, context: any) {
  try {
    const { developerId } = context.params;
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update developer', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function deleteHandler(req: NextRequest, context: any) {
  try {
    const { developerId } = context.params;
    const developer = await Developer.findByPk(developerId);

    if (!developer) {
      return NextResponse.json(
        { error: 'Developer not found' },
        { status: 404 }
      );
    }

    await developer.destroy();
    return NextResponse.json({ message: 'Developer deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete developer', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
