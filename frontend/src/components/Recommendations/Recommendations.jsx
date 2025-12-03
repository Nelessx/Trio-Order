import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaShoppingCart,
  FaLightbulb,
  FaTimes,
  FaChartBar,
} from "react-icons/fa";
import { useCart } from "../../CartContext/CartContext";
import axios from "axios";

const Recommendations = ({ cartItems, onClose }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const { addToCart, cartItems: contextCartItems, API_BASE } = useCart();

  const hasFetchedRef = useRef(false);
  const currentCartLengthRef = useRef(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const cartLength = cartItems?.length || 0;

        if (cartLength === 0) {
          setLoading(false);
          setRecommendations([]);
          hasFetchedRef.current = false;
          currentCartLengthRef.current = 0;
          return;
        }

        if (
          hasFetchedRef.current &&
          currentCartLengthRef.current === cartLength
        ) {
          setLoading(false);
          return;
        }

        setLoading(true);
        hasFetchedRef.current = false;

        const itemIds = cartItems
          .map((item) => item.item?._id || item.item)
          .filter(Boolean);

        console.log("Sending cart items:", itemIds);

        const response = await axios.post(
          "http://localhost:4000/api/recommendations/get",
          {
            cartItems: itemIds,
          }
        );

        console.log("Recommendations response:", response.data);

        if (response.data.success) {
          const recs = response.data.recommendations || [];
          setRecommendations(recs);
          setIsFallback(response.data.fallback || false);
          hasFetchedRef.current = true;
          currentCartLengthRef.current = cartLength;
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
        hasFetchedRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartItems?.length]);

  const buildImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http")
      ? path
      : `${API_BASE}/uploads/${String(path).replace(/^\/?uploads\//, "")}`;
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = contextCartItems.find(
      (ci) => (ci.item._id || ci.item) === itemId
    );
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async (item) => {
    await addToCart(item._id);
  };

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 my-6"
      >
        <div className="flex items-center justify-center gap-3 text-[#FFD369]">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#FFD369] border-t-transparent"></div>
          <p style={{ fontFamily: "'Lato', sans-serif" }}>
            Finding perfect recommendations for you...
          </p>
        </div>
      </motion.div>
    );
  }

  if (recommendations.length === 0) {
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
            <h3
              className="text-2xl font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {isFallback ? "Popular Choices" : "You Might Also Like"}
            </h3>
            <p
              className="text-[#B3B3B3] text-sm"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              {isFallback
                ? "Customers favorite picks"
                : "Powered by Apriori Algorithm"}
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
                  <h4
                    className="text-[#F5F5F5] font-semibold text-sm truncate"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    {item.name}
                  </h4>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[#FFD369] font-bold text-lg"
                        style={{ fontFamily: "'Lato', sans-serif" }}
                      >
                        ₹{item.price}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-[#B3B3B3] text-xs line-through">
                          ₹{Math.round(item.price / (1 - item.discount / 100))}
                        </span>
                      )}
                    </div>
                  </div>

                  {/*  ALGORITHM METRICS SECTION */}
                  {!isFallback &&
                    item.confidence_percent !== undefined &&
                    item.support_percent !== undefined && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2 mt-3 p-3 bg-gradient-to-br from-[#FF4C29]/15 to-[#FFD369]/15 border border-[#FFD369]/40 rounded-xl"
                      >
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-2">
                          <FaChartBar className="text-[#FFD369] text-sm" />
                          <span
                            className="text-[#FFD369] font-bold text-xs uppercase tracking-wider"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                          >
                            Algorithm Metrics
                          </span>
                        </div>

                        {/* ===== METRIC 1: MATCH RATE (CONFIDENCE) ===== */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[#B3B3B3] text-xs font-semibold"
                              style={{ fontFamily: "'Lato', sans-serif" }}
                            >
                              Match Rate:
                            </span>
                            <span
                              className="text-[#FFD369] font-bold text-sm"
                              style={{ fontFamily: "'Lato', sans-serif" }}
                            >
                              {item.confidence_percent}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${item.confidence_percent}%`,
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-[#FF4C29] to-[#FFD369] rounded-full"
                            ></motion.div>
                          </div>

                          {/* Explanation */}
                          <p
                            className="text-[#B3B3B3] text-[11px] leading-tight mt-1.5"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                          >
                            <span className="text-[#FFD369] font-semibold block">
                            Confidence:
                            </span>
                            {item.confidence_percent}% of customers who bought{" "}
                            <span className="text-[#FFD369] font-bold">
                              {item.basedOn && item.basedOn.length > 0
                                ? item.basedOn[0]
                                : "similar items"}
                            </span>{" "}
                            also bought this
                          </p>
                        </div>

                        {/* ===== METRIC 2: POPULARITY (SUPPORT) ===== */}
                        <div className="space-y-1.5 border-t border-white/10 pt-2">
                          <div className="flex items-center justify-between">
                            <span
                              className="text-[#B3B3B3] text-xs font-semibold"
                              style={{ fontFamily: "'Lato', sans-serif" }}
                            >
                              Popularity:
                            </span>
                            <span
                              className="text-amber-400 font-bold text-sm"
                              style={{ fontFamily: "'Lato', sans-serif" }}
                            >
                              {item.support_percent}%
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${item.support_percent}%`,
                              }}
                              transition={{
                                duration: 1,
                                ease: "easeOut",
                                delay: 0.2,
                              }}
                              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                            ></motion.div>
                          </div>

                          {/* Explanation */}
                          <p
                            className="text-[#B3B3B3] text-[11px] leading-tight mt-1.5"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                          >
                            <span className="text-amber-400 font-semibold block">
                             Support:
                            </span>
                            This item combination appears in{" "}
                            {item.support_percent}% of all historical orders
                          </p>
                        </div>

                        {/* ===== METRIC 3: BASED ON (TRIGGER ITEMS) ===== */}
                        {item.basedOn && item.basedOn.length > 0 && (
                          <div className="space-y-1.5 border-t border-white/10 pt-2">
                            <span
                              className="text-[#B3B3B3] text-xs font-semibold block"
                              style={{ fontFamily: "'Lato', sans-serif" }}
                            >
                              Based on:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.basedOn.map((trigger, idx) => (
                                <motion.span
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    delay: 0.3 + idx * 0.1,
                                  }}
                                  className="bg-gradient-to-r from-[#FF4C29]/50 to-[#FFD369]/50 text-[#FFD369] text-[10px] px-2.5 py-1.5 rounded-full border border-[#FFD369]/60 font-bold shadow-lg"
                                  style={{ fontFamily: "'Lato', sans-serif" }}
                                >
                                  {trigger}
                                </motion.span>
                              ))}
                            </div>
                            <p
                              className="text-[#B3B3B3] text-[11px] leading-tight mt-1.5"
                              style={{ fontFamily: "'Lato', sans-serif" }}
                            >
                              Items in your cart that triggered this
                              recommendation
                            </p>
                          </div>
                        )}

                        
                      </motion.div>
                    )}
                  

                  {/* Add to Cart Button */}
                  {quantityInCart === 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 shadow-md mt-2"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      <FaShoppingCart className="text-xs" />
                      <span>Add to Cart</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-2 rounded-xl text-sm mt-2">
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
          <p
            className="text-[#B3B3B3] text-xs"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            💡 AI-powered recommendations using Apriori Algorithm to find
            frequent item combinations
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Recommendations;
