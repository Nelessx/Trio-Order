import React, { useEffect, useState } from "react";
import { useCart } from "../../CartContext/CartContext";
import { FaMinus, FaPlus, FaHeart, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const categories = ["Breakfast", "Lunch", "Salad", "Snacks", "Soups", "Desserts", "Drinks"];

const OurHomeMenu = () => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const { cartItems, addToCart, removeFromCart, updateQuantity, API_BASE } = useCart();
  const [menuData, setMenuData] = useState({});

  const buildImageUrl = (path) => {
    if (!path) return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNNjAgMTQwIEwxMDAgMTAwIEwxNDAgMTQwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
    return path.startsWith("http") ? path : `${API_BASE}/uploads/${String(path).replace(/^\/?uploads\//, "")}`;
  };

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/items`, { withCredentials: true })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        const grouped = items.reduce((acc, item) => {
          const cat = item.category || "Uncategorized";
          (acc[cat] = acc[cat] || []).push(item);
          return acc;
        }, {});
        setMenuData(grouped);
      })
      .catch(console.error);
  }, [API_BASE]);

  const getCartEntry = (id) => cartItems.find((ci) => ci.item?._id === id);
  const getQuantity = (id) => getCartEntry(id)?.quantity || 0;

  const displayItems = (menuData[activeCategory] || []).slice(0, 4);

  return (
    <div className="relative bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] text-white px-4 py-20 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
            Our Exclusive Menu
          </h2>
          <p className="text-[#B3B3B3] text-lg sm:text-xl" style={{ fontFamily: "'Lato', sans-serif" }}>A Symphony of Flavors Crafted Just for You</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white shadow-lg shadow-[#FF4C29]/30" 
                  : "backdrop-blur-xl bg-white/5 border border-white/10 text-[#B3B3B3] hover:text-[#F5F5F5] hover:border-[#FFD369]/50"
              }`}
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayItems.map((item, index) => {
            const qty = getQuantity(item._id);
            const cartEntry = getCartEntry(item._id);
            const discount = item.discount || 0;
            const originalPrice = item.originalPrice || item.price;

            return (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-2xl shadow-xl overflow-hidden border border-white/5 hover:border-[#FFD369]/30 transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative h-56 bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] flex items-center justify-center p-4 overflow-hidden group">
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
                      <span>{discount}% OFF</span>
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs flex items-center gap-1 z-10">
                    <FaStar className="text-[#FFD369]" />
                    <span className="text-white font-semibold">{item.rating || 4}</span>
                  </div>

                  {/* Image - Centered and Contained */}
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    src={buildImageUrl(item.imageUrl || item.image)}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  />

                  {/* Hearts Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs flex items-center gap-1 z-10">
                    <FaHeart className="text-red-400" />
                    <span className="text-white font-semibold">{item.hearts || 123}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold text-[#F5F5F5] line-clamp-1" style={{ fontFamily: "'Lato', sans-serif" }}>{item.name}</h3>
                  <p className="text-sm text-[#B3B3B3] line-clamp-2 min-h-[40px]" style={{ fontFamily: "'Lato', sans-serif" }}>{item.description}</p>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-[#FFD369]">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </span>
                      {discount > 0 && originalPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">₹{Number(originalPrice).toFixed(2)}</span>
                          <span className="text-xs text-green-400 font-semibold">Save ₹{(originalPrice - item.price).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <motion.div 
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] rounded-full px-3 py-1.5 shadow-lg"
                        >
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                            onClick={() =>
                              qty > 1 ? updateQuantity(cartEntry._id, qty - 1) : removeFromCart(cartEntry._id)
                            }
                          >
                            <FaMinus className="text-xs" />
                          </motion.button>
                          <span className="px-2 text-white font-bold min-w-[20px] text-center">{qty}</span>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                            onClick={() => updateQuantity(cartEntry._id, qty + 1)}
                          >
                            <FaPlus className="text-xs" />
                          </motion.button>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(item, 1)}
                          className="bg-gradient-to-r from-[#FF4C29] to-[#FFD369] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Add To Cart
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mt-16"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/menu"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.4)] transition-all duration-300"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              <span>Explore Full Menu</span>
              <span className="text-xl">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default OurHomeMenu;
