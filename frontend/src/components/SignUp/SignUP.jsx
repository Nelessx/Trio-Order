import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const url = 'http://localhost:4000';

// Toast Component
const AwesomeToast = ({ message, icon }) => (
  <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-in">
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium">{message}</span>
  </div>
);

const SignUP = () => {
  const [showToast, setShowToast] = useState({ visible: false, message: '', icon: null });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  // For toast and redirect after success
  useEffect(() => {
    if (showToast.visible && showToast.message === 'Sign up successfully') {
      const timer = setTimeout(() => {
        setShowToast({ visible: false, message: '', icon: null });
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast, navigate]);

  const toggleShowPassword = () => setShowPassword(prev => !prev);
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('sign up fired', formData);
    try {
      const res = await axios.post(`${url}/api/user/register`, formData);
      console.log('Register Response', res.data);

      if (res.data.success && res.data.needsVerification) {
        // Redirect to email verification page
        setShowToast({
          visible: true,
          message: res.data.message || 'Check your email for verification PIN',
          icon: <FaCheckCircle />
        });
        setTimeout(() => {
          navigate('/verify-email', { state: { email: res.data.email } });
        }, 2000);
        return;
      }

      if (res.data.success && res.data.token) {
        // Auto login after verification (shouldn't happen but kept for backward compatibility)
        localStorage.setItem('authToken', res.data.token);
        setShowToast({
          visible: true,
          message: 'Sign up successfully',
          icon: <FaCheckCircle />
        });
        return;
      }

      // Handle specific cases
      if (!res.data.success && res.data.needsVerification) {
        setShowToast({
          visible: true,
          message: res.data.message,
          icon: <FaCheckCircle />
        });
        setTimeout(() => {
          navigate('/verify-email', { state: { email: res.data.email } });
        }, 2000);
        return;
      }

      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
      console.error('registration error', err);
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setShowToast({
        visible: true,
        message: msg,
        icon: <FaCheckCircle />
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {showToast.visible && <AwesomeToast message={showToast.message} icon={showToast.icon} />}

      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#FFD369]/50 transition-all duration-300"
            style={{ fontFamily: "'Lato', sans-serif" }}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#FFD369]/50 transition-all duration-300"
            style={{ fontFamily: "'Lato', sans-serif" }}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#FFD369]/50 transition-all duration-300 pr-12"
              style={{ fontFamily: "'Lato', sans-serif" }}
              required
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-[#FFD369] hover:text-[#FF4C29] transition-colors"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.4)] transition-all duration-300"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-[#FFD369] hover:text-[#FF4C29] transition-colors flex items-center justify-center gap-2 font-semibold" style={{ fontFamily: "'Lato', sans-serif" }}>
            <FaArrowLeft />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUP;
