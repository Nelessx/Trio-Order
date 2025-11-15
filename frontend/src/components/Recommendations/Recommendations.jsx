import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaHeart, FaPlus, FaMinus, FaShoppingCart, FaLightbulb, FaTimes } from 'react-icons/fa';
import { useCart } from '../../CartContext/CartContext';
import axios from 'axios';

const Recommendations = ({ cartItems, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const { addToCart, cartItems: contextCartItems, API_BASE } = useCart();
  
  // Use ref to track if we've already fetched for current cart state
  const hasFetchedRef = useRef(false);
  const currentCartLengthRef = useRef(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const cartLength = cartItems?.length || 0;
      
      // Don't fetch if no items
      if (cartLength === 0) {
        console.log('No cart items');
        setLoading(false);
        setRecommendations([]);
        hasFetchedRef.current = false;
        currentCartLengthRef.current = 0;
        return;
      }

      // Don't fetch if we already fetched for this cart length
      if (hasFetchedRef.current && currentCartLengthRef.current === cartLength) {
        console.log('Already fetched for', cartLength, 'items, skipping...');
        setLoading(false);
        return;
      }

      try {
        console.log('=== FETCHING RECOMMENDATIONS ===');
        setLoading(true);
        hasFetchedRef.current = false; // Mark as fetching
        
        // Extract item IDs from cart
        const itemIds = cartItems.map(item => item.item?._id || item.item).filter(Boolean);
        console.log('Cart item IDs:', itemIds);

        const response = await axios.post('http://localhost:4000/api/recommendations/get', {
          cartItems: itemIds
        });

        console.log('API Response:', response.data);

        if (response.data.success) {
          const recs = response.data.recommendations || [];
          console.log(`✅ Got ${recs.length} recommendations`);
          setRecommendations(recs);
          setIsFallback(response.data.fallback || false);
          
          // Mark as successfully fetched
          hasFetchedRef.current = true;
          currentCartLengthRef.current = cartLength;
        } else {
          console.warn('⚠️ API returned success: false');
          setRecommendations([]);
        }
      } catch (error) {
        console.error('❌ Error fetching recommendations:', error);
        console.error('Error details:', error.response?.data || error.message);
        setRecommendations([]);
        hasFetchedRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartItems?.length]); // Only depend on length

  const buildImageUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') 
      ? path 
      : `${API_BASE}/uploads/${String(path).replace(/^\/?uploads\//, '')}`;
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = contextCartItems.find(ci => 
      (ci.item._id || ci.item) === itemId
    );
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async (item) => {
    await addToCart(item._id);
  };

  if (!cartItems || cartItems.length === 0) {
    console.log('Recommendations: No cart items, not showing recommendations');
    return null;
  }
  
  console.log('Recommendations component mounted with', cartItems.length, 'cart items');

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 my-6"
      >
        <div className="flex items-center justify-center gap-3 text-[#FFD369]">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#FFD369] border-t-transparent"></div>
          <p style={{ fontFamily: "'Lato', sans-serif" }}>Finding perfect recommendations for you...</p>
        </div>
      </motion.div>
    );
  }

  if (recommendations.length === 0) {
    console.log('No recommendations received from API');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="backdrop-blur-xl bg-gradient-to-br from-[#FF4C29]/10 to-[#FFD369]/10 border border-[#FFD369]/30 rounded-3xl p-6 my-6 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD369]/20 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-2xl flex items-center justify-center shadow-lg">
            <FaLightbulb className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isFallback ? 'Popular Choices' : 'You Might Also Like'}
            </h3>
            <p className="text-[#B3B3B3] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
              {isFallback ? 'Customers favorite picks' : 'Based on your cart items'}
            </p>
          </div>
        </div>
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-[#B3B3B3] hover:text-[#FF4C29] transition-colors"
          >
            <FaTimes size={20} />
          </motion.button>
        )}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative z-10">
        <AnimatePresence>
          {recommendations.map((item, index) => {
            const quantityInCart = getItemQuantityInCart(item._id);
            
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#FFD369]/50 transition-all duration-300 shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.2)]"
              >
                {/* Image */}
                <div className="relative h-32 bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] flex items-center justify-center p-3">
                  <img
                    src={buildImageUrl(item.imageUrl || item.image)}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {item.discount > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        -{item.discount}%
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {item.rating && (
                      <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <FaStar className="text-[10px]" /> {item.rating}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <h4 className="text-[#F5F5F5] font-semibold text-sm truncate" style={{ fontFamily: "'Lato', sans-serif" }}>
                    {item.name}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#FFD369] font-bold text-lg" style={{ fontFamily: "'Lato', sans-serif" }}>
                        ₹{item.price}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-[#B3B3B3] text-xs line-through">
                          ₹{Math.round(item.price / (1 - item.discount / 100))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  {quantityInCart === 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 shadow-md"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      <FaShoppingCart className="text-xs" />
                      <span>Add</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 rounded-xl text-sm">
                      <FaShoppingCart className="text-xs" />
                      <span>In Cart ({quantityInCart})</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info badge */}
      {!isFallback && recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <p className="text-[#B3B3B3] text-xs" style={{ fontFamily: "'Lato', sans-serif" }}>
            💡 These items are frequently ordered together by our customers
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Recommendations;

