import React, { useEffect, useState } from 'react';
import {
  FaArrowRight,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
  FaUserPlus
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const url = 'http://localhost:4000';

// Toast Component
const AwesomeToast = ({ message, icon, isError }) => (
  <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg animate-slide-in backdrop-blur-xl ${
    isError ? 'bg-red-600/90 border border-red-400' : 'bg-green-600/90 border border-green-400'
  } text-white`}>
    <span className="text-lg">{icon}</span>
    <span className="text-sm font-medium" style={{ fontFamily: "'Lato', sans-serif" }}>{message}</span>
  </div>
);

const LoginPage = () => {
  const [showToast, setShowToast] = useState({ visible: false, message: '', icon: null, isError: false });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('loginData');
    if (stored) setFormData(JSON.parse(stored));
  }, []);

  // For toast and redirect after success
  useEffect(() => {
    if (showToast.visible && !showToast.isError) {
      const timer = setTimeout(() => {
        setShowToast({ visible: false, message: '', icon: null, isError: false });
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast, navigate]);

  const toggleShowPassword = () => setShowPassword(prev => !prev);
  
  const handleChange = ({ target: { name, value, type, checked } }) =>
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/user/login`, {
        email: formData.email,
        password: formData.password
      });

      if (res.status === 200 && res.data.success && res.data.token) {
        localStorage.setItem('authToken', res.data.token);
        
        // Store user information properly
        const userInfo = {
          email: formData.email,
          token: res.data.token,
          username: res.data.user.username,
          profilePhoto: res.data.user.profilePhoto
        };
        localStorage.setItem('user', JSON.stringify(userInfo));

        // remember me
        formData.rememberMe
          ? localStorage.setItem('loginData', JSON.stringify(formData))
          : localStorage.removeItem('loginData');

        setShowToast({ 
          visible: true, 
          message: 'Login successful!', 
          icon: <FaCheckCircle />,
          isError: false 
        });
        return;
      }
      throw new Error(res.data.message || 'Login Failed');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setShowToast({ 
        visible: true, 
        message: msg, 
        icon: <FaCheckCircle />,
        isError: true 
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] p-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {showToast.visible && <AwesomeToast message={showToast.message} icon={showToast.icon} isError={showToast.isError} />}

      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6 relative z-10">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className='relative'>
            <FaUser className='absolute top-1/2 transform -translate-y-1/2 left-4 text-[#FFD369] pointer-events-none' />
            <input
              type='email'
              name='email'
              placeholder='Email'
              value={formData.email}
              onChange={handleChange}
              className='w-full px-4 py-3 pl-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#FFD369]/50 transition-all duration-300'
              style={{ fontFamily: "'Lato', sans-serif" }}
              required
            />
          </div>

          {/* Password Field */}
          <div className='relative'>
            <FaLock className='absolute top-1/2 transform -translate-y-1/2 left-4 text-[#FFD369] pointer-events-none' />
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-4 py-3 pl-12 pr-12 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#FFD369]/50 transition-all duration-300'
              style={{ fontFamily: "'Lato', sans-serif" }}
              required
            />
            <button
              type='button'
              onClick={toggleShowPassword}
              className='absolute top-1/2 right-4 transform -translate-y-1/2 text-[#FFD369] hover:text-[#FF4C29] transition-colors'
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {/* Remember Me */}
          <div className='flex items-center'>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                name='rememberMe'
                checked={formData.rememberMe}
                onChange={handleChange}
                className='form-checkbox h-5 w-5 text-[#FF4C29] bg-white/10 border-[#FFD369] rounded focus:ring-[#FFD369]'
              />
              <span className='ml-3 text-[#F5F5F5]' style={{ fontFamily: "'Lato', sans-serif" }}>Remember me</span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type='submit'
            className='w-full py-4 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.4)] transition-all duration-300'
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            Sign In <FaArrowRight />
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <Link to="/signup" className="text-[#FFD369] hover:text-[#FF4C29] transition-colors flex items-center justify-center gap-2 font-semibold" style={{ fontFamily: "'Lato', sans-serif" }}>
            <FaUserPlus />
            <span>Create new Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

