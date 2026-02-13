/**
 * GET /api/admin/users
 * Get all users with pagination and search filter (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { User } from '@/lib/db/models';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const whereClause: any = {
      role: { [Op.ne]: 'admin' }, // Exclude admins
    };

    // Apply search filter if provided
    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['joinDate', 'DESC']],
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
});
