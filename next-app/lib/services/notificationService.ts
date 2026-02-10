/**
 * Notification Service - Migrated from Express to Next.js with Pusher
 *
 * This service handles all notification-related operations including:
 * - Creating notifications in database
 * - Sending real-time notifications via Pusher (replaces Socket.IO)
 * - CRUD operations for notifications
 */

import { Notification, User } from '../db/models';
import { Op } from 'sequelize';
import { notifyUser, notifyAdmin } from '../notification/pusher-server';

export interface CreateNotificationData {
  userId: number;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  icon?: string;
}

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

class NotificationService {
  /**
   * Create a new notification and emit via Pusher
   * Replaces: io.to(`user_${userId}`).emit('notification', data)
   */
  static async createNotification(
    data: CreateNotificationData
  ): Promise<any> {
    try {
      const { userId, type, title, message, metadata, priority, actionUrl, icon } = data;

      // Create notification in database
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        metadata,
        priority: priority || 'medium',
        actionUrl,
        icon,
        isRead: false,
      });

      // Get full notification with user data
      const fullNotification = await Notification.findByPk(notification.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstname', 'lastname', 'email', 'role'],
        }],
      });

      if (!fullNotification) {
        throw new Error('Failed to retrieve created notification');
      }

      // Send to specific user via Pusher (replaces Socket.IO)
      await notifyUser(userId, 'notification', fullNotification.toJSON());

      // If it's high priority or urgent, also send to admin room
      if (priority === 'high' || priority === 'urgent') {
        await notifyAdmin('admin_notification', fullNotification.toJSON());
      }

      return fullNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for all admins
   * Sends notification to each admin user
   */
  static async createAdminNotification(
    data: Omit<CreateNotificationData, 'userId'>
  ): Promise<any[]> {
    try {
      // Get all admin users
      const admins = await User.findAll({ where: { role: 'admin' } });

      const notifications = await Promise.all(
        admins.map((admin) =>
          this.createNotification({
            userId: admin.id,
            ...data,
          })
        )
      );

      return notifications;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(
    userId: number,
    options: GetNotificationsOptions = {}
  ) {
    const { page = 1, limit = 20, isRead } = options;
    const offset = (page - 1) * limit;

    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const { rows, count } = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    notificationId: number,
    userId: number
  ): Promise<any> {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<{ success: boolean }> {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );

    return { success: true };
  }

  /**
   * Delete notification
   */
  static async deleteNotification(
    notificationId: number,
    userId: number
  ): Promise<{ success: boolean }> {
    const result = await Notification.destroy({
      where: { id: notificationId, userId },
    });

    if (result === 0) {
      throw new Error('Notification not found');
    }

    return { success: true };
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(
    userId: number
  ): Promise<{ success: boolean; deleted: number }> {
    const result = await Notification.destroy({
      where: { userId },
    });

    return { success: true, deleted: result };
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const count = await Notification.count({
      where: { userId, isRead: false },
    });

    return count;
  }

  /**
   * Delete old read notifications (cleanup)
   * Useful for maintenance/cron jobs
   */
  static async deleteOldNotifications(
    daysOld: number = 30
  ): Promise<{ deleted: number }> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysOld);

    const result = await Notification.destroy({
      where: {
        isRead: true,
        createdAt: { [Op.lt]: dateThreshold },
      },
    });

    return { deleted: result };
  }
}

export default NotificationService;
