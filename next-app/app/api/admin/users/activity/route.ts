/**
 * GET /api/admin/users/activity
 * Get user activity details with applied, ignored, hired, and stage counts
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { User, Technologies } from '@/lib/db/models';
import { Op, Sequelize } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const whereClause: any = { role: { [Op.ne]: 'admin' } };

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
      attributes: [
        'id',
        'firstname',
        'lastname',
        'email',
        'joinDate',
        'lastActive',
        [
          Sequelize.literal('(SELECT COUNT(*) FROM applied_jobs AS aj WHERE aj.userId = users.id)'),
          'appliedJobsCount',
        ],
        [
          Sequelize.literal('(SELECT COUNT(*) FROM ignored_jobs AS ij WHERE ij.userId = users.id)'),
          'ignoredJobsCount',
        ],
        [
          Sequelize.literal('(SELECT COUNT(*) FROM hired_jobs AS hj WHERE hj.bidderId = users.id)'),
          'hiredJobsCount',
        ],
        [
          Sequelize.literal("(SELECT COUNT(*) FROM applied_jobs AS aj WHERE aj.userId = users.id AND aj.stage = 'replied')"),
          'repliedJobsCount',
        ],
        [
          Sequelize.literal("(SELECT COUNT(*) FROM applied_jobs AS aj WHERE aj.userId = users.id AND aj.stage = 'interview')"),
          'interviewedJobsCount',
        ],
        [
          Sequelize.literal("(SELECT COUNT(*) FROM applied_jobs AS aj WHERE aj.userId = users.id AND aj.stage = 'not-hired')"),
          'notHiredJobsCount',
        ],
      ],
      include: [
        {
          model: Technologies,
          as: 'technologies',
          through: { attributes: [] },
          attributes: ['name'],
        },
      ],
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.firstname,
      email: u.email,
      joinDate: u.joinDate,
      lastActive: u.lastActive,
      appliedJobs: u.getDataValue('appliedJobsCount'),
      ignoredJobs: u.getDataValue('ignoredJobsCount'),
      hiredJobs: u.getDataValue('hiredJobsCount'),
      repliedJobs: u.getDataValue('repliedJobsCount'),
      interviewedJobs: u.getDataValue('interviewedJobsCount'),
      notHiredJobs: u.getDataValue('notHiredJobsCount'),
      activeTechnologies: (u as any).technologies.map((t: any) => t.name),
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching users with stats:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
});
