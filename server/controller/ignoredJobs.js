const Job = require("../models/Job");
const IgnoredJob = require("../models/IgnoredJob");
const { Op, Sequelize } = require("sequelize");

exports.ignoreJob = async (req, res) => {
  const { reason, customReason, job } = req.body;
  const userId = req.user.id;
  if (!reason && !customReason) {
    return res.status(400).json({ error: "Please provide a reason or custom reason." });
  }
  try {
    // Update Job to mark it ignored
    const [updated] = await Job.update(
      { ignoredJobs: true },
      { where: { jobId: job.jobId } }
    );
    if (!updated) {
      return res.status(404).json({ error: "Job not found" });
    }
    // Store reason and optional customReason
    await IgnoredJob.create({
      jobId: job.jobId,
      reason: reason || "Custom",
      customReason: customReason || null,
      userId,
    });
    res.status(200).json({ message: "Job marked as ignored" });
  } catch (err) {
    console.error("Error ignoring job:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getIgnoredJobs = async (req, res) => {
  const userId = req.user.role === 'admin' && req.query.userId
    ? parseInt(req.query.userId)
    : req.user.id;

  const {
    tech,
    rating,
    startDate,
    endDate,
    limit = 5,
    page = 1,
    jobType,
    hourlyMinRate,
    hourlyMaxRate,
    fixedPriceRange,
    customFixedMin,
    customFixedMax,
    title,
    date, // ✅ New date param from frontend
  } = req.query;

  try {
    const offset = (page - 1) * limit;
    let jobWhereCondition = {};

    // ⭐ Rating filter
    if (rating) {
      jobWhereCondition.rating = { [Op.gte]: parseFloat(rating) };
    }

    // ⭐ Title search
    if (title?.trim()) {
      jobWhereCondition.title = { [Op.like]: `%${title.trim()}%` };
    }

    // ⭐ Job Type (Hourly/Fixed)
    if (jobType && jobType !== "all") {
      jobWhereCondition.jobType = { [Op.like]: `%${jobType}%` };
    }

    // ⭐ Date filter on ignored job
    let ignoredJobWhere = { userId };

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

    // 🔍 Fetch ALL ignored jobs
    const ignoredJobs = await IgnoredJob.findAll({
      where: ignoredJobWhere,
      include: [
        {
          model: Job,
          where: jobWhereCondition,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // ⛏️ Manual Tech Filter
    let results = ignoredJobs.filter(entry => {
      const job = entry.Job;
      if (!job) return false;
      if (!tech) return true;

      const techStackArray = JSON.parse(job.techStack || "[]");
      return job.selectedTech === tech || techStackArray.includes(tech);
    });

    // 💰 Hourly Rate Filter
    if (jobType === "hourly" && (hourlyMinRate || hourlyMaxRate)) {
      const min = parseFloat(hourlyMinRate || 0);
      const max = parseFloat(hourlyMaxRate || Number.MAX_SAFE_INTEGER);

      results = results.filter(entry => {
        const rate = entry.Job?.hourlyRate;
        if (!rate) return false;

        const [minRate, maxRate] = rate
          .split("-")
          .map(r => parseFloat(r.replace(/[^0-9.]/g, ""))) || [0, 0];

        return minRate >= min && maxRate <= max;
      });
    }

    // 💰 Fixed Price Filter
    if (jobType === "fixed") {
      let min = 0;
      let max = Number.MAX_SAFE_INTEGER;

      switch (fixedPriceRange) {
        case "lt100":
        case "less-than-100":
          max = 100;
          break;
        case "100to500":
        case "100-500":
          min = 100;
          max = 500;
          break;
        case "500to1k":
        case "500-1k":
          min = 500;
          max = 1000;
          break;
        case "1kto5k":
        case "1k-5k":
          min = 1000;
          max = 5000;
          break;
        case "5k-plus":
        case "5k+":
          min = 5000;
          break;
        case "custom":
          if (customFixedMin) min = parseFloat(customFixedMin);
          if (customFixedMax) max = parseFloat(customFixedMax);
          break;
      }

      results = results.filter(entry => {
        const fixed = parseFloat(entry.Job?.fixedPrice?.replace(/[^0-9.]/g, "") || "0");
        return fixed >= min && fixed <= max;
      });
    }

    // 📄 Pagination
    const paginatedResults = results.slice(offset, offset + parseInt(limit));

    // 🧾 Format response
    const formattedJobs = paginatedResults.map(entry => ({
      ...entry.Job.dataValues,
      reason: entry.reason,
      customReason: entry.customReason,
      ignoredAt: entry.createdAt,
    }));

    res.status(200).json({
      jobs: formattedJobs,
      totalCount: results.length,
      totalPages: Math.ceil(results.length / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching ignored jobs:", error);
    res.status(500).json({ error: "Failed to fetch ignored jobs" });
  }
};


