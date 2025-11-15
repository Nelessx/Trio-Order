import React from "react";
import { BiChevronRight } from "react-icons/bi";
import { GiChefToque } from "react-icons/gi";
import { socialIcons } from "../../assets/dummydata";
import { motion } from "framer-motion";
import logo from "../../assets/logo.jpg";

const Footer = () => {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Menu", link: "/menu" },
    { name: "About Us", link: "/about" },
    { name: "Contact", link: "/contact" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#121212] to-[#0A0A0A] text-gray-300 py-16 px-5 border-t border-white/10 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        {/* Left Column - Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-2xl flex items-center justify-center shadow-lg">
              <GiChefToque className="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
              Trio Order
            </h2>
          </div>

          <p className="text-[#B3B3B3] mb-6 leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
            Bringing delicious moments to your doorstep with love and care.
          </p>

          {/* TRIOTRICK Branding */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src={logo} 
                  alt="TRIOTRICK Logo" 
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-white block" style={{ fontFamily: "'Lato', sans-serif" }}>
                  TRIOTRICK
                </span>
                <span className="text-xs text-[#FFD369] font-medium" style={{ fontFamily: "'Lato', sans-serif" }}>
                  Tricking tech into the brilliance
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Middle Column - Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Lato', sans-serif" }}>
            Quick Links
          </h3>
          <ul className="space-y-3">
            {navItems.map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <a
                  href={item.link}
                  className="flex items-center gap-2 text-[#B3B3B3] hover:text-[#FFD369] transition-colors duration-300 group"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  <BiChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  {item.name}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right Column - Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white" style={{ fontFamily: "'Lato', sans-serif" }}>
            Follow Us
          </h3>
          <div className="flex gap-4">
            {socialIcons.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                style={{ 
                  backgroundColor: `${social.color}20`,
                  border: `1px solid ${social.color}40`
                }}
              >
                <social.icon 
                  className="text-xl transition-colors duration-300" 
                  style={{ color: social.color }}
                />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        viewport={{ once: true }}
        className="border-t border-white/10 mt-16 pt-8 text-center relative z-10"
      >
        <p className="text-[#B3B3B3] text-sm mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
          &copy; 2025 <span className="text-[#FFD369] font-semibold">Trio Order</span>. All Rights Reserved.
        </p>
        <p className="text-xs text-[#808080]" style={{ fontFamily: "'Lato', sans-serif" }}>
          Crafted with ❤️ by <span className="text-[#FF4C29]">Paras Subedi</span> • <span className="text-[#FF4C29]">Nilesh Karn</span> • <span className="text-[#FF4C29]">Shishir Gautam</span>
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;