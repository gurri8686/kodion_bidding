const NotificationService = require('../services/notificationService');

/**
 * Helper functions to trigger notifications for different events
 */

// Job applied notification
const notifyJobApplied = async (io, userId, jobData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'job_applied',
    title: 'Job Application Submitted',
    message: `You successfully applied to "${jobData.title || 'a job'}" on ${jobData.platform}`,
    metadata: {
      jobId: jobData.jobId,
      platform: jobData.platform,
      connectsUsed: jobData.connectsUsed,
    },
    priority: 'low',
    actionUrl: `/applied-jobs`,
    icon: '📝',
  });

  // Notify admins
  await NotificationService.createAdminNotification(io, {
    type: 'job_applied',
    title: 'New Job Application',
    message: `${jobData.userName} applied to "${jobData.title || 'a job'}" on ${jobData.platform}`,
    metadata: { userId, jobId: jobData.jobId, platform: jobData.platform },
    priority: 'low',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '📝',
  });
};

// Job hired notification
const notifyJobHired = async (io, userId, jobData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'job_hired',
    title: '🎉 Congratulations! You Got Hired!',
    message: `You've been hired for "${jobData.jobTitle || 'the job'}" - $${jobData.budget}`,
    metadata: {
      jobId: jobData.jobId,
      clientName: jobData.clientName,
      budget: jobData.budget,
    },
    priority: 'high',
    actionUrl: `/hired-jobs`,
    icon: '🎉',
  });

  // Notify admins
  await NotificationService.createAdminNotification(io, {
    type: 'job_hired',
    title: '🎉 User Hired!',
    message: `${jobData.userName} got hired for "${jobData.jobTitle}" - $${jobData.budget}`,
    metadata: { userId, jobId: jobData.jobId, budget: jobData.budget },
    priority: 'high',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '🎉',
  });
};

// Job replied notification
const notifyJobReplied = async (io, userId, jobData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'job_replied',
    title: '💬 Client Replied!',
    message: `You got a reply for "${jobData.title || 'your application'}"`,
    metadata: { jobId: jobData.jobId, platform: jobData.platform },
    priority: 'high',
    actionUrl: `/applied-jobs`,
    icon: '💬',
  });

  // Notify admins
  await NotificationService.createAdminNotification(io, {
    type: 'job_replied',
    title: '💬 Job Status: Replied',
    message: `${jobData.userName} received a reply for "${jobData.title || 'a job'}"`,
    metadata: { userId, jobId: jobData.jobId, platform: jobData.platform },
    priority: 'medium',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '💬',
  });
};

// Job interviewed notification
const notifyJobInterviewed = async (io, userId, jobData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'job_interviewed',
    title: '🎤 Interview Scheduled!',
    message: `Interview scheduled for "${jobData.title || 'your application'}"`,
    metadata: { jobId: jobData.jobId },
    priority: 'high',
    actionUrl: `/applied-jobs`,
    icon: '🎤',
  });

  // Notify admins
  await NotificationService.createAdminNotification(io, {
    type: 'job_interviewed',
    title: '🎤 Job Status: Interview',
    message: `${jobData.userName} has an interview scheduled for "${jobData.title || 'a job'}"`,
    metadata: { userId, jobId: jobData.jobId },
    priority: 'medium',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '🎤',
  });
};

// Job not hired notification
const notifyJobNotHired = async (io, userId, jobData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'job_rejected',
    title: '😔 Not Selected',
    message: `You were not selected for "${jobData.title || 'the job'}". Keep trying!`,
    metadata: { jobId: jobData.jobId },
    priority: 'low',
    actionUrl: `/applied-jobs`,
    icon: '😔',
  });

  // Notify admins
  await NotificationService.createAdminNotification(io, {
    type: 'job_rejected',
    title: '😔 Job Status: Not Hired',
    message: `${jobData.userName} was not hired for "${jobData.title || 'a job'}"`,
    metadata: { userId, jobId: jobData.jobId },
    priority: 'low',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '😔',
  });
};

// Target set notification (when user sets a new weekly target)
const notifyTargetSet = async (io, userId, targetData) => {
  // Notify admins when user sets a new target
  await NotificationService.createAdminNotification(io, {
    type: 'target_reminder',
    title: '🎯 New Weekly Target Set',
    message: `${targetData.userName} set a new weekly target of $${targetData.targetAmount}`,
    metadata: {
      userId,
      targetAmount: targetData.targetAmount,
      weekStart: targetData.weekStart,
      weekEnd: targetData.weekEnd,
    },
    priority: 'low',
    actionUrl: `/admin/user/${userId}/progress`,
    icon: '🎯',
  });
};

// Target updated notification (when user updates existing target)
const notifyTargetUpdated = async (io, userId, targetData) => {
  // Notify admins when user updates their target
  await NotificationService.createAdminNotification(io, {
    type: 'target_reminder',
    title: '🎯 Weekly Target Updated',
    message: `${targetData.userName} updated their weekly target to $${targetData.targetAmount}`,
    metadata: {
      userId,
      targetAmount: targetData.targetAmount,
      oldAmount: targetData.oldAmount,
      weekStart: targetData.weekStart,
      weekEnd: targetData.weekEnd,
    },
    priority: 'low',
    actionUrl: `/admin/user/${userId}/progress`,
    icon: '🎯',
  });
};

// Target achieved notification
const notifyTargetAchieved = async (io, userId, targetData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'target_achieved',
    title: '🎯 Weekly Target Achieved!',
    message: `Congratulations! You've achieved your weekly target of $${targetData.targetAmount}`,
    metadata: {
      targetAmount: targetData.targetAmount,
      achievedAmount: targetData.achievedAmount
    },
    priority: 'high',
    actionUrl: `/progress-tracker`,
    icon: '🎯',
  });

  // Notify admins
  await NotificationService.createAdminNotification(io, {
    type: 'target_achieved',
    title: '🎯 Target Achieved!',
    message: `${targetData.userName} achieved their weekly target of $${targetData.targetAmount}!`,
    metadata: {
      userId,
      targetAmount: targetData.targetAmount,
      achievedAmount: targetData.achievedAmount,
    },
    priority: 'medium',
    actionUrl: `/admin/user/${userId}/progress`,
    icon: '🎯',
  });
};

// Connects low notification
const notifyConnectsLow = async (io, userId, connectsData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'connects_low',
    title: '⚠️ Low Connects Balance',
    message: `You have only ${connectsData.remaining} connects left on ${connectsData.platform}`,
    metadata: { platform: connectsData.platform, remaining: connectsData.remaining },
    priority: 'medium',
    actionUrl: `/connects`,
    icon: '⚠️',
  });
};

// New matching job notification
const notifyNewJobMatch = async (io, userId, jobData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'new_job_match',
    title: '🔍 New Matching Job Found!',
    message: `A new job matching your skills: "${jobData.title}"`,
    metadata: { jobId: jobData.jobId, matchScore: jobData.matchScore },
    priority: 'medium',
    actionUrl: `/jobs`,
    icon: '🔍',
  });
};

// User blocked notification
const notifyUserBlocked = async (io, userId, adminName) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'user_blocked',
    title: '🚫 Account Blocked',
    message: `Your account has been blocked by ${adminName}. Please contact support.`,
    metadata: { blockedBy: adminName },
    priority: 'urgent',
    icon: '🚫',
  });
};

// User activated notification
const notifyUserActivated = async (io, userId, adminName) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'user_activated',
    title: '✅ Account Activated',
    message: `Your account has been activated by ${adminName}. Welcome back!`,
    metadata: { activatedBy: adminName },
    priority: 'high',
    icon: '✅',
  });
};

// Weekly summary notification
const notifyWeeklySummary = async (io, userId, summaryData) => {
  await NotificationService.createNotification(io, {
    userId,
    type: 'weekly_summary',
    title: '📊 Weekly Summary',
    message: `Applied: ${summaryData.applied} | Hired: ${summaryData.hired} | Connects: ${summaryData.connects}`,
    metadata: summaryData,
    priority: 'low',
    actionUrl: `/dashboard`,
    icon: '📊',
  });
};

module.exports = {
  notifyJobApplied,
  notifyJobHired,
  notifyJobReplied,
  notifyJobInterviewed,
  notifyJobNotHired,
  notifyTargetSet,
  notifyTargetUpdated,
  notifyTargetAchieved,
  notifyConnectsLow,
  notifyNewJobMatch,
  notifyUserBlocked,
  notifyUserActivated,
  notifyWeeklySummary,
};
