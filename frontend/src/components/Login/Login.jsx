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
import { iconClass, inputBase } from '../../assets/dummydata';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const url = 'http://localhost:4000';

const Login = ({ onLoginSuccess, onClose }) => {
  const [showToast, setShowToast] = useState({ visible: false, message: '', isError: false });
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

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/api/user/login`, {
        email: formData.email,
        password: formData.password
      });
      console.log('axios res:', res);

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

        setShowToast({ visible: true, message: 'login successfully', isError: false });
        setTimeout(() => {
          setShowToast({ visible: false, message: '', isError: false });
          onLoginSuccess(res.data.token);
        }, 1500);
      } else if (!res.data.success && res.data.needsVerification) {
        // User needs to verify email first
        setShowToast({ visible: true, message: res.data.message, isError: true });
        setTimeout(() => {
          navigate('/verify-email', { state: { email: res.data.email || formData.email } });
        }, 2000);
      } else if (!res.data.success && res.data.accountDeactivated) {
        // User account is deactivated
        setShowToast({ visible: true, message: res.data.message, isError: true });
      } else {
        console.warn('unexpected error:', res.data);
        throw new Error(res.data.message || 'login Failed');
      }
    } catch (err) {
      console.error('Axios error:', err);
      if (err.response) {
        console.error('Server res:', err.response.status, err.response.data);
        
        // Handle verification needed case
        if (err.response.data?.needsVerification) {
          setShowToast({ visible: true, message: err.response.data.message, isError: true });
          setTimeout(() => {
            navigate('/verify-email', { state: { email: err.response.data.email || formData.email } });
          }, 2000);
          return;
        }
        
        // Handle deactivated account case
        if (err.response.data?.accountDeactivated) {
          setShowToast({ visible: true, message: err.response.data.message, isError: true });
          return;
        }
      }
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setShowToast({ visible: true, message: msg, isError: true });
    }
  };

  const handleChange = ({ target: { name, value, type, checked } }) =>
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <div className='space-y-6 relative'>
      {/* Toast Message */}
      <div
        className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
          showToast.visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
        }`}
      >
        <div
          className={`px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold backdrop-blur-xl ${
            showToast.isError ? 'bg-red-600/90 text-white border border-red-400' : 'bg-green-600/90 text-white border border-green-400'
          }`}
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          <FaCheckCircle className='flex-shrink-0 text-lg' />
          <span>{showToast.message}</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className='space-y-5'>
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
          />
          <button
            type='button'
            onClick={toggleShowPassword}
            className='absolute top-1/2 right-4 transform -translate-y-1/2 text-[#FFD369] hover:text-[#FF4C29] transition-colors'
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className='flex items-center justify-between'>
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
          <Link
            to='/forgot-password'
            className='text-[#FFD369] hover:text-[#FF4C29] text-sm transition-colors'
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            Forgot Password?
          </Link>
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
      <div className='text-center pt-2'>
        <Link
          to='/signup'
          onClick={onClose}
          className='text-[#FFD369] hover:text-[#FF4C29] transition-colors flex items-center justify-center gap-2 font-semibold'
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          <FaUserPlus /> Create new Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
