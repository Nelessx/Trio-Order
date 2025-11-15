import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Notification = ({ 
  type = 'success', 
  title, 
  message, 
  details, 
  onClose, 
  duration = 5000,
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const config = {
    success: {
      icon: FiCheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      borderColor: 'border-green-500/30',
      glowColor: 'shadow-green-500/25'
    },
    error: {
      icon: FiXCircle,
      gradient: 'from-red-500 to-rose-600',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      glowColor: 'shadow-red-500/25'
    },
    info: {
      icon: FiInfo,
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/25'
    },
    warning: {
      icon: FiAlertTriangle,
      gradient: 'from-yellow-500 to-orange-600',
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/30',
      glowColor: 'shadow-yellow-500/25'
    }
  };

  const currentConfig = config[type];
  const IconComponent = currentConfig.icon;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.4 
        }}
        className="pointer-events-auto max-w-md w-full mx-auto"
      >
        <div className={`
          relative glass-elevated rounded-2xl border-2 ${currentConfig.borderColor}
          ${currentConfig.glowColor} shadow-2xl overflow-hidden
        `}>
          {/* Gradient Header */}
          <div className={`h-1 bg-gradient-to-r ${currentConfig.gradient}`} />
          
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#B3B3B3] hover:text-white transition-colors z-10 p-1 rounded-lg hover:bg-white/5"
          >
            <FiX className="w-5 h-5" />
          </motion.button>

          {/* Content */}
          <div className="p-6 pr-12">
            {/* Icon and Title */}
            <div className="flex items-start gap-4 mb-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`flex-shrink-0 w-12 h-12 ${currentConfig.iconBg} rounded-xl flex items-center justify-center backdrop-blur-sm`}
              >
                <IconComponent className={`w-6 h-6 ${currentConfig.iconColor}`} />
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.h3 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-h4 font-semibold text-[#F5F5F5] mb-1"
                >
                  {title}
                </motion.h3>
                {message && (
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-body-sm text-[#B3B3B3] leading-relaxed"
                  >
                    {message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Details */}
            {details && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10"
              >
                <p className="text-body-sm text-[#B3B3B3] leading-relaxed">
                  {details}
                </p>
              </motion.div>
            )}

            {/* Progress Bar */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className="mt-4 bg-white/10 rounded-full h-1 overflow-hidden"
            >
              <div className={`h-full bg-gradient-to-r ${currentConfig.gradient} rounded-full`} />
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/5 rounded-full blur-sm" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white/5 rounded-full blur-sm" />
        </div>
      </motion.div>
    </div>
  );
};

// Notification Manager Hook
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      show: true
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  };

  const hideNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title, message, details) => {
    return showNotification({ type: 'success', title, message, details });
  };

  const showError = (title, message, details) => {
    return showNotification({ type: 'error', title, message, details });
  };

  const showInfo = (title, message, details) => {
    return showNotification({ type: 'info', title, message, details });
  };

  const showWarning = (title, message, details) => {
    return showNotification({ type: 'warning', title, message, details });
  };

  return {
    notifications,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};

// Notification Container Component
export const NotificationContainer = ({ notifications, onHide }) => {
  return (
    <AnimatePresence>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => onHide(notification.id)}
        />
      ))}
    </AnimatePresence>
  );
};

export default Notification;