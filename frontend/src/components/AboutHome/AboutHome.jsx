import React from 'react';
import { aboutfeature } from '../../assets/dummydata';
import { FaInfoCircle, FaHeart, FaClock, FaFire } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AboutImage from '../../assets/AboutImage.png';
import FloatingParticle from '../FloatingParticle/FloatingParticle';
import { motion } from 'framer-motion';

const AboutHome = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] text-white py-20 px-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-8"
          >
            {/* Main Heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="block bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,76,41,0.3)]">
                Delivering Delicious Moments
              </span>
            </motion.h2>

            {/* Subheading */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl sm:text-3xl font-semibold text-[#F5F5F5]"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Where Every Order Feels Fresh & Personal
            </motion.h3>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-[#B3B3B3] text-base sm:text-lg max-w-2xl leading-relaxed"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Every meal you order is crafted with care and delivered with love. From local favorites to new cravings, we bring restaurant-quality food straight to your door — hot, fresh, and right on time. Because good food should always arrive with good vibes.
            </motion.p>

            {/* Features Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10"
            >
              {aboutfeature.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="flex flex-col items-center text-center space-y-3 backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.2)] transition-all duration-300"
                >
                  <div className={`text-3xl p-4 rounded-2xl shadow-lg bg-gradient-to-br from-[#FF4C29] to-[#FFD369]`}>
                    <item.icon className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#F5F5F5]" style={{ fontFamily: "'Lato', sans-serif" }}>{item.title}</h3>
                  <p className="text-[#B3B3B3] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>{item.text}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-wrap gap-4 items-center mt-10"
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.4)] transition-all duration-300"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  <FaInfoCircle className="text-lg" />
                  <span>Learn More About Us</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Image Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group w-full max-w-lg mx-auto"
            >
              {/* Multi-layered Glow */}
              <div className="absolute -inset-8 bg-gradient-to-r from-[#FF4C29]/30 to-[#FFD369]/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -inset-12 bg-[#FFD369]/20 rounded-full blur-[100px]"></div>
              
              {/* Premium Glass Container for Image */}
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-6 shadow-[0_0_60px_rgba(255,211,105,0.3)] hover:shadow-[0_0_80px_rgba(255,211,105,0.5)] transition-all duration-500">
                {/* Inner Glow Effect */}
                <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(255,76,41,0.1)]"></div>
                
                <motion.img
                  animate={{ 
                    y: [0, -20, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  src={AboutImage}
                  alt="Delicious Food Delivery"
                  className="relative z-10 rounded-2xl w-full object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                />
              </div>

              {/* Floating Decorative Elements */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-full blur-2xl opacity-50"
              ></motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, 20, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-[#FFD369] to-[#FF4C29] rounded-full blur-2xl opacity-40"
              ></motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Background Floating Particles */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <FloatingParticle />
      </div>
    </div>
  );
};

export default AboutHome;
    