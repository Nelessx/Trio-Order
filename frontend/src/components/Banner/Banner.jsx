import React, { useState } from 'react';
import { FaSearch, FaArrowRight } from "react-icons/fa";
import { bannerAssets } from '../../assets/dummydata';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { bannerImage } = bannerAssets;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to menu page with search query
      navigate('/menu', { state: { searchQuery: searchQuery.trim() } });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] text-white min-h-[90vh] flex items-center px-4 sm:px-8 py-16">
      {/* Modern Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#FF4C29]/10 to-[#FFD369]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between relative z-10 gap-12">

        {/* Left Section - Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left space-y-8"
        >
          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            We're Here <br />
            <span className="bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,76,41,0.5)]">
              For Food & Delivery
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-[#B3B3B3] text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Best cooks and best delivery guys all at your service. 
            <span className="text-[#FFD369] font-semibold"> Hot tasty food</span> will reach you in <span className="text-[#FF4C29] font-bold">60 minutes</span>.
          </motion.p>

          {/* Modern Search Bar */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            onSubmit={handleSearch}
            className="relative max-w-md mx-auto lg:mx-0"
          >
            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.2)] transition-all duration-300 group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-lg pointer-events-none group-hover:text-[#FF4C29] transition-colors" />
              <input
                type="text"
                placeholder="Search your favorite dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 pl-12 pr-16 bg-transparent focus:outline-none text-white placeholder-[#B3B3B3] focus:placeholder-[#FFD369] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_4px_16px_rgba(255,76,41,0.4)]"
              >
                <FaArrowRight className="text-sm" />
              </motion.button>
            </div>
          </motion.form>
        </motion.div>

        {/* Right Section - Modern Image Display */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 relative min-h-[400px] sm:min-h-[500px] flex justify-center items-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="relative"
          >
            {/* Modern Glow Effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-[#FF4C29]/30 to-[#FFD369]/30 rounded-full blur-3xl animate-pulse"></div>
            
            {/* Modern Image Container */}
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-6 shadow-[0_0_60px_rgba(255,211,105,0.3)] hover:shadow-[0_0_80px_rgba(255,211,105,0.5)] transition-all duration-500 min-h-[350px] min-w-[350px] flex items-center justify-center group">
              {/* Inner Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#FF4C29]/5 to-[#FFD369]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <motion.img
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                src={bannerImage}
                alt="Food Delivery"
                className="relative z-10 w-full h-auto max-w-[400px] max-h-[400px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_25px_60px_rgba(0,0,0,0.7)] transition-all duration-500"
                onError={(e) => {
                  console.error('Banner image failed to load:', e);
                  e.target.style.display = 'none';
                  // Show fallback
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-[350px] flex flex-col items-center justify-center text-center text-white/60';
                  fallback.innerHTML = `
                    <div class="w-24 h-24 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-full flex items-center justify-center mb-4">
                      <span class="text-4xl">🍽️</span>
                    </div>
                    <p class="text-lg font-semibold">Food Delivery</p>
                    <p class="text-sm opacity-75">Delicious meals at your doorstep</p>
                  `;
                  e.target.parentNode.appendChild(fallback);
                }}
                onLoad={() => {
                  console.log('Banner image loaded successfully');
                }}
              />
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-full blur-2xl opacity-40"
            ></motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-[#FFD369] to-[#FF4C29] rounded-full blur-2xl opacity-30"
            ></motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Banner;