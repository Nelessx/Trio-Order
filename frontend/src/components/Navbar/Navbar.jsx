import React, { useEffect, useState } from "react";
import { GiChefToque } from "react-icons/gi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiStar,
  FiPhone,
  FiShoppingCart,
  FiLogOut,
  FiKey,
  FiPackage, 
} from "react-icons/fi";
import { useCart } from "../../CartContext/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBar from "../NotificationBar/NotificationBar";
import UserProfileDropdown from "../UserProfileDropdown/UserProfileDropdown";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("authToken") && localStorage.getItem("user"))
  );

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem("authToken") && localStorage.getItem("user")));
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("loginData");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  const handleLogoClick = () => {
    // Navigate to home page
    navigate("/");
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Close mobile menu if open
    setIsOpen(false);
  };

  const renderDesktopAuthButton = () => {
    return isAuthenticated ? (
      <UserProfileDropdown />
    ) : (
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/login")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white transition-all duration-300 shadow-lg hover:shadow-[0_8px_24px_rgba(255,76,41,0.4)]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <FiKey className="text-lg" />
        <span className="font-semibold">Login</span>
      </motion.button>
    );
  };

  const renderMobileAuthButton = () => {
    return isAuthenticated ? (
      <UserProfileDropdown />
    ) : (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          navigate("/login");
          setIsOpen(false);
        }}
        className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white transition-all duration-300 shadow-lg"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <FiKey className="text-lg" />
        <span className="font-semibold">Login</span>
      </motion.button>
    );
  };

  const navLinks = [
    { name: "Home", to: "/", icon: <FiHome /> }, // ✅ changed href → to
    { name: "Menu", to: "/menu", icon: <FiBook /> },
    { name: "About", to: "/about", icon: <FiStar /> },
    { name: "Contact", to: "/contact", icon: <FiPhone /> },
    ...(isAuthenticated
      ? [{ name: "My Orders", to: "/myorder", icon: <FiPackage /> }]
      : []),
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="backdrop-blur-xl bg-[#121212]/95 border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sticky top-0 z-50"
    >
      {/* Premium Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4C29] to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          {/* Premium Logo Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-shrink-0 flex items-center gap-3 group cursor-pointer"
            onClick={handleLogoClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-12 h-12 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-2xl flex items-center justify-center shadow-lg"
            >
              <GiChefToque className="text-2xl text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span
                className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Trio Order
              </span>
              <div className="h-[2px] bg-gradient-to-r from-[#FF4C29] via-[#FFD369] to-transparent w-full mt-1 rounded-full"></div>
            </div>
          </motion.div>

          {/* Premium Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden lg:flex items-center gap-1 flex-1 justify-end"
          >
            {navLinks.map((link, index) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `group relative px-3 xl:px-4 py-2.5 flex items-center gap-2 rounded-2xl transition-all duration-300 text-sm xl:text-base ${
                    isActive
                      ? "backdrop-blur-xl bg-white/10 border border-[#FF4C29]/50 text-[#FFD369] shadow-lg"
                      : "text-[#B3B3B3] hover:text-[#F5F5F5] hover:bg-white/5"
                  }`
                }
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {({ isActive }) => (
                  <>
                    <motion.span 
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      className={isActive ? "text-[#FFD369]" : "text-[#FF4C29]"}
                    >
                      {link.icon}
                    </motion.span>
                    <span className="font-medium">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF4C29] to-[#FFD369] rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
            
            <div className="flex items-center gap-2 xl:gap-3 ml-4 xl:ml-6">
              {/* Premium Cart Button */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <NavLink
                  to="/cart"
                  className="relative p-3 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFD369]/50 rounded-2xl transition-all duration-300 shadow-lg flex items-center justify-center no-underline"
                  style={{ textDecoration: 'none' }}
                >
                  <FiShoppingCart className="text-xl text-[#F5F5F5]" />
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </NavLink>
              </motion.div>
              
              {/* Notification Bar - Only show for authenticated users */}
              {isAuthenticated && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <NotificationBar />
                </motion.div>
              )}
              
              {renderDesktopAuthButton()}
            </div>
          </motion.div>

          {/* Premium Hamburger Menu Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:hidden flex items-center"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[#FF4C29]/50 rounded-2xl transition-all duration-300 shadow-lg"
            >
              <div className="space-y-1.5 w-6">
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="block w-full h-0.5 bg-[#FFD369] rounded-full"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block w-full h-0.5 bg-[#FFD369] rounded-full"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="block w-full h-0.5 bg-[#FFD369] rounded-full"
                />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Premium Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden backdrop-blur-xl bg-[#1A1A1A]/95 border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "backdrop-blur-xl bg-white/10 border border-[#FF4C29]/50 text-[#FFD369]"
                          : "text-[#B3B3B3] hover:text-[#F5F5F5] hover:bg-white/5"
                      }`
                    }
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? "text-[#FFD369]" : "text-[#FF4C29]"}>
                          {link.icon}
                        </span>
                        <span className="font-medium">{link.name}</span>
                      </>
                    )}
                  </NavLink>
                </motion.div>
              ))}
              
              <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                {/* Notification Bar for Mobile - Only show for authenticated users */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    className="px-5 py-3"
                  >
                    <NotificationBar />
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.1 }}
                >
                  <NavLink
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-5 py-3 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-[#FFD369]/50 text-[#F5F5F5] rounded-2xl transition-all duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <div className="flex items-center gap-3">
                      <FiShoppingCart className="text-[#FF4C29]" />
                      <span className="font-medium">Cart</span>
                    </div>
                    {totalItems > 0 && (
                      <span className="bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {totalItems}
                      </span>
                    )}
                  </NavLink>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1 }}
                >
                  {renderMobileAuthButton()}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
};

export default Navbar;
