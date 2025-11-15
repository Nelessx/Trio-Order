import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowRight, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from './Notification';

const AdminForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleRequestPin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/api/admin/forgot-password', { email });

      if (response.data.success) {
        showSuccess(response.data.message);
        setStep(2);
      } else {
        showError(response.data.message);
        if (response.data.needsVerification) {
          setTimeout(() => navigate('/admin-verify-email', { state: { email } }), 2000);
        }
      }
    } catch (error) {
      console.error('Request PIN error:', error);
      showError('Failed to send PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    const pinString = pin.join('');
    
    if (pinString.length !== 6) {
      showError('Please enter complete 6-digit PIN');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/api/admin/verify-reset-pin', { email, pin: pinString });

      if (response.data.success) {
        showSuccess(response.data.message);
        setStep(3);
      } else {
        showError(response.data.message);
        if (response.data.expired) {
          setPin(['', '', '', '', '', '']);
          document.getElementById('admin-reset-pin-0')?.focus();
        }
      }
    } catch (error) {
      console.error('Verify PIN error:', error);
      showError('PIN verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4000/api/admin/reset-password', {
        email,
        pin: pin.join(''),
        newPassword
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        setTimeout(() => navigate('/admin-login'), 2000);
      } else {
        showError(response.data.message);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      document.getElementById(`admin-reset-pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`admin-reset-pin-${index - 1}`)?.focus();
    }
  };

  const handleResendPin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/admin/forgot-password', { email });

      if (response.data.success) {
        showSuccess('New PIN sent to your email');
        setPin(['', '', '', '', '', '']);
        document.getElementById('admin-reset-pin-0')?.focus();
      } else {
        showError(response.data.message);
      }
    } catch (error) {
      console.error('Resend error:', error);
      showError('Failed to resend PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-full flex items-center justify-center shadow-lg">
            {step === 1 && <FiMail className="text-white text-4xl" />}
            {step === 2 && <FiMail className="text-white text-4xl" />}
            {step === 3 && <FiLock className="text-white text-4xl" />}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {step === 1 && 'Admin Password Reset'}
            {step === 2 && 'Enter PIN'}
            {step === 3 && 'Create New Password'}
          </h1>
          <p className="text-[#B3B3B3]" style={{ fontFamily: "'Lato', sans-serif" }}>
            {step === 1 && 'Enter your admin email to receive a reset PIN'}
            {step === 2 && `PIN sent to ${email}`}
            {step === 3 && 'Your old password will be invalidated'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleRequestPin}
              className="space-y-6"
            >
              <div>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-[#FFD369] focus:outline-none transition-all duration-300"
                    style={{ paddingLeft: '2.5rem', fontFamily: "'Lato', sans-serif" }}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(255,211,105,0.5)]'}`}
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                {loading ? 'Sending...' : 'Send PIN'} <FiArrowRight />
              </motion.button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleVerifyPin}
              className="space-y-6"
            >
              <div className="flex justify-center gap-2">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    id={`admin-reset-pin-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-xl text-[#FFD369] focus:border-[#FFD369] focus:outline-none transition-all duration-300"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(255,211,105,0.5)]'}`}
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                {loading ? 'Verifying...' : 'Verify PIN'} <FiArrowRight />
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendPin}
                  disabled={loading}
                  className="text-[#FFD369] hover:text-[#FF4C29] text-sm transition-colors"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  Resend PIN
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleResetPassword}
              className="space-y-6"
            >
              <div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-[#FFD369] focus:outline-none transition-all duration-300"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontFamily: "'Lato', sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] hover:text-[#FF4C29] transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:border-[#FFD369] focus:outline-none transition-all duration-300"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontFamily: "'Lato', sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] hover:text-[#FF4C29] transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(255,211,105,0.5)]'}`}
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                {loading ? 'Resetting...' : 'Reset Password'} <FiArrowRight />
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            to="/admin-login"
            className="text-[#FFD369] hover:text-[#FF4C29] font-semibold transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            <FiArrowRight className="rotate-180" />
            Back to Admin Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminForgotPassword;

