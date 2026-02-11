/**
 * GET /api/admin/scrape-logs/summary
 * Get scrape log summary grouped by date
 */

import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { ScrapeLog } from '@/lib/db/models';
import { fn, col } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async () => {
  try {
    const logs = await ScrapeLog.findAll({
      attributes: [
        [fn('DATE', col('scrapedAt')), 'date'],
        [fn('SUM', col('jobCount')), 'totalJobs'],
      ],
      group: [fn('DATE', col('scrapedAt'))],
      order: [[fn('DATE', col('scrapedAt')), 'ASC']],
      raw: true,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Error fetching scrape log summary:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
});
