const { Op, Sequelize } = require("sequelize");
const AppliedJob = require("../models/Applyjob.js");
const Job = require("../models/Job");
const IgnoredJob = require("../models/IgnoredJob");
const profiles = require("../models/Profiles");
const Logs = require("../models/Logs");
const Profile = require("../models/Profiles.js");
const fs = require("fs");
const path = require("path");
const {
  notifyJobApplied,
  notifyJobReplied,
  notifyJobInterviewed,
  notifyJobNotHired,
} = require("../utils/notificationHelper");
const User = require("../models/User");
const Platform = require("../models/Platform");

exports.applyToJob = async (req, res) => {
  try {
    const {
      userId,
      jobId: originalJobId,
      jobTitle,
      jobDescription,
      upworkJobUrl,
      bidderName,
      profileId,
      technologies,
      connectsUsed,
      proposalLink,
      platformId,
      submitted,
      appliedAt,
    } = req.body;
    console.log(req.body, "here");

    // Handle file attachments - store only URLs
    const attachments = req.files
      ? req.files.map((file) => `/api/jobs/attachments/${file.filename}`)
      : [];

    // Parse technologies if it's a JSON string (from FormData)
    let parsedTechnologies = technologies;
    if (typeof technologies === "string") {
      try {
        parsedTechnologies = JSON.parse(technologies);
      } catch (e) {
        parsedTechnologies = technologies;
      }
    }

    // ---------------------------------------
    // Validate profile
    // ---------------------------------------
    const profile = await Profile.findOne({ where: { id: profileId } });
    if (!profile) {
      return res.status(400).json({ message: "Invalid profile selected" });
    }

    // For manual jobs, generate jobId
    const jobId = originalJobId || `manual-${userId}-${Date.now()}`;

    // ---------------------------------------
    // Check duplicate application
    // ---------------------------------------
    
    const alreadyApplied = await AppliedJob.findOne({
      where: { userId, jobId, profileId },
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "Already applied to this job with this profile",
      });
    }
    const appliedJob = await AppliedJob.create({
      userId,
      jobId,
      bidderName,
      profileId,
      technologies: parsedTechnologies,
      connectsUsed,
      proposalLink,
      submitted,
      appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
      platformId: platformId ? Number(platformId) : null,
      manualJobTitle: jobTitle || null,
      manualJobDescription: jobDescription || null,
      manualJobUrl: upworkJobUrl || null,
      attachments: attachments,
    });
    console.log(appliedJob, "appliedJob");
    // ---------------------------------------
    // UPDATE JOB TABLE
    // ---------------------------------------
    if (originalJobId) {
      const job = await Job.findOne({ where: { jobId: originalJobId } });

      if (job) {
        job.appliedJobs = true;

        if (!job.jobUrl && upworkJobUrl) {
          job.jobUrl = upworkJobUrl;
        }

        const ignored = await IgnoredJob.findOne({
          where: { userId, jobId: originalJobId },
        });

        if (ignored) {
          await ignored.destroy();
          job.ignoredJobs = false;
        }

        await job.save();
      }
    } else {
      await Job.create({
        jobId,
        title: jobTitle,
        description: jobDescription,
        jobUrl: upworkJobUrl,
        link: upworkJobUrl,
        userId,
        source: "manual",
        appliedJobs: true,
        ignoredJobs: false,
      });
    }

    // ---------------------------------------
    // SEND NOTIFICATION
    // ---------------------------------------
    try {
      const io = req.app.get("io");
      const user = await User.findByPk(userId);
      const platform = await Platform.findByPk(platformId);

      if (io && user) {
        await notifyJobApplied(io, userId, {
          jobId,
          title: jobTitle || "a job",
          platform: platform?.name || "Unknown Platform",
          connectsUsed,
          userName: `${user.firstname} ${user.lastname}`,
        });
      }
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the request if notification fails
    }

    return res.status(201).json({
      message: "Applied job saved!",
      job: appliedJob,
    });
  } catch (error) {2
    console.error("Error in applyToJob:", error);
    res.status(500).json({ message: "Error saving applied job" });
  }
};
exports.getAppliedJobs = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      tech,
      rating,
      date,
      startDate,
      endDate,
      page = 1,
      limit = 5,
      searchTerm,
      title,
      stage,
    } = req.query;
    const keyword = searchTerm || title;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let jobWhereCondition = {};
    if (rating) {
      jobWhereCondition.rating = { [Op.gte]: parseFloat(rating) };
    }

    // Handle job tech filter
    if (tech) {
      const techArray = Array.isArray(tech) ? tech : [tech];
      jobWhereCondition[Op.or] = techArray.map((t) => ({
        [Op.or]: [
          { selectedTech: t },
          Sequelize.where(
            Sequelize.fn("JSON_CONTAINS", Sequelize.col("techStack"), `"${t}"`),
            1
          ),
        ],
      }));
    }

    // Main AppliedJob filter
    let appliedJobWhere = { userId };
    if (stage) {
      appliedJobWhere.stage = stage;
    }
    // Handle single date filter
    if (date) {
      const formattedDate = new Date(date).toISOString().split("T")[0]; // 'YYYY-MM-DD'
      appliedJobWhere = {
        ...appliedJobWhere,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("DATE", Sequelize.col("applied_at")),
            formattedDate
          ),
        ],
      };
    }
    // Handle date range
    if (startDate && endDate) {
      // Parse dates - handle both date strings and ISO formats
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set start to beginning of day (00:00:00.000)
      start.setHours(0, 0, 0, 0);

      // Set end to end of day (23:59:59.999)
      end.setHours(23, 59, 59, 999);

      console.log(`Date Filter: ${start.toISOString()} to ${end.toISOString()}`);

      appliedJobWhere.appliedAt = {
        [Op.gte]: start,
        [Op.lte]: end,
      };
    }

    // Handle search
    if (keyword) {
      appliedJobWhere[Op.or] = [
        { manualJobTitle: { [Op.like]: `%${keyword}%` } },
        Sequelize.literal(`Job.title LIKE '%${keyword}%'`),
      ];
    }

    // Count total matching records
    const totalCount = await AppliedJob.count({
      where: appliedJobWhere,
      include: [
        {
          model: Job,
          where: jobWhereCondition,
          required: false,
        },
        {
          model: profiles,
          as: "profile",
          attributes: ["id", "name"], // Adjust attributes as needed
        },
      ],
    });

    // Get paginated results
    const appliedJobs = await AppliedJob.findAll({
      where: appliedJobWhere,
      include: [
        {
          model: Job,
          where: jobWhereCondition,
          required: false,
        },
        {
          model: profiles,
          as: "profile",
          attributes: ["id", "name"], // Adjust attributes as needed
        },
      ],
      order: [["created_at", "DESC"]],
      offset,
      limit: parseInt(limit),
    });

    res.status(200).json({
      jobs: appliedJobs,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching applied jobs" });
  }
};
exports.editAppliedJob = async (req, res) => {
  try {
    const id = req.params.jobId;
    const userId = req.user.id;

    const { appliedAt, platformId, existingAttachments, ...updatedFields } =
      req.body;

    if (platformId !== undefined) {
      updatedFields.platformId = platformId;
    }

    // Handle new file attachments - store only URLs
    const newAttachments = req.files
      ? req.files.map((file) => `/api/jobs/attachments/${file.filename}`)
      : [];

    // Merge existing attachments with new ones
    const existingFiles = existingAttachments
      ? JSON.parse(existingAttachments)
      : [];
    updatedFields.attachments = [...existingFiles, ...newAttachments];

  

    // Fetch existing job
    const appliedJob = await AppliedJob.findOne({
      where: { id, userId },
      include: [
        {
          model: require("../models/Profiles.js"),
          as: "profile",
          attributes: ["name"],
        },
      ],
    });

    if (!appliedJob) {
      return res.status(404).json({ message: "Applied job not found" });
    }

    // CLEANUP: remove files that existed previously but were removed by the user.
    try {
      const oldAttachments = Array.isArray(appliedJob.attachments)
        ? appliedJob.attachments
        : appliedJob.attachments
        ? JSON.parse(appliedJob.attachments)
        : [];
      const newAttachmentsList = Array.isArray(updatedFields.attachments)
        ? updatedFields.attachments
        : updatedFields.attachments
        ? JSON.parse(updatedFields.attachments)
        : [];

      const toDelete = oldAttachments.filter(
        (oldUrl) => !newAttachmentsList.includes(oldUrl)
      );

      toDelete.forEach((fileUrl) => {
        // expected stored URL format: /api/jobs/attachments/<filename>
        const parts = fileUrl.split("/");
        const filename = parts[parts.length - 1];
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          "attachments",
          filename
        );
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err)
              console.error("Failed to delete old attachment", filePath, err);
            else console.log("Deleted old attachment", filePath);
          });
        }
      });
    } catch (cleanupErr) {
      console.error("Error during attachment cleanup:", cleanupErr);
    }

    // Convert old snapshot to plain object
    const oldData = JSON.parse(JSON.stringify(appliedJob.toJSON()));

    // Ensure technologies is parsed
    if (typeof oldData.technologies === "string") {
      try {
        oldData.technologies = JSON.parse(oldData.technologies);
      } catch {
        oldData.technologies = [];
      }
    }

    // Validate technologies array
    if (
      updatedFields.hasOwnProperty("technologies") &&
      !Array.isArray(updatedFields.technologies)
    ) {
      return res.status(400).json({ message: "Technologies must be an array" });
    }

    // Validate appliedAt date
    if (appliedAt) {
      const parsedDate = new Date(appliedAt);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid appliedAt date" });
      }
      updatedFields.appliedAt = parsedDate;
    }

    // Perform update
    await appliedJob.update(updatedFields, {
      fields: Object.keys(updatedFields),
    });

    // New snapshot
    const newData = JSON.parse(JSON.stringify(appliedJob.toJSON()));

    // Generate field-level diff
    const changes = {};
    for (const key of Object.keys(updatedFields)) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      // Compare JSON safely
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    }

    // Save log
    await Logs.create({
      appliedJobId: id,
      changedByUserId: userId,
      oldData,
      newData,
      changes, // <- only the fields that changed
      changeType: "edit",
    });

    return res.status(200).json({
      message: "Applied job updated successfully",
      appliedJob,
    });
  } catch (err) {
    console.error("Error updating applied job:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.updateStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, date, notes } = req.body; // frontend fields

    if (!stage) {
      return res.status(400).json({ message: "Stage is required" });
    }

    const job = await AppliedJob.findByPk(id, {
      include: [
        {
          model: Job,
          attributes: ["title", "jobId"],
        },
      ],
    });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const oldStage = job.stage;
    job.stage = stage;

    // Save fields based on stage
    if (stage === "replied") {
      job.replyDate = date || new Date();
      job.replyNotes = notes || null;
    } else if (stage === "interview") {
      job.interviewDate = date || new Date();
      job.interviewNotes = notes || null;
    } else if (stage === "not-hired") {
      job.notHiredDate = date || new Date();
      job.notHiredNotes = notes || null;
    }

    await job.save();

    // Send notifications if stage changed
    if (oldStage !== stage) {
      try {
        const io = req.app.get("io");
        const user = await User.findByPk(job.userId);
        const jobTitle = job.manualJobTitle || job.Job?.title || "a job";

        if (io && user) {
          const notificationData = {
            jobId: job.jobId,
            title: jobTitle,
            userName: `${user.firstname} ${user.lastname}`,
          };

          if (stage === "replied") {
            await notifyJobReplied(io, job.userId, notificationData);
          } else if (stage === "interview") {
            await notifyJobInterviewed(io, job.userId, notificationData);
          } else if (stage === "not-hired") {
            await notifyJobNotHired(io, job.userId, notificationData);
          }
        }
      } catch (notifError) {
        console.error("Error sending stage change notification:", notifError);
        // Don't fail the request if notification fails
      }
    }

    return res.status(200).json({
      message: "Stage updated successfully",
      job,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating stage" });
  }
};
