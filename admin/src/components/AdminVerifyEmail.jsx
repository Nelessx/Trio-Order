import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from './Notification';

const AdminVerifyEmail = () => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (!emailFromState) {
      navigate('/admin-signup');
      return;
    }
    setEmail(emailFromState);
  }, [location, navigate]);

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      document.getElementById(`admin-pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`admin-pin-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const pinString = pin.join('');
    
    if (pinString.length !== 6) {
      showError('Please enter complete 6-digit PIN');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/admin/verify-email', {
        email,
        pin: pinString
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        showError(response.data.message);
        if (response.data.expired) {
          setPin(['', '', '', '', '', '']);
          document.getElementById('admin-pin-0')?.focus();
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      showError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    setResending(true);
    try {
      const response = await axios.post('http://localhost:4000/api/admin/resend-verification', {
        email
      });

      if (response.data.success) {
        showSuccess(response.data.message);
        setPin(['', '', '', '', '', '']);
        document.getElementById('admin-pin-0')?.focus();
      } else {
        showError(response.data.message);
      }
    } catch (error) {
      console.error('Resend error:', error);
      showError('Failed to resend PIN. Please try again.');
    } finally {
      setResending(false);
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
            <FiMail className="text-white text-4xl" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Verify Admin Email
          </h1>
          <p className="text-[#B3B3B3]" style={{ fontFamily: "'Lato', sans-serif" }}>
            We've sent a 6-digit PIN to<br />
            <span className="text-[#FFD369] font-semibold">{email}</span>
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleVerify}
          className="space-y-6"
        >
          <div className="flex justify-center gap-2">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`admin-pin-${index}`}
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
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Verifying...
              </>
            ) : (
              <>
                <FiCheck size={20} />
                Verify Email
              </>
            )}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-3"
        >
          <p className="text-[#B3B3B3] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
            Didn't receive the PIN?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResendPin}
            disabled={resending}
            className={`text-[#FFD369] hover:text-[#FF4C29] font-semibold transition-colors flex items-center justify-center gap-2 mx-auto ${resending ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            {resending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FFD369] border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <FiArrowRight />
                Resend PIN
              </>
            )}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#FF4C29]/10 border border-[#FF4C29]/30 rounded-2xl p-4"
        >
          <p className="text-[#B3B3B3] text-xs text-center" style={{ fontFamily: "'Lato', sans-serif" }}>
            ⏰ <strong className="text-[#FFD369]">Note:</strong> The PIN expires in 15 minutes
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminVerifyEmail;

