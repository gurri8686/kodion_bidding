import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Developer } from '@/lib/db/models';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getHandler(req: NextRequest, context: any) {
  try {
    const developers = await Developer.findAll();
    return NextResponse.json(developers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch developers', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function postHandler(req: NextRequest, context: any) {
  try {
    const { name, email, contact } = await req.json();
    const developer = await Developer.create({
      developerId: uuidv4(),
      name,
      email,
      contact
    });
    return NextResponse.json(developer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add developer', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
