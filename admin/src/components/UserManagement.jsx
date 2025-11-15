import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiUser, FiMail, FiPhone, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingUsers, setTogglingUsers] = useState(new Set());
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0
  });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('Please login as admin first', 'error');
        return;
      }
      
      console.log('Fetching users with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:4000/api/user/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setUsers(data.users);
        setStats({
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          verifiedUsers: data.users.filter(user => user.isVerified).length
        });
      } else {
        console.error('Failed to fetch users:', data.message);
        showToast(`Failed to fetch users: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast(`Network error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('Please login as admin first', 'error');
        return;
      }
      
      // Add user to toggling set
      setTogglingUsers(prev => new Set(prev).add(userId));
      
      console.log('Toggling status for user:', userId);
      
      const response = await fetch('http://localhost:4000/api/user/toggle-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      
      console.log('Toggle response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle user status');
      }
      
      const data = await response.json();
      console.log('Toggle response data:', data);
      
      if (data.success) {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, isActive: data.isActive }
              : user
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          activeUsers: data.isActive ? prev.activeUsers + 1 : prev.activeUsers - 1
        }));
        
        // Show success message
        showToast(`User ${data.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
      } else {
        throw new Error(data.message || 'Failed to toggle user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      // Remove user from toggling set
      setTogglingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    fetchUsers();
    
    // Refresh data every 30 seconds to keep active status updated
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-amber-500/20">
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="text-4xl text-amber-400 animate-spin" />
            <span className="ml-4 text-xl text-amber-100">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-[calc(100%-2rem)]"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
              toast.type === 'success' 
                ? 'bg-green-600/90 text-white border-green-400' 
                : 'bg-red-600/90 text-white border-red-400'
            }`}>
              {toast.type === 'success' ? (
                <FiCheckCircle className="text-xl flex-shrink-0" />
              ) : (
                <FiXCircle className="text-xl flex-shrink-0" />
              )}
              <span className="font-semibold">{toast.message}</span>
              <button
                onClick={() => setToast({ visible: false, message: '', type: 'success' })}
                className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-amber-500/20"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-[#FF4C29] to-[#FF6B35] rounded-xl shadow-lg">
              <FiUsers className="text-xl sm:text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-amber-100/60 mt-1 text-sm sm:text-base">Manage and monitor your users</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchUsers}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <FiRefreshCw className="text-lg" />
            <span className="font-medium">Refresh</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FiUsers className="text-2xl text-blue-400" />
              </div>
              <div>
                <p className="text-blue-200/60 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-blue-300">{stats.totalUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FiCheckCircle className="text-2xl text-green-400" />
              </div>
              <div>
                <p className="text-green-200/60 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-green-300">{stats.activeUsers}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FiUser className="text-2xl text-purple-400" />
              </div>
              <div>
                <p className="text-purple-200/60 text-sm">Verified Users</p>
                <p className="text-2xl font-bold text-purple-300">{stats.verifiedUsers}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop Users Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#3a2b2b]/50">
              <tr>
                <th className="p-4 text-left text-amber-400 font-semibold">User</th>
                <th className="p-4 text-left text-amber-400 font-semibold">Contact</th>
                <th className="p-4 text-left text-amber-400 font-semibold">Status</th>
                <th className="p-4 text-left text-amber-400 font-semibold">Last Active</th>
                <th className="p-4 text-left text-amber-400 font-semibold">Joined</th>
                <th className="p-4 text-center text-amber-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <motion.tr 
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-amber-500/20 hover:bg-[#3a2b2b]/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-amber-100 font-medium">{user.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {user.isVerified ? (
                            <span className="flex items-center gap-1 text-xs text-green-400">
                              <FiCheckCircle className="text-xs" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-yellow-400">
                              <FiClock className="text-xs" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-100/80">
                        <FiMail className="text-sm" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-amber-100/80">
                          <FiPhone className="text-sm" />
                          <span className="text-sm">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        user.isCurrentlyActive 
                          ? 'bg-green-400 animate-pulse' 
                          : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        user.isCurrentlyActive ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {user.isCurrentlyActive ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-amber-100/80 text-sm">
                      {getTimeAgo(user.lastActive)}
                    </div>
                    <div className="text-amber-100/60 text-xs">
                      {formatDate(user.lastActive)}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-amber-100/80 text-sm">
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  
                  <td className="p-4 text-center">
                    <motion.button
                      whileHover={{ scale: togglingUsers.has(user._id) ? 1 : 1.05 }}
                      whileTap={{ scale: togglingUsers.has(user._id) ? 1 : 0.95 }}
                      onClick={() => !togglingUsers.has(user._id) && toggleUserStatus(user._id)}
                      disabled={togglingUsers.has(user._id)}
                      className={`p-3 rounded-xl transition-all font-medium ${
                        togglingUsers.has(user._id)
                          ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                          : user.isActive 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                      }`}
                      title={togglingUsers.has(user._id) ? 'Processing...' : (user.isActive ? 'Click to Deactivate User' : 'Click to Activate User')}
                    >
                      <div className="flex items-center gap-2">
                        {togglingUsers.has(user._id) ? (
                          <>
                            <FiRefreshCw className="text-lg animate-spin" />
                            <span className="text-sm">Processing...</span>
                          </>
                        ) : user.isActive ? (
                          <>
                            <FiXCircle className="text-lg" />
                            <span className="text-sm">Deactivate</span>
                          </>
                        ) : (
                          <>
                            <FiCheckCircle className="text-lg" />
                            <span className="text-sm">Activate</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="text-center py-12 text-amber-100/60 text-xl">
              No users found
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12 text-amber-100/60 text-xl">
              No users found
            </div>
          ) : (
            users.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#3a2b2b]/50 rounded-xl p-4 border border-amber-500/20 hover:bg-[#3a2b2b]/70 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-amber-100 font-medium text-base mb-1 truncate">{user.username}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      {user.isVerified ? (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <FiCheckCircle className="text-xs" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-400">
                          <FiClock className="text-xs" />
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${
                        user.isCurrentlyActive 
                          ? 'bg-green-400 animate-pulse' 
                          : 'bg-gray-400'
                      }`}></div>
                      <span className={`text-xs font-medium ${
                        user.isCurrentlyActive ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {user.isCurrentlyActive ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 border-t border-amber-500/20 pt-3">
                  <div className="flex items-center gap-2 text-amber-100/80 text-sm">
                    <FiMail className="text-sm flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-amber-100/80 text-sm">
                      <FiPhone className="text-sm flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="text-amber-100/60 text-xs">
                    <div className="mb-1">Last Active: {getTimeAgo(user.lastActive)}</div>
                    <div>Joined: {formatDate(user.createdAt)}</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !togglingUsers.has(user._id) && toggleUserStatus(user._id)}
                  disabled={togglingUsers.has(user._id)}
                  className={`w-full p-3 rounded-xl transition-all font-medium ${
                    togglingUsers.has(user._id)
                      ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                      : user.isActive 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {togglingUsers.has(user._id) ? (
                      <>
                        <FiRefreshCw className="text-lg animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </>
                    ) : user.isActive ? (
                      <>
                        <FiXCircle className="text-lg" />
                        <span className="text-sm">Deactivate</span>
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-lg" />
                        <span className="text-sm">Activate</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserManagement;
