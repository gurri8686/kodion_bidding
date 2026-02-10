import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { User, Technology } from '@/lib/db/models';
import { Op, Sequelize } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { search } = Object.fromEntries(req.nextUrl.searchParams);
    const whereClause: any = { role: { [Op.ne]: 'admin' } };

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
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id
      )`),
          'appliedJobsCount',
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM ignored_jobs AS ij
        WHERE ij.userId = User.id
      )`),
          'ignoredJobsCount',
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM hired_jobs AS ij
        WHERE ij.bidderId = User.id
      )`),
          'hiredJobsCount',
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id AND aj.stage = 'replied'
      )`),
          'repliedJobsCount',
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id AND aj.stage = 'interview'
      )`),
          'interviewedJobsCount',
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id AND aj.stage = 'not-hired'
      )`),
          'notHiredJobsCount',
        ],
      ],
      include: [
        {
          model: Technology,
          as: 'technologies',
          through: { attributes: [] },
          attributes: ['name'],
        },
      ],
    });

    const result = users.map((u: any) => ({
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
      activeTechnologies: u.technologies.map((t: any) => t.name),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users with stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
