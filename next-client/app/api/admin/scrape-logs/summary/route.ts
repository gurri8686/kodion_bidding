import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { ScrapeLog } from '@/lib/db/models';
import { Sequelize } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const logs = await ScrapeLog.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('scrapedAt')), 'date'],
        [Sequelize.fn('SUM', Sequelize.col('jobCount')), 'totalJobs'],
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('scrapedAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('scrapedAt')), 'ASC']],
      raw: true,
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error('Error fetching scrape log summary:', err);
    return NextResponse.json(
      { error: (err as Error).message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
