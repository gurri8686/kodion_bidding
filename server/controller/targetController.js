const WeeklyTargets = require('../models/WeeklyTargets');
const User = require("../models/User");
const { notifyTargetSet, notifyTargetUpdated, notifyTargetAchieved } = require('../utils/notificationHelper');

exports.setWeeklyTarget = async (req, res) => {
  try {
    const { userId, week_start, week_end, target_amount, achieved_amount } = req.body;

    if (!userId || !week_start || !week_end) {
      return res.status(400).json({
        success: false,
        message: "userId, week_start, week_end are required"
      });
    }

    // Get user details for notifications
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userName = `${user.firstname} ${user.lastname}`;

    // Check existing target for that week
    const existing = await WeeklyTargets.findOne({
      where: { userId, week_start, week_end }
    });

    if (existing) {
      const oldTargetAmount = existing.target_amount;
      const oldAchievedAmount = existing.achieved_amount;

      if (target_amount != null) existing.target_amount = target_amount;
      if (achieved_amount != null) existing.achieved_amount = achieved_amount;

      await existing.save();

      // Send notifications
      try {
        const io = req.app.get('io');
        if (io) {
          // If target amount changed, notify admins
          if (target_amount != null && target_amount !== oldTargetAmount) {
            await notifyTargetUpdated(io, userId, {
              userName,
              targetAmount: target_amount,
              oldAmount: oldTargetAmount,
              weekStart: week_start,
              weekEnd: week_end,
            });
          }

          // Check if target achieved
          if (achieved_amount != null && target_amount != null &&
              achieved_amount >= target_amount && oldAchievedAmount < target_amount) {
            await notifyTargetAchieved(io, userId, {
              userName,
              targetAmount: target_amount,
              achievedAmount: achieved_amount,
            });
          }
        }
      } catch (notifError) {
        console.error('Error sending target notification:', notifError);
        // Don't fail the request if notification fails
      }

      return res.status(200).json({
        success: true,
        message: "Weekly target updated successfully",
        data: existing
      });
    }

    // Create new weekly target
    const newRecord = await WeeklyTargets.create({
      userId,
      week_start,
      week_end,
      target_amount: target_amount || 0,
      achieved_amount: achieved_amount || 0
    });

    // Send notification to admins about new target
    try {
      const io = req.app.get('io');
      if (io && target_amount > 0) {
        await notifyTargetSet(io, userId, {
          userName,
          targetAmount: target_amount,
          weekStart: week_start,
          weekEnd: week_end,
        });
      }
    } catch (notifError) {
      console.error('Error sending new target notification:', notifError);
      // Don't fail the request if notification fails
    }

    return res.status(201).json({
      success: true,
      message: "Weekly target created successfully",
      data: newRecord
    });

  } catch (error) {
    console.error("Error in setWeeklyTarget:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while setting weekly target",
      error: error.message
    });
  }
};

exports.getWeeklyTarget = async (req, res) => {
  try {
    const { userId, week_start, week_end } = req.query;

    if (!userId || !week_start || !week_end) {
      return res.status(400).json({
        success: false,
        message: "userId, week_start, week_end are required"
      });
    }

    const record = await WeeklyTargets.findOne({
      where: { userId, week_start, week_end }
    });

    return res.status(200).json({
      success: true,
      data: record || null
    });

  } catch (error) {
    console.error("Error in getWeeklyTarget:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching weekly target",
      error: error.message
    });
  }
};


