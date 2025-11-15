/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLogOut, FiCamera, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { createPortal } from 'react-dom';

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Get user data from localStorage and keep in state for live updates
  const initialUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [userState, setUserState] = useState(initialUser);
  const { username, email, profilePhoto } = userState;

  const handleLogout = () => {
    localStorage.removeItem('loginData');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/');
    window.location.reload();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const token = localStorage.getItem('authToken');
      const response = await axios.put('http://localhost:4000/api/user/profile-photo', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Update localStorage and in-memory state to reflect new photo instantly
        const updatedUser = { ...userState, profilePhoto: response.data.profilePhoto };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserState(updatedUser);
        setShowPhotoUpload(false);
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Failed to upload profile photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-300"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4C29] to-[#FFD369] flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
          {profilePhoto ? (
            <img
              src={`http://localhost:4000${profilePhoto}`}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${profilePhoto ? 'hidden' : 'flex'}`}>
            {getInitials(username)}
          </div>
        </div>
        <span className="text-white font-medium hidden sm:block" style={{ fontFamily: "'Lato', sans-serif" }}>
          {username || 'User'}
        </span>
      </button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF4C29] to-[#FFD369] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={`http://localhost:4000${profilePhoto}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${profilePhoto ? 'hidden' : 'flex'}`}>
                    {getInitials(username)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {username || 'User'}
                  </h3>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setShowPhotoUpload(true);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FiCamera className="text-lg" />
                <span style={{ fontFamily: "'Lato', sans-serif" }}>Change Profile Photo</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center gap-3 px-6 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <FiUser className="text-lg" />
                <span style={{ fontFamily: "'Lato', sans-serif" }}>View Profile</span>
              </button>

              <div className="border-t border-white/10 my-2"></div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-6 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <FiLogOut className="text-lg" />
                <span style={{ fontFamily: "'Lato', sans-serif" }}>Logout</span>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Profile Modal (Portal to body to ensure true centering) */}
      {showProfileModal && createPortal(
        (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold text-xl" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Profile
                </h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-white">
                  <FiX className="text-2xl" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FF4C29] to-[#FFD369] flex items-center justify-center text-white text-4xl font-bold">
                  {profilePhoto ? (
                    <img
                      src={`http://localhost:4000${profilePhoto}`}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{getInitials(username)}</span>
                  )}
                </div>
                <div className="w-full text-center">
                  <div className="space-y-1">
                    <div className="text-gray-400 text-sm">Name</div>
                    <div className="text-white text-xl font-semibold">{username || 'User'}</div>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="text-gray-400 text-sm">Email</div>
                    <div className="text-white text-lg font-semibold break-all">{email || 'user@example.com'}</div>
                  </div>
                  <div className="mt-6 flex gap-3 justify-center">
                    <button
                      onClick={() => setShowProfileModal(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
          </motion.div>
        </motion.div>
        ), document.body)
      }

      {/* Photo Upload Modal (Portal) */}
      {showPhotoUpload && createPortal(
        (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          onClick={() => setShowPhotoUpload(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="text-center">
                <h3 className="text-white font-semibold text-lg mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Upload Profile Photo
                </h3>
                <p className="text-gray-400 text-sm mb-6" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Choose a new profile photo (max 5MB)
                </p>
                
                {isUploading ? (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#FFD369] border-t-transparent"></div>
                    <span className="text-white" style={{ fontFamily: "'Lato', sans-serif" }}>
                      Uploading...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white font-semibold py-3 rounded-xl hover:from-[#FF6B35] hover:to-[#FFD369] transition-all duration-300"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      Choose Photo
                    </button>
                    <button
                      onClick={() => setShowPhotoUpload(false)}
                      className="w-full bg-gray-600 text-white font-semibold py-3 rounded-xl hover:bg-gray-500 transition-colors"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
          </motion.div>
        </motion.div>
        ), document.body)
      }
    </div>
  );
};

export default UserProfileDropdown;
