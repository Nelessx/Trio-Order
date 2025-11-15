import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning", // warning, danger, info
  isLoading = false 
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <FiTrash2 className="text-2xl" />,
          iconBg: "bg-red-500/20",
          iconColor: "text-red-400",
          confirmBg: "bg-red-600 hover:bg-red-700",
          borderColor: "border-red-500/30"
        };
      case 'info':
        return {
          icon: <FiAlertTriangle className="text-2xl" />,
          iconBg: "bg-blue-500/20",
          iconColor: "text-blue-400",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          borderColor: "border-blue-500/30"
        };
      default: // warning
        return {
          icon: <FiAlertTriangle className="text-2xl" />,
          iconBg: "bg-amber-500/20",
          iconColor: "text-amber-400",
          confirmBg: "bg-amber-600 hover:bg-amber-700",
          borderColor: "border-amber-500/30"
        };
    }
  };

  const { icon, iconBg, iconColor, confirmBg, borderColor } = getIconAndColors();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`relative bg-[#4b3b3b]/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-2 ${borderColor} max-w-md w-full`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-amber-400/60 hover:text-amber-400 transition-colors p-1"
          >
            <FiX className="text-xl" />
          </button>

          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${iconBg} mb-4`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-amber-100 mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-amber-200/80 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-[#3a2b2b]/50 text-amber-200 rounded-lg hover:bg-[#3a2b2b]/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 ${confirmBg} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <FiCheck className="text-sm" />
                  {confirmText}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog;
