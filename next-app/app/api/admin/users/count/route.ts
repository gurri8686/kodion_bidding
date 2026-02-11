/**
 * GET /api/admin/users/count
 * Get total user count (excluding admins)
 */

import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { User } from '@/lib/db/models';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async () => {
  try {
    const totalUsers = await User.count({
      where: {
        role: { [Op.ne]: 'admin' }, // Exclude admin users
      },
    });

    return NextResponse.json({ totalUsers });
  } catch (error: any) {
    console.error('Error fetching user count:', error.message);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
});
