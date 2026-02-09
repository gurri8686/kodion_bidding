// controllers/connectsController.js
const User = require('../models/User')
const Profiles = require('../models/Profiles');
const ConnectsLog = require('../models/Connects'); // Assuming this is the model for connects logs
const { Op,Sequelize } = require('sequelize');
const AppliedJob = require('../models/Applyjob')
const Platforms = require('../models/Platform');

exports.getProfileConnectsUsage = async (req, res) => {
  try {
    const { date } = req.query; // Expecting format YYYY-MM-DD
    const whereClause = {};
    if (date) {
      const startOfDay = new Date(date + "T00:00:00");
      const endOfDay = new Date(date + "T23:59:59");
      whereClause.created_at = {
        [Op.between]: [startOfDay, endOfDay]
      };
    }
    const usage = await AppliedJob.findAll({
      attributes: [
        "userId",
        "profileId",
        [Sequelize.fn("SUM", Sequelize.col("AppliedJob.connects_used")), "total_connects"],
        [Sequelize.fn("COUNT", Sequelize.col("AppliedJob.id")), "total_entries"],
        [Sequelize.fn("MAX", Sequelize.col("AppliedJob.created_at")), "last_used"],
      ],
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["id", "firstname", "email"],
        },
        {
          model: Profiles,
          as: "profile",
          attributes: ["id", "name"],
        },
      ],
      group: [
        "AppliedJob.userId",
        "AppliedJob.profileId",
        "User.id",
        "profile.id",
      ],
      order: [[Sequelize.fn("MAX", Sequelize.col("AppliedJob.created_at")), "DESC"]],
    });

    res.json(usage);
  } catch (error) {
    console.error("Error fetching connects usage:", error);
    res.status(500).json({ message: "Error fetching connects usage" });
  }
};
exports.updateCost = async (req, res) => {
  try {
    const { platformId, connect_cost_usd, connect_cost_inr } = req.body;

    // Validate input
    if (!platformId) {
      return res.status(400).json({ message: "platformId is required" });
    }

    // Find platform
    const platform = await Platforms.findByPk(platformId);

    if (!platform) {
      return res.status(404).json({ message: "Platform not found" });
    }

    // Update values
    platform.connect_cost_usd = connect_cost_usd ?? platform.connect_cost_usd;
    platform.connect_cost_inr = connect_cost_inr ?? platform.connect_cost_inr;

    await platform.save();

    return res.status(200).json({
      message: "Connect cost updated successfully",
      data: platform
    });

  } catch (error) {
    console.error("Error updating connect cost:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
exports.createPlatform = async (req, res) => {
  try {
    const { platformName, connect_cost_usd, connect_cost_inr } = req.body;

    if (!platformName) {
      return res.status(400).json({ message: "Platform name is required" });
    }

    // Check if platform exists
       const exists = await Platforms.findOne({ where: { name: platformName } });
    if (exists) {
      return res.status(409).json({ message: "Platform already exists" });
    }

    const newPlatform = await Platforms.create({
        name: platformName,
      connect_cost_usd,
      connect_cost_inr,
    });

    res.status(201).json({
      message: "Platform created successfully",
      data: newPlatform,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


