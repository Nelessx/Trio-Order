import React, { useEffect, useState } from "react";
import { useCart } from "../../CartContext/CartContext";
import { FaFire, FaHeart, FaPlus, FaStar, FaTag, FaPercent } from "react-icons/fa";
import { HiMinus, HiPlus } from "react-icons/hi";
import FloatingParticle from "../FloatingParticle/FloatingParticle";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const SpecialOffer = () => {
  const [showAll, setShowAll] = useState(false);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, updateQuantity, removeFromCart, cartItems, API_BASE } = useCart();

  const buildImageUrl = (path) => {
    if (!path) return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNNjAgMTQwIEwxMDAgMTAwIEwxNDAgMTQwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
    return path.startsWith("http") ? path : `${API_BASE}/uploads/${String(path).replace(/^\/?uploads\//, "")}`;
  };

  useEffect(() => {
    const fetchSpecialOffers = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/special-offers/active`, { withCredentials: true });
        setSpecialOffers(response.data || []);
      } catch (err) {
        console.error('Error fetching special offers:', err);
        // Fallback to regular items if special offers fail
        try {
          const response = await axios.get(`${API_BASE}/api/items`, { withCredentials: true });
          setSpecialOffers(Array.isArray(response.data) ? response.data : response.data?.items ?? []);
        } catch (fallbackErr) {
          console.error('Error fetching fallback items:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialOffers();
  }, [API_BASE]);

  const displayList = Array.isArray(specialOffers) ? specialOffers.slice(0, showAll ? 8 : 4) : [];

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-b from-[#121212] to-[#1A1A1A] text-white py-16 px-4 font-[Inter]"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-h1 font-bold capitalize tracking-wide mb-4"
          >
            today's <span className="bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent">Special</span> Offers
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#B3B3B3]"
          >
            Loading amazing offers...
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-b from-[#121212] to-[#1A1A1A] text-white py-16 px-4 font-[Inter]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-14"
        >
          <h1 className="text-h1 font-bold capitalize tracking-wide">
            today's <span className="bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent">Special</span> Offers
          </h1>
          <p className="text-[#B3B3B3] mt-2 max-w-xl mx-auto text-body-lg">
            Savor the extraordinary with our culinary masterpieces crafted to perfection
          </p>
        </motion.div>

        {displayList.length === 0 ? (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="text-[#B3B3B3] text-xl mb-4">No special offers available at the moment</div>
            <div className="text-[#808080]">Check back soon for amazing deals!</div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {displayList.map((offer, index) => {
                // Handle both special offers and regular items
                const item = offer.item || offer; // If it's a special offer, use offer.item, otherwise use offer directly
                const cartItem = cartItems.find((ci) => ci.item._id === item._id);
                const qty = cartItem?.quantity || 0;
                const cartId = cartItem?._id;

                // Determine if this is a special offer or regular item
                const isSpecialOffer = offer.item && offer.discountedPrice;
                const displayPrice = isSpecialOffer ? offer.discountedPrice : item.price;
                const originalPrice = isSpecialOffer ? offer.originalPrice : null;
                const discountPercentage = isSpecialOffer ? offer.discountPercentage : null;

                return (
                  <motion.div 
                    key={offer._id}
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.9 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    whileHover={{ 
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    className="card-glass relative overflow-hidden group"
                  >
                    {/* Image Container - Centered and Properly Sized */}
                    <div className="relative h-56 bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] flex items-center justify-center p-4 overflow-hidden group">
                      {/* Special Offer Badge */}
                      {isSpecialOffer && (
                        <motion.div 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                          className="absolute top-3 left-3 bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1"
                        >
                          <FaTag />
                          {discountPercentage}% OFF
                        </motion.div>
                      )}
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs flex items-center gap-1 z-10">
                        <FaStar className="text-[#FFD369]" />
                        <span className="text-white font-semibold">{item.rating ?? "4"}</span>
                      </div>

                      {/* Image - Centered and Contained */}
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        src={buildImageUrl(offer.imageUrl || item.imageUrl || item.image)}
                        alt={offer.title || item.name}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl"
                      />

                      {/* Hearts Badge */}
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs flex items-center gap-1 z-10">
                        <FaHeart className="text-red-400" />
                        <span className="text-white font-semibold">{item.hearts ?? "123"}</span>
                      </div>
                    </div>

                    <div className="p-6 relative z-10 space-y-3">
                      <h3 className="text-h4 font-semibold text-[#F5F5F5]">{offer.title || item.name}</h3>
                      <p className="text-body-sm text-[#B3B3B3] line-clamp-2">
                        {offer.description || item.description}
                      </p>
                      
                      {/* Price Display */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          {isSpecialOffer && originalPrice ? (
                            <>
                              <span className="text-2xl font-bold text-[#FFD369]">
                                ₹{Number(displayPrice).toFixed(2)}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 line-through">₹{Number(originalPrice).toFixed(2)}</span>
                                <span className="text-xs text-green-400 font-semibold">Save ₹{Number(originalPrice - displayPrice).toFixed(2)}</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-[#FFD369]">₹{Number(displayPrice).toFixed(2)}</span>
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
                                onClick={() => (qty > 1 ? updateQuantity(cartId, qty - 1) : removeFromCart(cartId))}
                                className="text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                              >
                                <HiMinus className="text-xs" />
                              </motion.button>
                              <span className="px-2 text-white font-bold min-w-[20px] text-center">{qty}</span>
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(cartId, qty + 1)}
                                className="text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                              >
                                <HiPlus className="text-xs" />
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

                    <div className="p-3">
                      <div className="rounded-lg overflow-hidden">
                        <FloatingParticle />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {displayList.length > 4 && (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF4C29] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FaFire className="animate-pulse" />
              {showAll ? "Show Less" : "Show More"}
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SpecialOffer;
