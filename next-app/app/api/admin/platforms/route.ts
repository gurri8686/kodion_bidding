/**
 * GET /api/admin/platforms
 * Get all platforms
 */

import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { Platform } from '@/lib/db/models';

export const GET = withAdminAuth(async () => {
  try {
    const platforms = await Platform.findAll();

    return NextResponse.json(platforms);
  } catch (error: any) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
});
