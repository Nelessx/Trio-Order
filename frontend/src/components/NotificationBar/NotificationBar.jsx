import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useNotifications } from '../../NotificationContext/NotificationContext';

const NotificationBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  console.log('NotificationBar: notifications:', notifications.length, 'unreadCount:', unreadCount);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'status_update':
        return <FiClock className="text-blue-500" />;
      case 'query_resolved':
        return <FiCheckCircle className="text-green-500" />;
      case 'admin_response':
        return <FiAlertCircle className="text-orange-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-[#FFD369] transition-colors"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#FFD369] hover:text-white transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FiBell className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                      notification.status === 'unread' ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                                title="Mark as read"
                              >
                                <FiCheck className="text-xs" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <p className="text-xs text-gray-400 text-center">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBar;
