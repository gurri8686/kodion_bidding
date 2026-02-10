/**
 * GET /api/jobs - Get filtered jobs
 * POST /api/jobs/add - Save scraped jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { Op, Sequelize } from 'sequelize';
import { Job, ScrapeLog, TechnologyJobCount, IgnoredJob, AppliedJob } from '@/lib/db/models';

/**
 * GET /api/jobs
 * Get jobs with filtering (tech, rating, dates, job type, budget, etc.)
 */

// Route segment config for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const tech = searchParams.get('tech');
    const rating = searchParams.get('rating');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');
    const title = searchParams.get('title');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const jobType = searchParams.get('jobType');
    const hourlyMinRate = searchParams.get('hourlyMinRate');
    const hourlyMaxRate = searchParams.get('hourlyMaxRate');
    const fixedPriceRange = searchParams.get('fixedPriceRange');

    const offset = (page - 1) * limit;
    const selectedTechs = tech ? (tech.includes(',') ? tech.split(',') : [tech]) : [];
    const currentUserId = userId ? parseInt(userId) : null;

    // 1. Get excluded job IDs
    const excludedJobIds: string[] = [];
    if (currentUserId) {
      const [ignoredJobs, appliedJobs] = await Promise.all([
        IgnoredJob.findAll({ where: { userId: currentUserId }, attributes: ['jobId'] }),
        AppliedJob.findAll({ where: { userId: currentUserId }, attributes: ['jobId'] }),
      ]);

      excludedJobIds.push(
        ...ignoredJobs.map((j: any) => j.jobId),
        ...appliedJobs.map((j: any) => j.jobId)
      );
    }

    // 2. Build where condition
    const whereCondition: any = {};

    if (excludedJobIds.length > 0) {
      whereCondition.jobId = { [Op.notIn]: excludedJobIds };
    }

    if (title?.trim()) {
      whereCondition.title = { [Op.like]: `%${title.trim()}%` };
    }

    if (selectedTechs.length > 0) {
      whereCondition[Op.or] = [
        { selectedTech: { [Op.in]: selectedTechs } },
        ...selectedTechs.map((t) => ({
          techStack: { [Op.like]: `%${t}%` },
        })),
      ];
    }

    if (rating) {
      whereCondition.rating = { [Op.gte]: parseFloat(rating) };
    }

    if (jobType) {
      const jt = jobType.toLowerCase();
      if (jt === 'hourly') whereCondition.jobType = { [Op.like]: '%hourly%' };
      else if (jt === 'fixed') whereCondition.jobType = { [Op.like]: '%fixed%' };
    }

    // 3. Date filters
    const now = new Date();
    const defaultStartDate = new Date(now);
    defaultStartDate.setDate(now.getDate() - 3);
    const formattedStart = new Date(startDate || defaultStartDate).toISOString().split('T')[0];
    const formattedEnd = new Date(endDate || now).toISOString().split('T')[0];

    whereCondition[Op.and] = [
      Sequelize.where(
        Sequelize.fn('DATE', Sequelize.fn('STR_TO_DATE', Sequelize.col('exactDateTime'), '%d/%m/%Y, %r')),
        { [Op.gte]: formattedStart }
      ),
      Sequelize.where(
        Sequelize.fn('DATE', Sequelize.fn('STR_TO_DATE', Sequelize.col('exactDateTime'), '%d/%m/%Y, %r')),
        { [Op.lte]: formattedEnd }
      ),
    ];

    // 4. Budget filters using string parsing
    const additionalConditions: any[] = [];

    if (jobType === 'hourly' && (hourlyMinRate || hourlyMaxRate)) {
      const min = parseFloat(hourlyMinRate || '0');
      const max = parseFloat(hourlyMaxRate || '999999');

      additionalConditions.push(
        Sequelize.where(
          Sequelize.literal(`CAST(REPLACE(SUBSTRING_INDEX(hourlyRate, '-', 1), '$', '') AS DECIMAL(10,2))`),
          { [Op.gte]: min }
        ),
        Sequelize.where(
          Sequelize.literal(`CAST(REPLACE(SUBSTRING_INDEX(hourlyRate, '-', -1), '$', '') AS DECIMAL(10,2))`),
          { [Op.lte]: max }
        )
      );
    }

    if (jobType === 'fixed' && fixedPriceRange) {
      let min = 0,
        max = Number.MAX_SAFE_INTEGER;

      switch (fixedPriceRange) {
        case 'less-than-100':
          max = 100;
          break;
        case '100-500':
          min = 100;
          max = 500;
          break;
        case '500-1k':
          min = 500;
          max = 1000;
          break;
        case '1k-5k':
          min = 1000;
          max = 5000;
          break;
        case '5k-20k':
          min = 5000;
          max = 20000;
          break;
        case '20k-plus':
          min = 20000;
          break;
      }

      additionalConditions.push(
        Sequelize.where(
          Sequelize.literal(`CAST(REPLACE(fixedPrice, '$', '') AS DECIMAL(10,2))`),
          { [Op.between]: [min, max] }
        )
      );
    }

    if (additionalConditions.length > 0) {
      whereCondition[Op.and].push(...additionalConditions);
    }

    // 5. Get paginated jobs & total count
    const [jobs, totalCount] = await Promise.all([
      Job.findAll({
        where: whereCondition,
        limit: limit,
        offset,
        order: [[Sequelize.fn('STR_TO_DATE', Sequelize.col('exactDateTime'), '%d/%m/%Y, %r'), 'DESC']],
      }),
      Job.count({ where: whereCondition }),
    ]);

    // 6. Flags for applied status
    const appliedMap: Record<string, boolean> = {};
    if (currentUserId) {
      const appliedJobs = await AppliedJob.findAll({
        where: { userId: currentUserId },
        attributes: ['jobId'],
      });
      appliedJobs.forEach((j: any) => {
        appliedMap[j.jobId] = true;
      });
    }

    const jobsWithFlags = jobs.map((job: any) => ({
      ...job.dataValues,
      isAppliedByUser: false,
      isAppliedByOtherUser: appliedMap[job.jobId] || false,
    }));

    // 7. Respond
    return NextResponse.json({
      jobs: jobsWithFlags,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/jobs/add
 * Save scraped jobs (bulk insert)
 */
export async function POST(req: NextRequest) {
  try {
    console.log('saveJob called');
    const { jobs, techJobCounts } = await req.json();

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty job array' }, { status: 400 });
    }

    // Step 1: Create a temporary scrape log
    const scrapeLog = await ScrapeLog.create({
      jobCount: 0,
      scrapedAt: new Date(),
    });

    // Step 2: Pre-check existing jobIds to avoid duplicates
    const allJobIds = jobs.map((job: any) => job.jobId).filter(Boolean);
    const existingJobs = await Job.findAll({
      where: { jobId: allJobIds },
      attributes: ['jobId'],
    });

    const existingJobIds = new Set(existingJobs.map((job: any) => job.jobId));
    const duplicates: string[] = [];
    const jobsToInsert: any[] = [];

    const actualTechCounts: Record<string, number> = {};

    for (const jobData of jobs) {
      const jobId = jobData.jobId;
      if (!jobId || existingJobIds.has(jobId)) {
        duplicates.push(jobId);
        continue;
      }

      jobData.scrapeLogId = scrapeLog.id;
      jobsToInsert.push(jobData);

      const tech = jobData.selectedTech;
      if (tech) {
        actualTechCounts[tech] = (actualTechCounts[tech] || 0) + 1;
      }
    }

    // Step 3: Bulk insert all non-duplicate jobs
    const savedJobs = await Job.bulkCreate(jobsToInsert, { validate: true });

    // Step 4: Update scrape log with actual saved count
    await scrapeLog.update({ jobCount: savedJobs.length });

    // Step 5: Save tech job counts
    const techCountEntries = Object.entries(actualTechCounts).map(([technology, count]) => ({
      scrapeLogId: scrapeLog.id,
      technology,
      count,
    }));

    if (techCountEntries.length > 0) {
      await TechnologyJobCount.bulkCreate(techCountEntries);
    }

    console.log(`✅ Saved: ${savedJobs.length}, ❌ Duplicates: ${duplicates.length}`);

    return NextResponse.json({
      message: 'Batch job insert complete',
      scrapeLogId: scrapeLog.id,
      saved_count: savedJobs.length,
      duplicate_count: duplicates.length,
      actual_tech_counts: actualTechCounts,
      frontend_tech_counts: techJobCounts,
    });
  } catch (err: any) {
    console.error('❌ Error saving jobs:', err);
    return NextResponse.json({ error: 'Server error during job saving' }, { status: 500 });
  }
}
