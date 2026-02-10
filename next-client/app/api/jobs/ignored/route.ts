import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { Job, IgnoredJob } from '@/lib/db/models';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  const userId = context.user.role === 'admin' && req.nextUrl.searchParams.get('userId')
    ? parseInt(req.nextUrl.searchParams.get('userId')!)
    : context.user.id;

  const {
    tech,
    rating,
    startDate,
    endDate,
    limit = '5',
    page = '1',
    jobType,
    hourlyMinRate,
    hourlyMaxRate,
    fixedPriceRange,
    customFixedMin,
    customFixedMax,
    title,
    date,
  } = Object.fromEntries(req.nextUrl.searchParams);

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
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
    } else if (startDate && endDate) {
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

        const [minRate, maxRate] = rate
          .split('-')
          .map((r: string) => parseFloat(r.replace(/[^0-9.]/g, ''))) || [0, 0];

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
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

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
      totalPages: Math.ceil(results.length / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Error fetching ignored jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ignored jobs' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
