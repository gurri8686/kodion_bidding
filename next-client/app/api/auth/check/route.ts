/**
 * GET /api/auth/check
 * Check if user is authenticated
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_change_me';


// Route segment config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Get token from cookies
  let token = req.cookies.get('token')?.value;

  // If not in cookies, check Authorization header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // If still no token, return unauthorized
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      id: number;
      role: string;
    };

    return NextResponse.json({
      userId: decoded.id,
      role: decoded.role,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
