import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    env: {
      hasDbHost: !!process.env.MYSQL_DB_HOST,
      hasDbName: !!process.env.MYSQL_DB_NAME,
      hasDbUser: !!process.env.MYSQL_DB_USER,
      hasDbPassword: !!process.env.MYSQL_DB_PASSWORD,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({
    status: 'ok',
    message: 'POST is working',
    received: body,
    timestamp: new Date().toISOString(),
  });
}
