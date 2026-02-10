/**
 * Authentication Middleware for Next.js API Routes
 *
 * Replaces Express middleware with Next.js-compatible auth
 * Supports both cookie-based and header-based JWT authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { User } from '../db/models';

const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_change_me';

export interface AuthenticatedUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  [key: string]: any;
}

/**
 * Authenticate request and return user
 * Checks for JWT in cookie first, then Authorization header
 */
export async function authenticate(
  req: NextRequest
): Promise<{ user: AuthenticatedUser } | NextResponse> {
  try {
    // Try to get token from cookie first
    let token = req.cookies.get('token')?.value;

    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // No token found
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (jwtError: any) {
      console.error('JWT verification failed:', jwtError.message);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Fetch user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }, // Don't return password
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return NextResponse.json(
        { error: 'Forbidden - Your account has been blocked by the admin' },
        { status: 403 }
      );
    }

    // Return authenticated user
    return { user: user.toJSON() as AuthenticatedUser };
  } catch (error: any) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}

/**
 * Higher-order function to wrap API route handlers with authentication
 *
 * Usage:
 * export const GET = withAuth(async (req, context, user) => {
 *   // user is guaranteed to be authenticated here
 *   return NextResponse.json({ data: 'protected' });
 * });
 */
export function withAuth(
  handler: (
    req: NextRequest,
    context: { params?: any },
    user: AuthenticatedUser
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: { params?: any } = {}) => {
    const authResult = await authenticate(req);

    // If authentication failed, return error response
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Call handler with authenticated user
    return handler(req, context, authResult.user);
  };
}

/**
 * Check if user has admin role
 * Use this after withAuth to restrict routes to admins only
 */
export function requireAdmin(user: AuthenticatedUser): NextResponse | null {
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Wrapper for admin-only routes
 *
 * Usage:
 * export const GET = withAdminAuth(async (req, context, user) => {
 *   // user is guaranteed to be admin here
 *   return NextResponse.json({ adminData: 'secret' });
 * });
 */
export function withAdminAuth(
  handler: (
    req: NextRequest,
    context: { params?: any },
    user: AuthenticatedUser
  ) => Promise<NextResponse>
) {
  return withAuth(async (req, context, user) => {
    const adminCheck = requireAdmin(user);
    if (adminCheck) return adminCheck;
    return handler(req, context, user);
  });
}
