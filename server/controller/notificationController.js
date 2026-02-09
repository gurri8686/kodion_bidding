const NotificationService = require('../services/notificationService');

/**
 * Get user's notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, isRead } = req.query;

    const result = await NotificationService.getUserNotifications(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await NotificationService.markAsRead(parseInt(id), userId);

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await NotificationService.markAllAsRead(userId);

    res.json(result);
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await NotificationService.deleteNotification(parseInt(id), userId);

    res.json(result);
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * Delete all notifications for user
 */
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await NotificationService.deleteAllNotifications(userId);

    res.json(result);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
};

/**
 * Test notification (for development)
 */
const sendTestNotification = async (req, res) => {
  try {
    const io = req.app.get('io');
    const userId = req.user.id;

    const notification = await NotificationService.createNotification(io, {
      userId,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working!',
      priority: 'medium',
      icon: '🔔',
    });

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendTestNotification,
};
