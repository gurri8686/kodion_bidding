/**
 * GET /api/jobs/ignored
 * Get ignored jobs with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { Job, IgnoredJob } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (req: NextRequest, context: any, user: AuthenticatedUser) => {
  try {
    const { searchParams } = new URL(req.url);

    const userId =
      user.role === 'admin' && searchParams.get('userId')
        ? parseInt(searchParams.get('userId')!)
        : user.id;

    const tech = searchParams.get('tech');
    const rating = searchParams.get('rating');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '5');
    const page = parseInt(searchParams.get('page') || '1');
    const jobType = searchParams.get('jobType');
    const hourlyMinRate = searchParams.get('hourlyMinRate');
    const hourlyMaxRate = searchParams.get('hourlyMaxRate');
    const fixedPriceRange = searchParams.get('fixedPriceRange');
    const customFixedMin = searchParams.get('customFixedMin');
    const customFixedMax = searchParams.get('customFixedMax');
    const title = searchParams.get('title');
    const date = searchParams.get('date');

    const offset = (page - 1) * limit;
    let jobWhereCondition: any = {};

    // Rating filter
    if (rating) {
      jobWhereCondition.rating = { [Op.gte]: parseFloat(rating) };
    }

    // Title search
    if (title?.trim()) {
      jobWhereCondition.title = { [Op.like]: `%${title.trim()}%` };
    }

    // Job Type (Hourly/Fixed)
    if (jobType && jobType !== 'all') {
      jobWhereCondition.jobType = { [Op.like]: `%${jobType}%` };
    }

    // Date filter on ignored job
    let ignoredJobWhere: any = { userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      ignoredJobWhere.createdAt = { [Op.between]: [startOfDay, endOfDay] };
    }
    // Fallback: support for startDate + endDate (legacy)
    else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      ignoredJobWhere.createdAt = { [Op.between]: [start, end] };
    }

    // Fetch ALL ignored jobs
    const ignoredJobs = await IgnoredJob.findAll({
      where: ignoredJobWhere,
      include: [
        {
          model: Job,
          where: jobWhereCondition,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Manual Tech Filter
    let results = ignoredJobs.filter((entry: any) => {
      const job = entry.Job;
      if (!job) return false;
      if (!tech) return true;

      const techStackArray = JSON.parse(job.techStack || '[]');
      return job.selectedTech === tech || techStackArray.includes(tech);
    });

    // Hourly Rate Filter
    if (jobType === 'hourly' && (hourlyMinRate || hourlyMaxRate)) {
      const min = parseFloat(hourlyMinRate || '0');
      const max = parseFloat(hourlyMaxRate || String(Number.MAX_SAFE_INTEGER));

      results = results.filter((entry: any) => {
        const rate = entry.Job?.hourlyRate;
        if (!rate) return false;

        const [minRate, maxRate] =
          rate.split('-').map((r: string) => parseFloat(r.replace(/[^0-9.]/g, ''))) || [0, 0];

        return minRate >= min && maxRate <= max;
      });
    }

    // Fixed Price Filter
    if (jobType === 'fixed') {
      let min = 0;
      let max = Number.MAX_SAFE_INTEGER;

      switch (fixedPriceRange) {
        case 'lt100':
        case 'less-than-100':
          max = 100;
          break;
        case '100to500':
        case '100-500':
          min = 100;
          max = 500;
          break;
        case '500to1k':
        case '500-1k':
          min = 500;
          max = 1000;
          break;
        case '1kto5k':
        case '1k-5k':
          min = 1000;
          max = 5000;
          break;
        case '5k-plus':
        case '5k+':
          min = 5000;
          break;
        case 'custom':
          if (customFixedMin) min = parseFloat(customFixedMin);
          if (customFixedMax) max = parseFloat(customFixedMax);
          break;
      }

      results = results.filter((entry: any) => {
        const fixed = parseFloat(entry.Job?.fixedPrice?.replace(/[^0-9.]/g, '') || '0');
        return fixed >= min && fixed <= max;
      });
    }

    // Pagination
    const paginatedResults = results.slice(offset, offset + limit);

    // Format response
    const formattedJobs = paginatedResults.map((entry: any) => ({
      ...entry.Job.dataValues,
      reason: entry.reason,
      customReason: entry.customReason,
      ignoredAt: entry.createdAt,
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      totalCount: results.length,
      totalPages: Math.ceil(results.length / limit),
      currentPage: page,
    });
  } catch (error: any) {
    console.error('Error fetching ignored jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch ignored jobs' }, { status: 500 });
  }
});
