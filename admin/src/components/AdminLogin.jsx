import React, { useState } from 'react';
import { GiChefToque } from "react-icons/gi";
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:4000/api/admin/login', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success && response.data.token) {
        // Store admin token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));

        // Handle remember me
        if (formData.rememberMe) {
          localStorage.setItem('adminLoginData', JSON.stringify(formData));
        } else {
          localStorage.removeItem('adminLoginData');
        }

        // Navigate to admin dashboard
        navigate('/');
      } else if (!response.data.success && response.data.pendingApproval) {
        // Admin pending owner approval
        setError(response.data.message);
        setTimeout(() => {
          navigate('/admin-pending-approval', { state: { message: response.data.message } });
        }, 2000);
      } else if (!response.data.success && response.data.needsVerification) {
        // Admin needs to verify email first
        setError(response.data.message);
        setTimeout(() => {
          navigate('/admin-verify-email', { state: { email: response.data.email || formData.email } });
        }, 2000);
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setError(err.response.data.message);
        setTimeout(() => {
          navigate('/admin-verify-email', { state: { email: err.response.data.email || formData.email } });
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-glass w-full max-w-md"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <GiChefToque className="text-5xl text-[#FF4C29]" />
            </motion.div>
            <span className="text-3xl font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent">Admin Panel</span>
          </div>
          <h2 className="text-xl text-[#B3B3B3]">Sign in to manage orders</h2>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-[#B3B3B3] mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input pl-10"
                placeholder="Enter your email"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-[#B3B3B3] mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-base pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter your password"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] hover:text-white transition-colors"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </motion.button>
            </div>
          </motion.div>

          {/* Remember Me & Forgot Password */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-[#FF4C29] bg-white/10 border-white/20 rounded focus:ring-[#FF4C29] focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-[#B3B3B3]">
                Remember me
              </label>
            </div>
            <a
              href="/admin-forgot-password"
              className="text-sm text-[#FFD369] hover:text-[#FF4C29] transition-colors"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Forgot Password?
            </a>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        {/* Login Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-[#B3B3B3]">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/admin-signup')}
              className="text-[#FF4C29] hover:text-[#FFD369] font-semibold transition-colors underline"
            >
              Create one here
            </button>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-[#B3B3B3]">
            Admin access only. Contact system administrator for credentials.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
