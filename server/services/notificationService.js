const { Notification, User } = require('../models/index');
const { Op } = require('sequelize');

class NotificationService {
  /**
   * Create a new notification and emit via Socket.IO
   */
  static async createNotification(io, data) {
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
        include: [{ model: User, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email', 'role'] }],
      });

      // Emit to specific user
      io.to(`user_${userId}`).emit('notification', fullNotification);

      // If it's a high priority or urgent, also emit to admin room
      if (priority === 'high' || priority === 'urgent') {
        io.to('admin_room').emit('admin_notification', fullNotification);
      }

      return fullNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for admin (broadcasts to all admins)
   */
  static async createAdminNotification(io, data) {
    try {
      // Get all admin users
      const admins = await User.findAll({ where: { role: 'admin' } });

      const notifications = await Promise.all(
        admins.map((admin) =>
          this.createNotification(io, {
            userId: admin.id,
            ...data,
          })
        )
      );

      // Note: We don't need to emit to 'admin_room' here because
      // createNotification already emits to user_${userId} for each admin
      // Emitting to admin_room would cause duplicate notifications

      return notifications;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  static async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, isRead } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const { rows, count } = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      notifications: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      unreadCount: await Notification.count({ where: { userId, isRead: false } }),
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
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
  static async markAllAsRead(userId) {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );

    return { success: true };
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId, userId) {
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
  static async deleteAllNotifications(userId) {
    const result = await Notification.destroy({
      where: { userId },
    });

    return { success: true, deleted: result };
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId) {
    const count = await Notification.count({
      where: { userId, isRead: false },
    });

    return count;
  }

  /**
   * Delete old read notifications (cleanup)
   */
  static async deleteOldNotifications(daysOld = 30) {
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

module.exports = NotificationService;
