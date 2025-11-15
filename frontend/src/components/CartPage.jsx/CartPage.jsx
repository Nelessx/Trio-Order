import React, { useState } from "react";
import { useCart } from "../../CartContext/CartContext";
import { Link } from "react-router-dom";
import { FaMinus, FaPlus, FaTimes, FaTrash, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Recommendations from "../Recommendations/Recommendations";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, totalAmount, API_BASE } =
    useCart();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Debug: Log cart items to see structure
  console.log('CartPage cartItems:', cartItems);
  cartItems.forEach((ci, idx) => {
    console.log(`Cart item ${idx}:`, {
      _id: ci._id,
      hasItem: !!ci.item,
      itemId: ci.item?._id,
      itemName: ci.item?.name,
      itemPrice: ci.item?.price,
      quantity: ci.quantity
    });
  });

  const buildImageUrl = (path) => {
    if (!path) return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNNjAgMTQwIEwxMDAgMTAwIEwxNDAgMTQwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
    return path.startsWith("http")
      ? path
      : `${API_BASE}/uploads/${String(path).replace(/^\/?uploads\//, "")}`;
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  const getImageSrc = (item) => {
    const itemId = item._id;
    if (imageErrors.has(itemId)) {
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNNjAgMTQwIEwxMDAgMTAwIEwxNDAgMTQwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
    }
    return buildImageUrl(item.imageUrl || item.image);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#121212] via-[#1A1A1A] to-[#121212] py-20 px-5 md:px-20 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FF4C29]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD369]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Shopping Cart
          </h1>
          <p className="text-[#B3B3B3] text-lg" style={{ fontFamily: "'Lato', sans-serif" }}>
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center backdrop-blur-xl bg-white/5 border border-white/10 p-12 rounded-3xl shadow-lg"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingBag className="text-4xl text-white" />
            </div>
            <p className="text-xl text-[#F5F5F5] mb-6" style={{ fontFamily: "'Lato', sans-serif" }}>Your cart is empty</p>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/menu"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.4)] transition-all duration-300"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                <FaShoppingBag />
                <span>Start Shopping</span>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
        <>
          <div className="space-y-5">
            <AnimatePresence>
              {cartItems.map(({ _id, item, quantity }, index) => (
                <motion.div
                  key={_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col md:flex-row items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-3xl shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.2)] hover:border-[#FFD369]/30 transition-all duration-300"
                >
                  {/* Image */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="cursor-pointer w-24 h-24 flex-shrink-0 mb-4 md:mb-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e1e1e] to-[#2a2a2a] flex items-center justify-center p-2"
                    onClick={() => setSelectedImage(getImageSrc(item))}
                  >
                    <img
                      src={getImageSrc(item)}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={() => handleImageError(item._id)}
                    />
                  </motion.div>

                  {/* Item Info */}
                  <div className="flex-1 text-center md:text-left md:ml-6">
                    <h3 className="text-xl font-bold text-[#F5F5F5] mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                      {item.name}
                    </h3>
                    <p className="text-[#FFD369] font-semibold text-lg" style={{ fontFamily: "'Lato', sans-serif" }}>
                      ₹ {Number(item.price || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity + Price + Remove */}
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-4 md:mt-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] rounded-full px-4 py-2 shadow-lg">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          quantity > 1
                            ? updateQuantity(_id, quantity - 1)
                            : removeFromCart(_id)
                        }
                        className="text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                      >
                        <FaMinus className="text-sm" />
                      </motion.button>
                      <span className="text-lg font-bold text-white min-w-[30px] text-center" style={{ fontFamily: "'Lato', sans-serif" }}>
                        {quantity}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(_id, quantity + 1)}
                        className="text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-all"
                      >
                        <FaPlus className="text-sm" />
                      </motion.button>
                    </div>

                    {/* Total Price */}
                    <p className="text-xl font-bold text-[#FFD369] whitespace-nowrap min-w-[100px] text-center" style={{ fontFamily: "'Lato', sans-serif" }}>
                      ₹{Number((item.price || 0) * quantity).toFixed(2)}
                    </p>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(_id)}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:border-red-400/50 transition-all duration-300"
                      style={{ fontFamily: "'Lato', sans-serif" }}
                    >
                      <FaTrash />
                      <span className="hidden md:inline">Remove</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Recommendations Section */}
          <Recommendations cartItems={cartItems} />

          {/* Cart Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 flex flex-col md:flex-row justify-between items-center backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-lg"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/menu"
                className="inline-flex items-center gap-3 backdrop-blur-xl bg-white/10 border border-white/20 hover:border-[#FFD369]/50 text-[#F5F5F5] font-semibold px-6 py-3 rounded-2xl transition-all duration-300"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                <FaShoppingBag />
                <span>Continue Shopping</span>
              </Link>
            </motion.div>

            <div className="text-center md:text-right mt-6 md:mt-0 space-y-4">
              <div className="space-y-2">
                <p className="text-[#B3B3B3] text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>Total Amount</p>
                <h2 className="text-4xl font-bold text-[#FFD369]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ₹{Number(totalAmount).toFixed(2)}
                </h2>
              </div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/checkout"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF4C29] to-[#FFD369] hover:from-[#FF6B35] hover:to-[#FFD369] text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-[0_8px_32px_rgba(255,76,41,0.4)] transition-all duration-300"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  <span>Proceed to Checkout</span>
                  <FaArrowRight />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
      </div>

      {/* Premium Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative"
            >
              <img
                src={selectedImage}
                alt="Full View"
                className="max-w-[90vw] max-h-[85vh] rounded-3xl shadow-2xl border-2 border-[#FFD369]"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNNjAgMTQwIEwxMDAgMTAwIEwxNDAgMTQwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
                }}
              />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-[#FF4C29] to-[#FFD369] text-white rounded-full p-3 shadow-lg hover:shadow-xl"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
