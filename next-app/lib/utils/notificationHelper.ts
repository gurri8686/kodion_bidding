/**
 * Notification Helper Functions - Migrated to Next.js with Pusher
 *
 * Helper functions to trigger notifications for different events.
 * Now uses Pusher instead of Socket.IO (io parameter removed).
 */

import NotificationService from '../services/notificationService';

// ==================== Job Notifications ====================

/**
 * Notify user when they apply to a job
 */
export async function notifyJobApplied(
  userId: number,
  jobData: {
    jobId: number;
    title?: string;
    platform: string;
    connectsUsed: number;
    userName: string;
  }
): Promise<void> {
  await NotificationService.createNotification({
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
  await NotificationService.createAdminNotification({
    type: 'job_applied',
    title: 'New Job Application',
    message: `${jobData.userName} applied to "${jobData.title || 'a job'}" on ${jobData.platform}`,
    metadata: { userId, jobId: jobData.jobId, platform: jobData.platform },
    priority: 'low',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '📝',
  });
}

/**
 * Notify user when they get hired
 */
export async function notifyJobHired(
  userId: number,
  jobData: {
    jobId: number;
    jobTitle?: string;
    clientName: string;
    budget: number;
    userName: string;
  }
): Promise<void> {
  await NotificationService.createNotification({
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
  await NotificationService.createAdminNotification({
    type: 'job_hired',
    title: '🎉 User Hired!',
    message: `${jobData.userName} got hired for "${jobData.jobTitle}" - $${jobData.budget}`,
    metadata: { userId, jobId: jobData.jobId, budget: jobData.budget },
    priority: 'high',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '🎉',
  });
}

/**
 * Notify user when client replies to their application
 */
export async function notifyJobReplied(
  userId: number,
  jobData: {
    jobId: number;
    title?: string;
    platform: string;
    userName: string;
  }
): Promise<void> {
  await NotificationService.createNotification({
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
  await NotificationService.createAdminNotification({
    type: 'job_replied',
    title: '💬 Job Status: Replied',
    message: `${jobData.userName} received a reply for "${jobData.title || 'a job'}"`,
    metadata: { userId, jobId: jobData.jobId, platform: jobData.platform },
    priority: 'medium',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '💬',
  });
}

/**
 * Notify user when interview is scheduled
 */
export async function notifyJobInterviewed(
  userId: number,
  jobData: {
    jobId: number;
    title?: string;
    userName: string;
  }
): Promise<void> {
  await NotificationService.createNotification({
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
  await NotificationService.createAdminNotification({
    type: 'job_interviewed',
    title: '🎤 Job Status: Interview',
    message: `${jobData.userName} has an interview scheduled for "${jobData.title || 'a job'}"`,
    metadata: { userId, jobId: jobData.jobId },
    priority: 'medium',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '🎤',
  });
}

/**
 * Notify user when they are not selected for a job
 */
export async function notifyJobNotHired(
  userId: number,
  jobData: {
    jobId: number;
    title?: string;
    userName: string;
  }
): Promise<void> {
  await NotificationService.createNotification({
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
  await NotificationService.createAdminNotification({
    type: 'job_rejected',
    title: '😔 Job Status: Not Hired',
    message: `${jobData.userName} was not hired for "${jobData.title || 'a job'}"`,
    metadata: { userId, jobId: jobData.jobId },
    priority: 'low',
    actionUrl: `/admin/user/${userId}/jobs`,
    icon: '😔',
  });
}

// ==================== Target Notifications ====================

/**
 * Notify admins when user sets a new weekly target
 */
export async function notifyTargetSet(
  userId: number,
  targetData: {
    userName: string;
    targetAmount: number;
    weekStart: string;
    weekEnd: string;
  }
): Promise<void> {
  await NotificationService.createAdminNotification({
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
}

/**
 * Notify admins when user updates their weekly target
 */
export async function notifyTargetUpdated(
  userId: number,
  targetData: {
    userName: string;
    targetAmount: number;
    oldAmount: number;
    weekStart: string;
    weekEnd: string;
  }
): Promise<void> {
  await NotificationService.createAdminNotification({
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
}

/**
 * Notify user when they achieve their weekly target
 */
export async function notifyTargetAchieved(
  userId: number,
  targetData: {
    userName: string;
    targetAmount: number;
    achievedAmount: number;
  }
): Promise<void> {
  await NotificationService.createNotification({
    userId,
    type: 'target_achieved',
    title: '🎯 Weekly Target Achieved!',
    message: `Congratulations! You've achieved your weekly target of $${targetData.targetAmount}`,
    metadata: {
      targetAmount: targetData.targetAmount,
      achievedAmount: targetData.achievedAmount,
    },
    priority: 'high',
    actionUrl: `/progress-tracker`,
    icon: '🎯',
  });

  // Notify admins
  await NotificationService.createAdminNotification({
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
}

// ==================== System Notifications ====================

/**
 * Notify user when their connects balance is low
 */
export async function notifyConnectsLow(
  userId: number,
  connectsData: {
    platform: string;
    remaining: number;
  }
): Promise<void> {
  await NotificationService.createNotification({
    userId,
    type: 'connects_low',
    title: '⚠️ Low Connects Balance',
    message: `You have only ${connectsData.remaining} connects left on ${connectsData.platform}`,
    metadata: { platform: connectsData.platform, remaining: connectsData.remaining },
    priority: 'medium',
    actionUrl: `/connects`,
    icon: '⚠️',
  });
}

/**
 * Notify user when a new job matches their skills
 */
export async function notifyNewJobMatch(
  userId: number,
  jobData: {
    jobId: number;
    title: string;
    matchScore?: number;
  }
): Promise<void> {
  await NotificationService.createNotification({
    userId,
    type: 'new_job_match',
    title: '🔍 New Matching Job Found!',
    message: `A new job matching your skills: "${jobData.title}"`,
    metadata: { jobId: jobData.jobId, matchScore: jobData.matchScore },
    priority: 'medium',
    actionUrl: `/jobs`,
    icon: '🔍',
  });
}

/**
 * Notify user when their account is blocked by admin
 */
export async function notifyUserBlocked(
  userId: number,
  adminName: string
): Promise<void> {
  await NotificationService.createNotification({
    userId,
    type: 'user_blocked',
    title: '🚫 Account Blocked',
    message: `Your account has been blocked by ${adminName}. Please contact support.`,
    metadata: { blockedBy: adminName },
    priority: 'urgent',
    icon: '🚫',
  });
}

/**
 * Notify user when their account is activated by admin
 */
export async function notifyUserActivated(
  userId: number,
  adminName: string
): Promise<void> {
  await NotificationService.createNotification({
    userId,
    type: 'user_activated',
    title: '✅ Account Activated',
    message: `Your account has been activated by ${adminName}. Welcome back!`,
    metadata: { activatedBy: adminName },
    priority: 'high',
    icon: '✅',
  });
}

/**
 * Send weekly summary notification to user
 */
export async function notifyWeeklySummary(
  userId: number,
  summaryData: {
    applied: number;
    hired: number;
    connects: number;
    [key: string]: any;
  }
): Promise<void> {
  await NotificationService.createNotification({
    userId,
    type: 'weekly_summary',
    title: '📊 Weekly Summary',
    message: `Applied: ${summaryData.applied} | Hired: ${summaryData.hired} | Connects: ${summaryData.connects}`,
    metadata: summaryData,
    priority: 'low',
    actionUrl: `/dashboard`,
    icon: '📊',
  });
}
