import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle, FiStar } from 'react-icons/fi';
import axios from 'axios';
import ConfirmationDialog from './ConfirmationDialog';

const ContactQueries = () => {
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 4000);
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:4000/api/contact/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setQueries(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
      showToast('Failed to fetch contact queries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQueryStatus = async (id, status, adminNotes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:4000/api/contact/${id}/status`, {
        status,
        adminNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showToast('Query status updated successfully', 'success');
        fetchQueries();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error updating query:', error);
      showToast('Failed to update query status', 'error');
    }
  };

  const deleteQueryClick = (id) => {
    const query = queries.find(q => q._id === id);
    setQueryToDelete(query);
    setShowDeleteDialog(true);
  };

  const deleteQueryConfirm = async () => {
    if (!queryToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:4000/api/contact/${queryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showToast('Query deleted successfully', 'success');
        fetchQueries();
        setShowDeleteDialog(false);
        setQueryToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting query:', error);
      showToast('Failed to delete query', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteQueryCancel = () => {
    setShowDeleteDialog(false);
    setQueryToDelete(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-500 bg-yellow-500/20';
      case 'in_progress': return 'text-blue-500 bg-blue-500/20';
      case 'resolved': return 'text-green-500 bg-green-500/20';
      case 'closed': return 'text-gray-500 bg-gray-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const filteredQueries = queries.filter(query => {
    if (filter === 'all') return true;
    return query.status === filter;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#FF4C29] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#242424] p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        <AnimatePresence>
          {toast.visible && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-20 right-4 sm:top-24 sm:right-6 z-50 max-w-[calc(100%-2rem)]"
            >
              <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
                toast.type === 'success' 
                  ? 'bg-green-600/90 text-white border-green-400' 
                  : 'bg-red-600/90 text-white border-red-400'
              }`}>
                {toast.type === 'success' ? (
                  <FiCheckCircle className="text-xl flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="text-xl flex-shrink-0" />
                )}
                <span className="font-semibold">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FF4C29] via-[#FF6B35] to-[#FFD369] bg-clip-text text-transparent mb-3">
            Contact Queries
          </h1>
          <p className="text-[#B3B3B3] text-sm sm:text-base">Manage customer queries and complaints</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B3B3B3] text-xs sm:text-sm font-medium mb-1">Total Queries</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total || 0}</p>
              </div>
              <FiEye className="text-2xl sm:text-3xl text-[#FF4C29] flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B3B3B3] text-xs sm:text-sm font-medium mb-1">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{stats.pending || 0}</p>
              </div>
              <FiClock className="text-2xl sm:text-3xl text-yellow-400 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B3B3B3] text-xs sm:text-sm font-medium mb-1">Resolved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats.resolved || 0}</p>
              </div>
              <FiCheckCircle className="text-2xl sm:text-3xl text-green-400 flex-shrink-0" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#B3B3B3] text-xs sm:text-sm font-medium mb-1">Urgent</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-400">{stats.urgent || 0}</p>
              </div>
              <FiStar className="text-2xl sm:text-3xl text-red-400 flex-shrink-0" />
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8"
        >
          {['all', 'pending', 'in_progress', 'resolved', 'closed'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(status)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg xl:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                filter === status
                  ? 'bg-gradient-to-r from-[#FF4C29] to-[#FF6B35] text-white shadow-md shadow-[#FF4C29]/25'
                  : 'bg-white/5 text-[#B3B3B3] hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </motion.button>
          ))}
        </motion.div>

        {/* Desktop Queries Table */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD369]">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD369]">Query</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD369]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD369]">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD369]">Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[#FFD369]">Actions</th>
                </tr>
              </thead>
            <tbody>
              {filteredQueries.map((query, index) => (
                <motion.tr
                  key={query._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{query.fullName}</p>
                      <p className="text-gray-400 text-sm">{query.email}</p>
                      <p className="text-gray-500 text-xs">{query.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-white text-sm truncate">{query.query}</p>
                      {query.dishName && (
                        <p className="text-gray-400 text-xs">Dish: {query.dishName}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                      {query.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(query.priority)}`}>
                      {query.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {formatDate(query.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSelectedQuery(query);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
                        title="View Details"
                      >
                        <FiEye className="text-lg" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteQueryClick(query._id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                        title="Delete Query"
                      >
                        <FiTrash2 className="text-lg" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        </motion.div>

        {/* Mobile Card View */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="md:hidden space-y-4"
        >
        {filteredQueries.map((query, index) => (
          <motion.div
            key={query._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-base mb-1 truncate">{query.fullName}</h3>
                <p className="text-gray-400 text-xs truncate">{query.email}</p>
                {query.phoneNumber && (
                  <p className="text-gray-500 text-xs mt-1">{query.phoneNumber}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}>
                  {query.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(query.priority)}`}>
                  {query.priority}
                </span>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-white text-sm line-clamp-2">{query.query}</p>
              {query.dishName && (
                <p className="text-gray-400 text-xs mt-1">Dish: {query.dishName}</p>
              )}
            </div>
            <div className="text-gray-400 text-xs mb-3">
              {formatDate(query.createdAt)}
            </div>
            <div className="flex gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedQuery(query);
                  setShowModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/30"
              >
                <FiEye />
                <span className="text-sm">View</span>
              </button>
              <button
                onClick={() => deleteQueryClick(query._id)}
                className="flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/30"
              >
                <FiTrash2 />
              </button>
            </div>
          </motion.div>
        ))}
          {filteredQueries.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-[#B3B3B3] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
            >
              <FiAlertCircle className="text-4xl text-[#B3B3B3] mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No queries found</p>
              <p className="text-sm mt-1">Try selecting a different filter</p>
            </motion.div>
          )}
        </motion.div>

        {/* Query Details Modal */}
        <AnimatePresence>
          {showModal && selectedQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF4C29] to-[#FFD369] bg-clip-text text-transparent">
                    Query Details
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowModal(false)}
                    className="text-[#B3B3B3] hover:text-white text-3xl transition-colors"
                  >
                    ×
                  </motion.button>
                </div>

                <div className="space-y-5">
                  <div>
                    <h3 className="text-[#FFD369] font-semibold mb-3 text-lg">Customer Information</h3>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 space-y-2.5 border border-white/10">
                      <p className="text-white"><span className="text-[#B3B3B3] font-medium">Name:</span> {selectedQuery.fullName}</p>
                      <p className="text-white"><span className="text-[#B3B3B3] font-medium">Email:</span> {selectedQuery.email}</p>
                      <p className="text-white"><span className="text-[#B3B3B3] font-medium">Phone:</span> {selectedQuery.phoneNumber}</p>
                      {selectedQuery.address && (
                        <p className="text-white"><span className="text-[#B3B3B3] font-medium">Address:</span> {selectedQuery.address}</p>
                      )}
                      {selectedQuery.dishName && (
                        <p className="text-white"><span className="text-[#B3B3B3] font-medium">Dish:</span> {selectedQuery.dishName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#FFD369] font-semibold mb-3 text-lg">Query</h3>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10">
                      <p className="text-white leading-relaxed">{selectedQuery.query}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#FFD369] font-semibold mb-3 text-lg">Status & Priority</h3>
                    <div className="flex gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedQuery.status)}`}>
                        {selectedQuery.status.replace('_', ' ')}
                      </span>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(selectedQuery.priority)}`}>
                        {selectedQuery.priority}
                      </span>
                    </div>
                  </div>

                  {selectedQuery.adminNotes && (
                    <div>
                      <h3 className="text-[#FFD369] font-semibold mb-3 text-lg">Admin Notes</h3>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10">
                        <p className="text-white leading-relaxed">{selectedQuery.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateQueryStatus(selectedQuery._id, 'in_progress')}
                      className="flex-1 px-4 py-3 bg-blue-500/90 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg shadow-blue-500/20"
                    >
                      Mark In Progress
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateQueryStatus(selectedQuery._id, 'resolved')}
                      className="flex-1 px-4 py-3 bg-green-500/90 hover:bg-green-500 text-white rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg shadow-green-500/20"
                    >
                      Mark Resolved
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateQueryStatus(selectedQuery._id, 'closed')}
                      className="flex-1 px-4 py-3 bg-gray-500/90 hover:bg-gray-500 text-white rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base shadow-lg shadow-gray-500/20"
                    >
                      Close Query
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={deleteQueryCancel}
          onConfirm={deleteQueryConfirm}
          title="Delete Contact Query"
          message={`Are you sure you want to delete the query from "${queryToDelete?.fullName || queryToDelete?.name}"? This action cannot be undone and the query will be permanently removed.`}
          confirmText="Delete Query"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeleting}
        />
      </div>
    </motion.div>
  );
};

export default ContactQueries;
