import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('NotificationContext: Fetching notifications, token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.log('NotificationContext: No token found, skipping notification fetch');
        return;
      }

      const response = await axios.get('http://localhost:4000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('NotificationContext: API response:', response.data);

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
        console.log('NotificationContext: Set notifications:', response.data.data.notifications.length, 'unread:', response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('NotificationContext: Error fetching notifications:', error);
      console.error('NotificationContext: Error response:', error.response?.data);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.put(
        `http://localhost:4000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, status: 'read' }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.put(
        'http://localhost:4000/api/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, status: 'read' }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.delete(
        `http://localhost:4000/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const notification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        if (notification && notification.status === 'unread') {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Fetch notifications on mount and every 2 seconds for near real-time
  useEffect(() => {
    console.log('NotificationContext: useEffect triggered');
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2000); // 2 seconds
    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
