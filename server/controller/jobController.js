const Job = require("../models/Job");
const { Op, Sequelize } = require("sequelize");
const ScrapeLog = require("../models/ScrapeLog");
const AppliedJob = require("../models/Applyjob");
const TechnologyJobCount = require("../models/TechnologyJobCount");
const IgnoredJob = require('../models/IgnoredJob');

const saveJob = async (req, res) => {
  console.log("saveJob called");
  const { jobs, techJobCounts } = req.body;

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ error: "Invalid or empty job array" });
  }

  try {
    // Step 1: Create a temporary scrape log
    const scrapeLog = await ScrapeLog.create({
      jobCount: 0,
      scrapedAt: new Date(),
    });

    // Step 2: Pre-check existing jobIds to avoid duplicates
    const allJobIds = jobs.map((job) => job.jobId).filter(Boolean);
    const existingJobs = await Job.findAll({
      where: { jobId: allJobIds },
      attributes: ["jobId"],
    });

    const existingJobIds = new Set(existingJobs.map((job) => job.jobId));
    const duplicates = [];
    const jobsToInsert = [];

    const actualTechCounts = {};

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

    return res.status(200).json({
      message: "Batch job insert complete",
      scrapeLogId: scrapeLog.id,
      saved_count: savedJobs.length,
      duplicate_count: duplicates.length,
      actual_tech_counts: actualTechCounts,
      frontend_tech_counts: techJobCounts,
      // saved: savedJobs, // uncomment only if really needed
      // duplicates, // same here
    });
  } catch (err) {
    console.error("❌ Error saving jobs:", err);
    return res.status(500).json({ error: "Server error during job saving" });
  }
};
const getJobs = async (req, res) => {
  try {
    const {
      tech,
      rating,
      startDate,
      endDate,
      userId,
      title,
      page = 1,
      limit = 5,
      jobType,
      hourlyMinRate,
      hourlyMaxRate,
      fixedPriceRange,
    } = req.query;

    const offset = (page - 1) * limit;
    const selectedTechs = tech ? (Array.isArray(tech) ? tech : [tech]) : [];
    const currentUserId = parseInt(userId);

    // 1. Get excluded job IDs
    const [ignoredJobs, appliedJobs] = await Promise.all([
      IgnoredJob.findAll({ where: { userId: currentUserId }, attributes: ["jobId"] }),
      AppliedJob.findAll({ where: { userId: currentUserId }, attributes: ["jobId"] }),
    ]);

    const excludedJobIds = [
      ...ignoredJobs.map((j) => j.jobId),
      ...appliedJobs.map((j) => j.jobId),
    ];

    // 2. Build where condition
    const whereCondition = {};

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
      if (jt === "hourly") whereCondition.jobType = { [Op.like]: "%hourly%" };
      else if (jt === "fixed") whereCondition.jobType = { [Op.like]: "%fixed%" };
    }

    // 3. Date filters
    const now = new Date();
    const defaultStartDate = new Date(now);
    defaultStartDate.setDate(now.getDate() - 3);
    const formattedStart = new Date(startDate || defaultStartDate).toISOString().split("T")[0];
    const formattedEnd = new Date(endDate || now).toISOString().split("T")[0];

    whereCondition[Op.and] = [
      Sequelize.where(
        Sequelize.fn("DATE", Sequelize.fn("STR_TO_DATE", Sequelize.col("exactDateTime"), "%d/%m/%Y, %r")),
        { [Op.gte]: formattedStart }
      ),
      Sequelize.where(
        Sequelize.fn("DATE", Sequelize.fn("STR_TO_DATE", Sequelize.col("exactDateTime"), "%d/%m/%Y, %r")),
        { [Op.lte]: formattedEnd }
      ),
    ];

    // 4. Budget filters using string parsing
    const additionalConditions = [];

    if (jobType === "hourly" && (hourlyMinRate || hourlyMaxRate)) {
      const min = parseFloat(hourlyMinRate || 0);
      const max = parseFloat(hourlyMaxRate || 999999);

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

    if (jobType === "fixed" && fixedPriceRange) {
      let min = 0, max = Number.MAX_SAFE_INTEGER;

      switch (fixedPriceRange) {
        case "less-than-100":
          max = 100;
          break;
        case "100-500":
          min = 100;
          max = 500;
          break;
        case "500-1k":
          min = 500;
          max = 1000;
          break;
        case "1k-5k":
          min = 1000;
          max = 5000;
          break;
        case "5k-20k":
          min = 5000;
          max = 20000;
          break;
        case "20k-plus":
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
        limit: parseInt(limit),
        offset,
        order: [[Sequelize.fn("STR_TO_DATE", Sequelize.col("exactDateTime"), "%d/%m/%Y, %r"), "DESC"]],
      }),
      Job.count({ where: whereCondition }),
    ]);

    // 6. Flags for applied status
    const appliedMap = {};
    appliedJobs.forEach(({ jobId }) => {
      appliedMap[jobId] = true;
    });

    const jobsWithFlags = jobs.map((job) => ({
      ...job.dataValues,
      isAppliedByUser: false,
      isAppliedByOtherUser: appliedMap[job.jobId] || false,
    }));

    // 7. Respond
    res.status(200).json({
      jobs: jobsWithFlags,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
}; 
const getScrapelogs = async (req, res) => {
  try {
    const { filterType, customDate } = req.query;
    const whereClause = {};

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

    const formattedLogs = logs.map(log => ({
      scrapeLogId: log.id,
      totalJobCount: log.jobCount,
      scrapedAt: log.scrapedAt,
      technologies: log.techCounts.map(tc => ({
        technology: tc.technology,
        count: tc.count
      }))
    }));

    res.status(200).json(formattedLogs);
  } catch (err) {
    console.error("Error fetching scrape logs:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

module.exports = { saveJob, getJobs, getScrapelogs };

 