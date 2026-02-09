const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const HiredJob = require("../models/HiredJobs.js");
const Job = require("../models/Job");
const Developer = require("../models/Developer");
const AppliedJob = require("../models/Applyjob.js");
const { notifyJobHired } = require("../utils/notificationHelper");
const User = require("../models/User");
const markHiredJob = async (req, res) => {
  try {
    const {
      jobId,
      bidderId,
      developerId,
      hiredAt,
      notes,
      budgetType,
      budgetAmount,
      clientName,
      profileName,
      hiredDate,
    } = req.body;

    // Required validations
    if (
      !jobId ||
      !bidderId ||
      !developerId ||
      !hiredAt ||
      !budgetType ||
      !budgetAmount ||
      !clientName ||
      !profileName
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find the applied job to get its numeric ID
    const appliedJob = await AppliedJob.findOne({ where: { jobId } });
    if (!appliedJob) {
      return res.status(404).json({ message: "Applied job not found." });
    }

    // Check if already hired using the applied job's ID
    const existing = await HiredJob.findOne({ where: { jobId: appliedJob.id } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "This job has already been marked as hired." });
    }

    // Create hired record with the applied job's numeric ID
    const hiredJob = await HiredJob.create({
      jobId: appliedJob.id, // Store the applied job's ID, not the string jobId
      bidderId,
      developerId,
      hiredAt,
      notes: notes || null,
      budgetType,
      budgetAmount,
      clientName,
      profileName,
      hiredDate,
    });

    // ⭐ DO NOT REMOVE FROM applied_jobs
    // ❗ Instead, update stage to 'hired'
    await AppliedJob.update(
      {
        stage: "hired",
        hiredDate: hiredDate,
      },
      { where: { jobId } }
    );

    // Optional: update jobs table (if needed)
    await Job.update({ hiredJobs: 1 }, { where: { jobId } });

    // ---------------------------------------
    // SEND NOTIFICATION
    // ---------------------------------------
    try {
      const io = req.app.get("io");
      const job = await Job.findOne({ where: { jobId } });
      const user = await User.findByPk(bidderId);

      if (io && user) {
        await notifyJobHired(io, bidderId, {
          jobId,
          jobTitle: job?.title || "the job",
          clientName,
          budget: budgetAmount,
          userName: `${user.firstname} ${user.lastname}`,
        });
      }
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      message: "Job successfully marked as hired.",
      hiredJob,
    });
  } catch (error) {
    console.error("Error marking job as hired:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getHiredJobs = async (req, res) => {
  try {
    const { bidderId } = req.params;
    const { date, startDate, endDate, page = 1, limit = 6 } = req.query; // default 6 per page

    if (!bidderId) {
      return res
        .status(400)
        .json({ message: "Missing bidderId in request params." });
    }

    const whereClause = { bidderId };

    // Handle single date filter (exact date match)
    if (date) {
      const formattedDate = new Date(date).toISOString().split("T")[0]; // 'YYYY-MM-DD'
      whereClause[Op.and] = [
        sequelize.where(
          sequelize.fn("DATE", sequelize.col("hired_at")),
          formattedDate
        ),
      ];
    }

    // Handle date range filter
    if (startDate && endDate) {
      // Parse dates and ensure proper timezone handling
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set start to beginning of day (00:00:00.000)
      start.setHours(0, 0, 0, 0);

      // Set end to end of day (23:59:59.999)
      end.setHours(23, 59, 59, 999);

      console.log(`Hired Jobs Date Filter: ${start.toISOString()} to ${end.toISOString()}`);

      whereClause.hiredAt = {
        [Op.gte]: start,
        [Op.lte]: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereClause.hiredAt = { [Op.gte]: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.hiredAt = { [Op.lte]: end };
    }

    const offset = (page - 1) * limit;

    const { rows: hiredJobs, count } = await HiredJob.findAndCountAll({
      where: whereClause,
      include: [
        { model: Job, as: "jobDetails" },
        { model: Developer, as: "developerDetails" },
        {
          model: AppliedJob,
          as: "appliedJobDetails",
          attributes: [
            "manualJobTitle",
            "manualJobDescription",
            "manualJobUrl",
            "attachments",
            "technologies",
          ],
          required: false, // LEFT JOIN
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      hiredJobs,
      totalPages,
      totalCount: count // Total number of hired jobs
    });
  } catch (error) {
    console.error("Error fetching hired jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  markHiredJob,
  getHiredJobs,
};
