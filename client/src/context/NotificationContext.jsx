import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket, connected } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/notifications`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [API_URL, token]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true, readAt: new Date() } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [API_URL, token]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(
        `${API_URL}/api/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      // Update local state - set all to read
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, [API_URL, token]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  }, [API_URL, token]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await axios.delete(`${API_URL}/api/notifications/all`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete all notifications');
    }
  }, [API_URL, token]);

  // Listen for real-time notifications via Socket.IO
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (notification) => {
      console.log('📬 New notification received:', notification);

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast.info(
        <div className="flex items-center gap-2">
          <span className="text-xl">{notification.icon || '🔔'}</span>
          <div>
            <p className="font-semibold text-sm">{notification.title}</p>
            <p className="text-xs text-gray-600">{notification.message}</p>
          </div>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          onClick: () => {
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
            markAsRead(notification.id);
          },
        }
      );

      // Play notification sound (optional)
      if (typeof Audio !== 'undefined') {
        const audio = new Audio('/notification-sound.mp3'); // Add a sound file to public folder
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore if blocked by browser
      }
    };

    const handleAdminNotification = (notification) => {
      if (role === 'admin') {
        console.log('👨‍💼 Admin notification received:', notification);
        handleNewNotification(notification);
      }
    };

    socket.on('notification', handleNewNotification);
    socket.on('admin_notification', handleAdminNotification);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('admin_notification', handleAdminNotification);
    };
  }, [socket, connected, role, markAsRead]);

  // Fetch initial data on mount
  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [token, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
