const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/middleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendTestNotification,
} = require('../controller/notificationController');

// All routes require authentication
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/:id/read', authenticate, markAsRead);
router.put('/mark-all-read', authenticate, markAllAsRead);
router.delete('/all', authenticate, deleteAllNotifications);
router.delete('/:id', authenticate, deleteNotification);
router.post('/test', authenticate, sendTestNotification);

module.exports = router;
