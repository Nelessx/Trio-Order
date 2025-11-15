import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {navLinks, styles} from '../assets/dummyadmin'
import { GiChefToque } from "react-icons/gi";
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [orderCount, setOrderCount] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Poll for new/pending orders every 2s (near real-time)
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get('http://localhost:4000/api/orders/getall', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const orders = res.data?.orders || [];
                const activeStatuses = new Set(['pending','processing','preparing','outForDelivery']);
                const count = orders.filter(o => activeStatuses.has((o.status||'pending')) && !o.deletedByAdmin).length;
                setOrderCount(count);
            } catch (e) {
                // silent fail to avoid UI noise
            }
        };
        fetchCount();
        const id = setInterval(fetchCount, 2000);
        return () => clearInterval(id);
    }, []);

    // Handle window resize for responsive text
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        localStorage.removeItem('adminLoginData');
        navigate('/admin-login');
    };

    const handleLogoClick = () => {
        // Navigate to home page
        navigate('/');
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const adminInfo = JSON.parse(localStorage.getItem('admin') || '{}');

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-[#121212] via-[#1A1A1A] to-[#121212] border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl shadow-lg w-full"
    >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
            {/* Logo Section */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer flex-shrink-0"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#FF4C29] to-[#FF6B35] rounded-lg sm:rounded-xl shadow-lg">
                <GiChefToque className="text-lg sm:text-xl lg:text-2xl text-white" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent whitespace-nowrap">
                Admin Panel
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 flex-1 justify-center overflow-x-auto scrollbar-hide px-2">
              {navLinks.map((link, index) => {
                // Handle longer text for Contact Queries - show shorter on smaller screens
                const displayName = link.name === 'Contact Queries' 
                  ? windowWidth < 1280 ? 'Queries' : 'Contact Queries'
                  : link.name;
                
                return (
                  <motion.div
                    key={link.name}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    className="flex-shrink-0"
                  >
                    <NavLink 
                      to={link.href} 
                      title={link.name}
                      className={({isActive}) =>
                        `flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-2 xl:py-2.5 rounded-lg xl:rounded-xl transition-all duration-300 whitespace-nowrap ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] text-white shadow-md shadow-[#FF4C29]/25' 
                            : 'text-[#B3B3B3] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                        }`
                      }
                    >
                      <span className="text-base xl:text-lg flex-shrink-0">{link.icon}</span>
                      <span className="font-semibold relative inline-flex items-center text-xs xl:text-sm 2xl:text-base">
                        {displayName}
                        {link.name === 'Orders' && orderCount > 0 && (
                          <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] xl:text-xs font-bold text-black bg-amber-400 rounded-full">
                            {orderCount}
                          </span>
                        )}
                      </span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
              
            {/* Admin Info and Logout - Desktop */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="hidden lg:flex items-center gap-2 xl:gap-3 ml-2 xl:ml-3 pl-2 xl:pl-3 border-l border-white/10 flex-shrink-0"
            >
              {adminInfo.username && (
                <div className="hidden xl:block text-sm xl:text-base text-[#FFD369] font-semibold truncate max-w-[120px] 2xl:max-w-[150px]">
                  {adminInfo.username}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-2 xl:py-2.5 rounded-lg xl:rounded-xl border border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/10 transition-all duration-300 whitespace-nowrap font-semibold"
              >
                <FiLogOut className="text-base xl:text-lg" />
                <span className="text-sm xl:text-base">Logout</span>
              </motion.button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all duration-300 flex-shrink-0"
            >
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-white/10 bg-black/30 backdrop-blur-xl"
            >
              <div className="px-3 sm:px-4 py-3 space-y-1.5">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <NavLink 
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={({isActive}) =>
                        `flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] text-white shadow-md' 
                            : 'text-[#B3B3B3] hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span className="font-medium inline-flex items-center text-sm">
                        {link.name}
                        {link.name === 'Orders' && orderCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold text-black bg-amber-400 rounded-full">
                            {orderCount}
                          </span>
                        )}
                      </span>
                    </NavLink>
                  </motion.div>
                ))}
                
                {/* Mobile Admin Info and Logout */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="pt-3 mt-3 border-t border-white/10"
                >
                  {adminInfo.username && (
                    <div className="px-3 mb-2.5">
                      <div className="text-sm text-[#FFD369] font-semibold break-all">
                        {adminInfo.username}
                      </div>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/10 transition-all duration-300 w-full"
                  >
                    <FiLogOut className="text-lg" />
                    <span className="font-medium text-sm">Logout</span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
