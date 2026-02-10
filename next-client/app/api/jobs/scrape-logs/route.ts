import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, ScrapeLog, TechnologyJobCount } from '@/lib/db/models';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { filterType, customDate } = Object.fromEntries(req.nextUrl.searchParams);
    const whereClause: any = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filterType === 'today') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      whereClause.scrapedAt = { [Op.gte]: today, [Op.lt]: tomorrow };
    } else if (filterType === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      whereClause.scrapedAt = {
        [Op.gte]: yesterday,
        [Op.lt]: today
      };
    } else if (filterType === 'custom' && customDate) {
      const custom = new Date(customDate);
      const nextDay = new Date(custom);
      custom.setHours(0, 0, 0, 0);
      nextDay.setDate(custom.getDate() + 1);
      whereClause.scrapedAt = { [Op.gte]: custom, [Op.lt]: nextDay };
    }

    const logs = await ScrapeLog.findAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'jobs',
          attributes: ['jobId'],
        },
        {
          model: TechnologyJobCount,
          as: 'techCounts',
          attributes: ['technology', 'count'],
        }
      ],
      order: [['scrapedAt', 'DESC']],
    });

    const formattedLogs = logs.map((log: any) => ({
      scrapeLogId: log.id,
      totalJobCount: log.jobCount,
      scrapedAt: log.scrapedAt,
      technologies: log.techCounts.map((tc: any) => ({
        technology: tc.technology,
        count: tc.count
      }))
    }));

    return NextResponse.json(formattedLogs);
  } catch (err) {
    console.error('Error fetching scrape logs:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
