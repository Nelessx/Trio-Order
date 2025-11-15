import React, { useState } from 'react'
import { FiHeart, FiStar, FiUpload } from 'react-icons/fi';
import axios from 'axios'
import { FaRupeeSign } from 'react-icons/fa'
import { motion } from 'framer-motion';
import { useNotification, NotificationContainer } from './Notification';

const AddItems = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    rating: 0,
    hearts: 0,
    total: 0,
    image: null,
    preview: ''
  });

  const [categories] = useState([
    'Breakfast', 'Lunch', 'Salad', 'Snacks', 'Soups', 'Desserts', 'Drinks'
  ]);

  const [hoverRating, setHoverRating] = useState(0);
  const { notifications, hideNotification, showSuccess, showError } = useNotification();

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file)
      }))
    }
  };

  const handleRating = rating => setFormData(prev => ({ ...prev, rating }));
  const handleHearts = () => setFormData(prev => ({ ...prev, hearts: prev.hearts + 1 }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === 'preview') return;
        payload.append(key, val);
      });

      await axios.post(
        'http://localhost:4000/api/items',
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        rating: 0,
        hearts: 0,
        total: 0,
        image: null,
        preview: ''
      });

      showSuccess(
        'Item Added Successfully!',
        'New menu item has been created',
        'The item is now visible to customers.'
      );

    } catch (err) {
      console.log('Error uploading item', err.response || err.message);
      showError(
        'Failed to Add Item',
        err.response?.data?.message || err.message,
        'Please check your input and try again.'
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
    >
      <div className="w-full max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card-glass p-6 sm:p-8 lg:p-10 shadow-2xl"
        >
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xl sm:text-2xl lg:text-h2 font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent mb-6 sm:mb-8"
          >
            Add New Menu Item
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center mb-2"
            >
              <label className="cursor-pointer border-2 border-dashed border-[#FF4C29]/50 rounded-xl p-4 sm:p-6 flex justify-center items-center bg-white/5 hover:bg-white/10 hover:border-[#FF4C29] transition-all duration-300 w-full max-w-sm mx-auto h-48 sm:h-56 overflow-hidden group">
                {formData.preview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={formData.preview}
                      alt="Preview"
                      className="w-full h-full rounded-lg shadow-md object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Click to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <FiUpload className="text-5xl text-[#FF4C29] mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-[#B3B3B3] text-sm font-medium">
                      Click to upload product image
                    </p>
                    <p className="text-[#808080] text-xs mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  required
                />
              </label>
            </motion.div>

            {/* Product Name */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-[#B3B3B3] mb-2.5 font-semibold text-sm">Product Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter Product Name"
                required
              />
            </motion.div>

            {/* Description */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-[#B3B3B3] mb-2.5 font-semibold text-sm">Description <span className="text-red-400">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description (e.g., ingredients, taste, serving size)"
                className="input h-32 resize-none w-full"
                required
              />
            </motion.div>

            {/* Category */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-[#B3B3B3] mb-2.5 font-semibold text-sm">Category <span className="text-red-400">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input w-full cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Price */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-[#B3B3B3] mb-2.5 font-semibold text-sm">Price (₹) <span className="text-red-400">*</span></label>
              <div className="relative">
                <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FFD369] text-lg pointer-events-none z-10" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="0.00"
                  style={{ paddingLeft: '2.75rem' }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </motion.div>

            {/* Rating & Popularity */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
            >
              {/* Rating */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="block mb-3 text-[#B3B3B3] font-semibold text-sm">
                  Rating
                </label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <motion.button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-3xl transition-colors"
                    >
                      <FiStar
                        className={
                          star <= (hoverRating || formData.rating)
                            ? 'text-[#FFD369] fill-current'
                            : 'text-white/20'
                        }
                      />
                    </motion.button>
                  ))}
                  {formData.rating > 0 && (
                    <span className="ml-2 text-[#FFD369] font-semibold text-sm">
                      {formData.rating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Popularity */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="block mb-3 text-[#B3B3B3] font-semibold text-sm">
                  Popularity (Likes)
                </label>
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={handleHearts}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-3xl text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FiHeart />
                  </motion.button>
                  <input
                    type="number"
                    name="hearts"
                    value={formData.hearts}
                    onChange={handleInputChange}
                    className="input flex-1"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn-primary w-full py-3.5 text-base font-semibold mt-2"
            >
              Add To Menu
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onHide={hideNotification} 
      />
    </motion.div>
  )
}

export default AddItems
