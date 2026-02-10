/**
 * POST /api/auth/logout
 * User logout endpoint
 */

import { NextRequest, NextResponse } from 'next/server';


// Route segment config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    message: 'Logged out successfully',
  });

  // Clear the auth cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
