import React, { useEffect, useState } from "react";
import { styles } from "../assets/dummyadmin";
import { FiHeart, FiStar, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification, NotificationContainer } from './Notification';
import ConfirmationDialog from './ConfirmationDialog';

const List = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { notifications, hideNotification, showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get("http://localhost:4000/api/items");
        setItems(data);
      } catch (err) {
        console.error("Error fetching Items:", err);
        showError(
          'Failed to Load Items',
          'Unable to fetch menu items from the server',
          'Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // delete items
  const handleDeleteClick = (itemId) => {
    const item = items.find(i => i._id === itemId);
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:4000/api/items/${itemToDelete._id}`);
      setItems((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      showSuccess(
        'Item Deleted Successfully',
        'The menu item has been removed',
        'This item is no longer visible to customers.'
      );
      setShowDeleteDialog(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      showError(
        'Failed to Delete Item',
        err.response?.data?.message || err.message,
        'Please try again or contact support if the issue persists.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <FiStar
        className={`text-xl ${
          i < rating ? "text-amber-400 fill-current" : "text-amber-100/30"
        }`}
        key={i}
      />
    ));

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] flex items-center justify-center"
      >
        <div className="text-[#F5F5F5] text-2xl font-semibold">Loading Menu...</div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] py-6 sm:py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="card-glass p-4 sm:p-6 lg:p-8"
        >
          <motion.h2 
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl lg:text-h2 font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent mb-6 sm:mb-8"
          >
            Manage Menu Items
          </motion.h2>
          
          {/* Desktop Table View */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden md:block overflow-x-auto"
          >
            <table className="w-full">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Image</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Name</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Category</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Price</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Rating</th>
                  <th className="p-4 text-left text-[#FFD369] font-semibold">Hearts</th>
                  <th className="p-4 text-center text-[#FFD369] font-semibold">Delete</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-[#B3B3B3] text-xl">
                      No items found in the menu
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <motion.tr 
                      key={item._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-white/10 hover:bg-white/5 transition-all duration-300"
                    >
                      <td className="p-4">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg shadow-md"
                        />
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-[#F5F5F5] font-medium text-lg">{item.name}</p>
                          <p className="text-sm text-[#B3B3B3]">{item.description}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-[#FF4C29]/20 text-[#FF4C29] text-sm font-medium border border-[#FF4C29]/30">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-[#FFD369] font-semibold text-lg">₹{item.price}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {renderStars(item.rating)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-red-400">
                          <FiHeart className="text-xl" />
                          <span className="font-semibold">{item.hearts}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteClick(item._id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                        >
                          <FiTrash2 className="text-2xl" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Mobile Card View */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="md:hidden space-y-4"
          >
            {items.length === 0 ? (
              <div className="text-center py-12 text-[#B3B3B3] text-xl">
                No items found in the menu
              </div>
            ) : (
              items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex gap-4 mb-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[#F5F5F5] font-medium text-lg mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-[#B3B3B3] line-clamp-2 mb-2">{item.description}</p>
                      <span className="inline-block px-3 py-1 rounded-full bg-[#FF4C29]/20 text-[#FF4C29] text-xs font-medium border border-[#FF4C29]/30">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-[#B3B3B3] mb-1">Price</p>
                      <p className="text-[#FFD369] font-semibold">₹{item.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#B3B3B3] mb-1">Rating</p>
                      <div className="flex gap-1">
                        {renderStars(item.rating)}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#B3B3B3] mb-1">Hearts</p>
                      <div className="flex items-center gap-2 text-red-400">
                        <FiHeart className="text-lg" />
                        <span className="font-semibold">{item.hearts}</span>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(item._id)}
                        className="w-full text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10 border border-red-500/30"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <FiTrash2 className="text-lg" />
                          <span className="text-sm">Delete</span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onHide={hideNotification} 
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone and the item will be permanently removed from the menu.`}
        confirmText="Delete Item"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  );
};

export default List;
