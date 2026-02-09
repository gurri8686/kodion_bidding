const User = require("../models/User");
const Job = require("../models/Job");
const AppliedJob = require("../models/Applyjob.js");
const HiredJob = require("../models/HiredJobs.js");
const UserTechnology = require("../models/UserTechnologies.js");
const Technology = require("../models/Technologies.js");
const Profiles = require("../models/Profiles.js");
const sequelize = require("sequelize");
const ScrapeLog = require("../models/ScrapeLog");
const UserTechnologies = require("../models/UserTechnologies");
const { notifyUserBlocked, notifyUserActivated } = require("../utils/notificationHelper");
const IgnoredJob = require("../models/IgnoredJob");
const Platform = require("../models/Platform");
const { Sequelize, Op } = require("sequelize");
const Logs = require("../models/Logs");
const WeeklyTarget = require("../models/WeeklyTargets.js");
const { fn, col, literal } = require("sequelize");

const getAllUsers = async (req, res) => {
  const { search } = req.query;

  try {
    const whereClause = {
      role: { [Op.ne]: "admin" }, // 👈 exclude admins
    };
    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.count({
      where: {
        role: { [Op.ne]: "admin" }, // exclude admin users
      },
    });

    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error("Error fetching user count:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getJobCount = async (req, res) => {
  try {
    const totalJobs = await Job.count();
    res.status(200).json({ totalJobs });
  } catch (error) {
    console.error("Error fetching job count:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAppliedJobsCount = async (req, res) => {
  try {
    const totalAppliedJobs = await AppliedJob.count();
    res.status(200).json({ totalAppliedJobs });
  } catch (error) {
    console.error("Error fetching job count:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getTopTechnologies = async (req, res) => {
  try {
    const result = await UserTechnology.findAll({
      attributes: [
        "technologyId",
        [sequelize.fn("COUNT", sequelize.col("userId")), "userCount"],
      ],
      where: { is_active: 1 },
      include: [
        {
          model: Technology,
          as: "technology", // must match association alias
          attributes: ["name"],
        },
      ],
      group: ["technologyId", "technology.id"], // lowercase alias here
      order: [[sequelize.literal("userCount"), "DESC"]],
      limit: 10,
    });

    // Format for frontend
    const formatted = result.map((entry) => ({
      technology: entry.technology.name,
      userCount: entry.get("userCount"),
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load top technologies" });
  }
};
const getScrapeLogSummary = async (req, res) => {
  try {
    const logs = await ScrapeLog.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("scrapedAt")), "date"],
        [Sequelize.fn("SUM", Sequelize.col("jobCount")), "totalJobs"],
      ],
      group: [Sequelize.fn("DATE", Sequelize.col("scrapedAt"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("scrapedAt")), "ASC"]],
      raw: true,
    });

    res.status(200).json(logs);
  } catch (err) {
    console.error("Error fetching scrape log summary:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};
const getUserActivityDetails = async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = { role: { [Op.ne]: "admin" } };
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
        "id",
        "firstname",
        "lastname",
        "email",
        "joinDate",
        "lastActive",
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id
      )`),
          "appliedJobsCount",
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM ignored_jobs AS ij
        WHERE ij.userId = User.id
      )`),
          "ignoredJobsCount",
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM hired_jobs AS ij
        WHERE ij.bidderId = User.id
      )`),
          "hiredJobsCount",
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id AND aj.stage = 'replied'
      )`),
          "repliedJobsCount",
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id AND aj.stage = 'interview'
      )`),
          "interviewedJobsCount",
        ],
        [
          Sequelize.literal(`(
        SELECT COUNT(*)
        FROM applied_jobs AS aj
        WHERE aj.userId = User.id AND aj.stage = 'not-hired'
      )`),
          "notHiredJobsCount",
        ],
      ],
      include: [
        {
          model: Technology,
          as: "technologies",
          through: { attributes: [] },
          attributes: ["name"],
        },
      ],
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.firstname,
      email: u.email,
      joinDate: u.joinDate,
      lastActive: u.lastActive,
      appliedJobs: u.getDataValue("appliedJobsCount"),
      ignoredJobs: u.getDataValue("ignoredJobsCount"),
      hiredJobs: u.getDataValue("hiredJobsCount"),
      repliedJobs: u.getDataValue("repliedJobsCount"),
      interviewedJobs: u.getDataValue("interviewedJobsCount"),
      notHiredJobs: u.getDataValue("notHiredJobsCount"),
      activeTechnologies: u.technologies.map((t) => t.name),
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching users with stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const toggleUserStatus = async (req, res) => {
  const userId = req.params.id;

  const { status } = req.body; // 'active' or 'blocked'
  console.log(req.params, "params");
  console.log(userId, "userId");
  if (!["active", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const user = await User.findByPk(userId);
    console.log(user, "user controller");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    // ---------------------------------------
    // SEND NOTIFICATION
    // ---------------------------------------
    try {
      const io = req.app.get('io');
      const admin = req.user; // Admin who made the change

      if (io && user) {
        const adminName = admin ? `${admin.firstname} ${admin.lastname}` : 'Admin';

        if (status === 'blocked') {
          await notifyUserBlocked(io, userId, adminName);
        } else if (status === 'active') {
          await notifyUserActivated(io, userId, adminName);
        }
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the request if notification fails
    }

    res.json({ message: `User ${status} successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const userLogs = async (req, res) => {
  console.log("Fetching user logs...");
  try {
    const userId = req.params.id;
    const { date, startDate, endDate } = req.query; // support both single date & range
    const whereClause = { changedByUserId: userId };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.createdAt = { [Op.between]: [startOfDay, endOfDay] };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt = { [Op.between]: [start, end] };
    }

    const logs = await Logs.findAll({
      where: whereClause,
      include: [
        {
          model: AppliedJob,
          as: "appliedJob",
          attributes: ["id", "profileId", "manual_job_title"],
          include: [
            {
              model: Profiles,
              as: "profile",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user logs." });
  }
};
const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.findAll(); // Fetch all records
    res.status(200).json(platforms); // Send response
  } catch (error) {
    console.error("Error fetching platforms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getJobStats = async (req, res) => {
  try {
    const { platform, profileId, userId, startDate, endDate } = req.query;
    const whereClause = {};

    const { Op, fn, col } = require("sequelize");

    // ---------------------------
    // APPLY FILTERS
    // ---------------------------
    if (platform) {
      whereClause.platformId = {
        [Op.in]: platform.split(",").map(Number),
      };
    }

    if (profileId) whereClause.profileId = Number(profileId);

    if (userId) {
      whereClause.userId = {
        [Op.in]: userId.split(",").map(Number),
      };
    }

    // ⭐ FIXED DATE FILTER ⭐
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      whereClause[Op.and] = [
        {
          [Op.or]: [
            { applied_at: { [Op.between]: [start, end] } },
            { replyDate: { [Op.between]: [start, end] } },
            { interviewDate: { [Op.between]: [start, end] } },
          ],
        },
      ];
    }

    // ------------------------------
    // Fetch metadata
    // ------------------------------
    const [platforms, users, profiles] = await Promise.all([
      Platform.findAll({
        attributes: ["id", "name", "connect_cost_usd", "connect_cost_inr"],
      }),
      User.findAll({
        attributes: ["id", "firstname"],
      }),
      Profiles.findAll({
        attributes: ["id", "name"],
      }),
    ]);

    const platformById = {};
    const userById = {};
    const profileById = {};

    platforms.forEach((p) => (platformById[p.id] = p));
    users.forEach((u) => (userById[u.id] = u.firstname));
    profiles.forEach((p) => (profileById[p.id] = p.name));

    // ------------------------------
    // Aggregated queries
    // ------------------------------
    const platformAgg = await AppliedJob.findAll({
      attributes: [
        "platformId",
        [fn("SUM", col("connects_used")), "connects"],
        [fn("COUNT", col("id")), "applied"],
      ],
      where: whereClause,
      group: ["platformId"],
      raw: true,
    });

    const userAgg = await AppliedJob.findAll({
      attributes: [
        "userId",
        [fn("SUM", col("connects_used")), "connects"],
        [fn("COUNT", col("id")), "applied"],
      ],
      where: whereClause,
      group: ["userId"],
      raw: true,
    });

    const profileAgg = await AppliedJob.findAll({
      attributes: [
        "profileId",
        [fn("SUM", col("connects_used")), "connects"],
        [fn("COUNT", col("id")), "applied"],
      ],
      where: whereClause,
      group: ["profileId"],
      raw: true,
    });

    const userPlatformAgg = await AppliedJob.findAll({
      attributes: [
        "userId",
        "platformId",
        [fn("SUM", col("connects_used")), "connects"],
      ],
      where: whereClause,
      group: ["userId", "platformId"],
      raw: true,
    });

    const profilePlatformAgg = await AppliedJob.findAll({
      attributes: [
        "profileId",
        "platformId",
        [fn("SUM", col("connects_used")), "connects"],
      ],
      where: whereClause,
      group: ["profileId", "platformId"],
      raw: true,
    });

    const stageAgg = await AppliedJob.findAll({
      attributes: ["stage", [fn("COUNT", col("id")), "count"]],
      where: whereClause,
      group: ["stage"],
      raw: true,
    });

    // ------------------------------
    // replied/interview - platform & profile
    // ------------------------------
    const repliedInterviewPlatformAgg = await AppliedJob.findAll({
      attributes: ["platformId", "stage", [fn("COUNT", col("id")), "count"]],
      where: { ...whereClause, stage: { [Op.in]: ["replied", "interview"] } },
      group: ["platformId", "stage"],
      raw: true,
    });

    const repliedInterviewProfileAgg = await AppliedJob.findAll({
      attributes: ["profileId", "stage", [fn("COUNT", col("id")), "count"]],
      where: { ...whereClause, stage: { [Op.in]: ["replied", "interview"] } },
      group: ["profileId", "stage"],
      raw: true,
    });

    // ------------------------------
    // replied/interview - user wise
    // ------------------------------
    const repliedInterviewUserAgg = await AppliedJob.findAll({
      attributes: ["userId", "stage", [fn("COUNT", col("id")), "count"]],
      where: { ...whereClause, stage: { [Op.in]: ["replied", "interview"] } },
      group: ["userId", "stage"],
      raw: true,
    });

    // ------------------------------
    // Totals
    // ------------------------------
    const [
      totalAppliedJobsRes,
      totalConnectsUsedRes,
      totalHiredJobsRes,
      totalHiredBudgetRes,
    ] = await Promise.all([
      AppliedJob.count({ where: whereClause }),
      AppliedJob.sum("connects_used", { where: whereClause }),
      HiredJob.count({
        include: [{ model: AppliedJob, as: "appliedJobDetails", required: true, where: whereClause, attributes: [] }],
        subQuery: false,
      }),
      HiredJob.sum("budgetAmount", {
        include: [{ model: AppliedJob, as: "appliedJobDetails", required: true, where: whereClause, attributes: [] }],
        subQuery: false,
      }),
    ]);

    const totalAppliedJobs = totalAppliedJobsRes || 0;
    const totalConnectsUsed = totalConnectsUsedRes || 0;
    const totalHiredJobs = totalHiredJobsRes || 0;
    const totalHiredBudget = Number(totalHiredBudgetRes || 0);

    // ------------------------------
    // PLATFORM BREAKDOWNS
    // ------------------------------
    const connectsBreakdown = {};
    const costBreakdown = {};
    const appliedJobsBreakdown = {};

    // HIRED breakdowns
    const hiredPlatformWise = {};
    const hiredUserWise = {};
    const hiredProfileWise = {};
    // ------------------------------
    // HIRED JOBS BREAKDOWNS
    // ------------------------------
    const hiredPlatformAgg = await HiredJob.findAll({
      attributes: [
        [col("appliedJobDetails.platformId"), "platformId"],
        [fn("COUNT", col("HiredJob.id")), "count"],
      ],
      include: [
        {
          model: AppliedJob,
          as: "appliedJobDetails",
          required: true,
          where: whereClause,
          attributes: [],
        },
      ],
      group: [col("appliedJobDetails.platformId")],
      subQuery: false,
      raw: true,
    });

    const hiredUserAgg = await HiredJob.findAll({
      attributes: [
        [col("appliedJobDetails.userId"), "userId"],
        [fn("COUNT", col("HiredJob.id")), "count"],
      ],
      include: [
        {
          model: AppliedJob,
          as: "appliedJobDetails",
          required: true,
          where: whereClause,
          attributes: [],
        },
      ],
      group: [col("appliedJobDetails.userId")],
      subQuery: false,
      raw: true,
    });

    const hiredProfileAgg = await HiredJob.findAll({
      attributes: [
        [col("appliedJobDetails.profileId"), "profileId"],
        [fn("COUNT", col("HiredJob.id")), "count"],
      ],
      include: [
        {
          model: AppliedJob,
          as: "appliedJobDetails",
          required: true,
          where: whereClause,
          attributes: [],
        },
      ],
      group: [col("appliedJobDetails.profileId")],
      subQuery: false,
      raw: true,
    });

    platforms.forEach((p) => {
      connectsBreakdown[p.name] = 0;
      costBreakdown[p.name] = 0;
      appliedJobsBreakdown[p.name] = 0;
    });

    platformAgg.forEach((row) => {
      const pid = row.platformId;
      const p = platformById[pid];
      if (!p) return;

      connectsBreakdown[p.name] = Number(row.connects || 0);
      costBreakdown[p.name] = Number(
        (row.connects * (p.connect_cost_usd || 0)).toFixed(2)
      );
      appliedJobsBreakdown[p.name] = Number(row.applied || 0);
    });

    // ------------------------------
    // USER BREAKDOWNS
    // ------------------------------
    const appliedUserWise = {};
    const connectsUserWise = {};
    const costUserWise = {};

    users.forEach((u) => {
      appliedUserWise[u.firstname] = 0;
      connectsUserWise[u.firstname] = 0;
      costUserWise[u.firstname] = 0;
    });

    userAgg.forEach((row) => {
      const name = userById[row.userId];
      appliedUserWise[name] = Number(row.applied || 0);
      connectsUserWise[name] = Number(row.connects || 0);
    });

    userPlatformAgg.forEach((row) => {
      const name = userById[row.userId];
      const p = platformById[row.platformId];
      costUserWise[name] +=
        Number(row.connects || 0) * (p?.connect_cost_usd || 0);
    });

    Object.keys(costUserWise).forEach(
      (k) => (costUserWise[k] = Number(costUserWise[k].toFixed(2)))
    );

    // ------------------------------
    // PROFILE BREAKDOWNS
    // ------------------------------
    const appliedProfileWise = {};
    const connectsProfileWise = {};
    const costProfileWise = {};

    profiles.forEach((p) => {
      appliedProfileWise[p.name] = 0;
      connectsProfileWise[p.name] = 0;
      costProfileWise[p.name] = 0;
    });

    profileAgg.forEach((row) => {
      const name = profileById[row.profileId];
      appliedProfileWise[name] = Number(row.applied || 0);
      connectsProfileWise[name] = Number(row.connects || 0);
    });

    profilePlatformAgg.forEach((row) => {
      const name = profileById[row.profileId];
      const p = platformById[row.platformId];
      costProfileWise[name] +=
        Number(row.connects || 0) * (p?.connect_cost_usd || 0);
    });

    Object.keys(costProfileWise).forEach(
      (k) => (costProfileWise[k] = Number(costProfileWise[k].toFixed(2)))
    );

    // ------------------------------
    // STAGE COUNTS
    // ------------------------------
    const stageCounts = {};
    stageAgg.forEach((s) => {
      stageCounts[s.stage] = Number(s.count || 0);
    });

    const totalReplied = stageCounts["replied"] || 0;
    const totalInterviewed = stageCounts["interview"] || 0;
    const totalNotHired = stageCounts["not-hired"] || 0;

    // ------------------------------
    // PLATFORM → replied/interview
    // ------------------------------
    const repliedPlatformWise = {};
    const interviewPlatformWise = {};

    platforms.forEach((p) => {
      repliedPlatformWise[p.name] = 0;
      interviewPlatformWise[p.name] = 0;
    });

    repliedInterviewPlatformAgg.forEach((row) => {
      const p = platformById[row.platformId];
      if (!p) return;

      if (row.stage === "replied")
        repliedPlatformWise[p.name] = Number(row.count);

      if (row.stage === "interview")
        interviewPlatformWise[p.name] = Number(row.count);
    });
    platforms.forEach((p) => {
      hiredPlatformWise[p.name] = 0;
    });
    hiredPlatformAgg.forEach((row) => {
      const p = platformById[row.platformId];
      if (p) hiredPlatformWise[p.name] = Number(row.count || 0);
    });

    // ------------------------------
    // HIRED USER WISE
    // ------------------------------
    users.forEach((u) => {
      hiredUserWise[u.firstname] = 0;
    });
    hiredUserAgg.forEach((row) => {
      const name = userById[row.userId];
      if (name) hiredUserWise[name] = Number(row.count || 0);
    });

    // ------------------------------
    // HIRED PROFILE WISE
    // ------------------------------
    profiles.forEach((p) => {
      hiredProfileWise[p.name] = 0;
    });
    hiredProfileAgg.forEach((row) => {
      const prof = profileById[row.profileId];
      if (prof) hiredProfileWise[prof] = Number(row.count || 0);
    });
    // ------------------------------
    // PROFILE → replied/interview
    // ------------------------------
    const repliedProfileWise = {};
    const interviewProfileWise = {};

    profiles.forEach((p) => {
      repliedProfileWise[p.name] = 0;
      interviewProfileWise[p.name] = 0;
    });

    repliedInterviewProfileAgg.forEach((row) => {
      const prof = profileById[row.profileId];
      if (!prof) return;

      if (row.stage === "replied") repliedProfileWise[prof] = Number(row.count);

      if (row.stage === "interview")
        interviewProfileWise[prof] = Number(row.count);
    });

    // ------------------------------
    // USER → replied/interview
    // ------------------------------
    const repliedUserWise = {};
    const interviewUserWise = {};

    users.forEach((u) => {
      repliedUserWise[u.firstname] = 0;
      interviewUserWise[u.firstname] = 0;
    });

    repliedInterviewUserAgg.forEach((row) => {
      const user = userById[row.userId];
      if (!user) return;

      if (row.stage === "replied") repliedUserWise[user] = Number(row.count);

      if (row.stage === "interview")
        interviewUserWise[user] = Number(row.count);
    });

    // -----------------------------------------------------
    // ⭐⭐⭐ WEEKLY TARGET FIXED LOGIC ⭐⭐⭐
    // -----------------------------------------------------
    let weeklyTarget = {
      target_amount: 0,
      achieved_amount: 0,
      remaining: 0,
      percentage: 0,
    };

    let weeklyTargetUserWise = {};
    const weeklyWhere = {};

    if (userId) {
      weeklyWhere.userId = { [Op.in]: userId.split(",").map(Number) };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      // ⭐ FIXED: Only return the weekly target that covers the date range
      weeklyWhere[Op.and] = [
        { week_start: { [Op.lte]: start } },
        { week_end: { [Op.gte]: end } },
      ];
    }

    const targets = await WeeklyTarget.findAll({
      where: weeklyWhere,
      raw: true,
    });

    if (targets && targets.length > 0) {
      const totalTarget = targets.reduce(
        (acc, t) => acc + (t.target_amount || 0),
        0
      );
      const totalAchieved = targets.reduce(
        (acc, t) => acc + (t.achieved_amount || 0),
        0
      );

      weeklyTarget = {
        target_amount: totalTarget,
        achieved_amount: totalAchieved,
        remaining: totalTarget - totalAchieved,
        percentage: totalTarget
          ? Number(((totalAchieved / totalTarget) * 100).toFixed(2))
          : 0,
      };

      targets.forEach((t) => {
        const name = userById[t.userId] || `user_${t.userId}`;
        const targetAmt = t.target_amount || 0;
        const achievedAmt = t.achieved_amount || 0;

        weeklyTargetUserWise[name] = {
          target: targetAmt,
          achieved: achievedAmt,
          remaining: targetAmt - achievedAmt,
          percentage: targetAmt
            ? Number(((achievedAmt / targetAmt) * 100).toFixed(2))
            : 0,
        };
      });
    }

    // ------------------------------
    // Summaries
    // ------------------------------
    const totalConnectsCostUSD = Object.values(costBreakdown).reduce(
      (a, b) => a + (b || 0),
      0
    );

    let totalConnectsCostINR = 0;
    for (const pfName of Object.keys(connectsBreakdown)) {
      const used = connectsBreakdown[pfName] || 0;
      const plat = platforms.find((p) => p.name === pfName);
      const inr = plat?.connect_cost_inr || 0;
      totalConnectsCostINR += used * inr;
    }
    totalConnectsCostINR = Number(totalConnectsCostINR.toFixed(2));

    // ------------------------------
    // RESULT
    // ------------------------------
    return res.json({
      summary: {
        totalAppliedJobs,
        totalConnectsUsed,
        totalConnectsCostUSD: totalConnectsCostUSD,
        totalConnectsCostINR,
        appliedJobsBreakdown,
        connectsBreakdown,
        costBreakdown,

        appliedUserWise,
        connectsUserWise,
        costUserWise,

        appliedProfileWise,
        connectsProfileWise,
        costProfileWise,

        totalReplied,
        totalInterviewed,
        totalNotHired,
        totalHiredJobs,
        totalHiredBudget,

        repliedPlatformWise,
        interviewPlatformWise,
        repliedProfileWise,
        interviewProfileWise,
        repliedUserWise,
        interviewUserWise,

        weeklyTarget,
        weeklyTargetUserWise,
        hiredPlatformWise,
        hiredUserWise,
        hiredProfileWise,
      },
    });
  } catch (error) {
    console.error("❌ Error in getJobStats:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message || error });
  }
};


module.exports = {
  getAllUsers,
  getUserCount,
  getJobCount,
  getAppliedJobsCount,
  getTopTechnologies,
  getScrapeLogSummary,
  getUserActivityDetails,
  toggleUserStatus,
  userLogs,
  getPlatforms,
  getJobStats,
};
