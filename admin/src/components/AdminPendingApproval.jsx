import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiMail, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminPendingApproval = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message || "Registration request sent! Please wait for owner approval.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-full flex items-center justify-center shadow-lg relative">
            <FiClock className="text-white text-5xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-transparent border-t-white/30 rounded-full"
            ></motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Pending Owner Approval
          </h1>
          <p className="text-[#B3B3B3] text-base" style={{ fontFamily: "'Lato', sans-serif" }}>
            {message}
          </p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-[#FFD369] font-semibold mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
                Step 1: Request Sent
              </h3>
              <p className="text-[#B3B3B3] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                Your registration details have been sent to the system owner for review.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-xl flex items-center justify-center flex-shrink-0">
              <FiMail className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-[#FFD369] font-semibold mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
                Step 2: Wait for Email
              </h3>
              <p className="text-[#B3B3B3] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                You will receive a verification PIN via email once the owner approves your request.
              </p>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-xl flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-[#FFD369] font-semibold mb-1" style={{ fontFamily: "'Lato', sans-serif" }}>
                Step 3: Verify & Login
              </h3>
              <p className="text-[#B3B3B3] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                Enter the PIN to verify your email and start managing the platform.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Warning Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#FF4C29]/10 border border-[#FF4C29]/30 rounded-2xl p-4"
        >
          <p className="text-[#B3B3B3] text-sm text-center" style={{ fontFamily: "'Lato', sans-serif" }}>
            ⏰ <strong className="text-[#FFD369]">Please Note:</strong> This process may take a few minutes to a few hours depending on the owner's availability.
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/admin-login')}
          className="w-full py-3 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/20 text-[#FFD369] font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          <FiArrowRight className="rotate-180" />
          Back to Login
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AdminPendingApproval;

