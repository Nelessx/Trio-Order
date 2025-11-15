import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiClock, 
  FiTruck, 
  FiCheckCircle, 
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBox,
  FiShoppingBag,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiLoader,
  FiTrash2
} from 'react-icons/fi';
import { useNotification, NotificationContainer } from './Notification';
import ConfirmationDialog from './ConfirmationDialog';

const Order = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification system
  const { notifications, hideNotification, showSuccess, showError } = useNotification();

  // Status configuration
  const statusConfig = {
    pending: { 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-900/20', 
      icon: FiClock, 
      label: 'Pending' 
    },
    processing: { 
      color: 'text-blue-400', 
      bg: 'bg-blue-900/20', 
      icon: FiClock, 
      label: 'Processing' 
    },
    preparing: { 
      color: 'text-orange-400', 
      bg: 'bg-orange-900/20', 
      icon: FiClock, 
      label: 'Preparing' 
    },
    outForDelivery: { 
      color: 'text-purple-400', 
      bg: 'bg-purple-900/20', 
      icon: FiTruck, 
      label: 'On the Way' 
    },
    delivered: { 
      color: 'text-green-400', 
      bg: 'bg-green-900/20', 
      icon: FiCheckCircle, 
      label: 'Delivered' 
    },
    cancelled: { 
      color: 'text-red-400', 
      bg: 'bg-red-900/20', 
      icon: FiX, 
      label: 'Cancelled' 
    }
  };

  // Payment configuration
  const paymentConfig = {
    cod: { 
      label: 'Cash on Delivery', 
      class: 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/50' 
    },
    online: { 
      label: 'Online Payment', 
      class: 'bg-green-600/30 text-green-300 border border-green-500/50' 
    }
  };

  // Fetch orders with error handling
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:4000/api/orders/getall', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const formattedOrders = response.data.orders.map(order => ({
          ...order,
          createdAt: new Date(order.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          expectedDelivery: order.expectedDelivery ? (() => {
            const expectedDate = new Date(order.expectedDelivery);
            const now = new Date();
            const diffMinutes = Math.floor((expectedDate - now) / (1000 * 60));
            
            // If order is "On the Way" and expected delivery is within 30 minutes, show "within half an hour"
            if (order.status === 'outForDelivery' && diffMinutes <= 30 && diffMinutes > 0) {
              return `within ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
            } else if (order.status === 'outForDelivery' && diffMinutes <= 30) {
              return 'within half an hour';
            }
            // For other statuses or if time has passed, show the date
            return expectedDate.toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          })() : null,
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) : null,
        }));
        
        setOrders(formattedOrders);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle order deletion by admin
  const handleDeleteOrderClick = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  const handleDeleteOrderConfirm = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(`http://localhost:4000/api/orders/getall/${orderToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Remove order from local state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderToDelete._id));
        
        // Close modal if it's the deleted order
        if (selectedOrder && selectedOrder._id === orderToDelete._id) {
          closeModal();
        }
        
        showSuccess(
          'Order Deleted Successfully',
          'The order has been removed from the admin panel',
          'The customer\'s order history remains unchanged.'
        );
        setShowDeleteDialog(false);
        setOrderToDelete(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete order');
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      showError(
        'Failed to Delete Order',
        err.response?.data?.message || err.message,
        'Please try again or contact support if the issue persists.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteOrderCancel = () => {
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };

  // Handle status change with comprehensive error handling
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`http://localhost:4000/api/orders/getall/${orderId}`, {
        status: newStatus,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  status: newStatus,
                  expectedDelivery: response.data.order?.expectedDelivery ? (() => {
                    const expectedDate = new Date(response.data.order.expectedDelivery);
                    const now = new Date();
                    const diffMinutes = Math.floor((expectedDate - now) / (1000 * 60));
                    
                    // If order is "On the Way" and expected delivery is within 30 minutes, show "within half an hour"
                    if (newStatus === 'outForDelivery' && diffMinutes <= 30 && diffMinutes > 0) {
                      return `within ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
                    } else if (newStatus === 'outForDelivery' && diffMinutes <= 30) {
                      return 'within half an hour';
                    }
                    // For other statuses or if time has passed, show the date
                    return expectedDate.toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  })() : order.expectedDelivery,
                  deliveredAt: response.data.order?.deliveredAt ? new Date(response.data.order.deliveredAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }) : order.deliveredAt,
                } 
              : order
          )
        );
        
        // Update selected order if it's the one being updated
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            status: newStatus,
            expectedDelivery: response.data.order?.expectedDelivery ? (() => {
              const expectedDate = new Date(response.data.order.expectedDelivery);
              const now = new Date();
              const diffMinutes = Math.floor((expectedDate - now) / (1000 * 60));
              
              // If order is "On the Way" and expected delivery is within 30 minutes, show "within half an hour"
              if (newStatus === 'outForDelivery' && diffMinutes <= 30 && diffMinutes > 0) {
                return `within ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
              } else if (newStatus === 'outForDelivery' && diffMinutes <= 30) {
                return 'within half an hour';
              }
              // For other statuses or if time has passed, show the date
              return expectedDate.toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            })() : prev.expectedDelivery,
            deliveredAt: response.data.order?.deliveredAt ? new Date(response.data.order.deliveredAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }) : prev.deliveredAt,
          }));
        }
        
        // Show success notification
        const statusLabels = {
          pending: 'Pending',
          processing: 'Processing', 
          preparing: 'Preparing',
          outForDelivery: 'On the Way',
          delivered: 'Delivered',
          cancelled: 'Cancelled'
        };
        
        let message = `Order #${orderId.slice(-8)} is now: ${statusLabels[newStatus]}`;
        if (newStatus === 'outForDelivery') {
          message += '. Customer will receive a notification and can confirm delivery once they receive the order.';
        } else {
          message += '. The customer will see this update in their order history.';
        }
        showSuccess(
          'Order Status Updated!',
          message,
          newStatus === 'outForDelivery' 
            ? 'Customer will be notified and can mark the order as delivered after receiving it.'
            : 'The customer will see this update in their order history.'
        );
        
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      const errorMessage = err.response?.data?.message || err.message;
      let errorDetail = 'Please try again or contact support if the issue persists.';
      
      // Special handling for delivered status error
      if (errorMessage.includes('Admin cannot mark order as delivered')) {
        errorDetail = 'Only customers can mark orders as delivered after receiving them. Set status to "On the Way" to notify the customer.';
      }
      
      showError(
        'Failed to Update Order Status',
        errorMessage,
        errorDetail
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Open order details modal
  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Refresh orders
  const refreshOrders = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate total price for an order
  const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  };

  // Load orders on component mount and when refresh is triggered
  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="text-6xl text-amber-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-300 mb-2">Loading Orders...</h2>
          <p className="text-amber-400/70">Please wait while we fetch your order data</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FiAlertCircle className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-300 mb-2">Error Loading Orders</h2>
          <p className="text-red-400/70 mb-6">{error}</p>
          <button
            onClick={refreshOrders}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-amber-500/20">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Order Management System
            </h1>
            <p className="text-amber-400/70 text-sm sm:text-base lg:text-lg">Manage customer orders efficiently</p>
            <div className="hidden md:flex items-center justify-center gap-2 text-amber-400/60 text-sm mt-2">
              <span>💡</span>
              <span>Scroll horizontally to view all order details</span>
              <span>→</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-[#3a2b2b]/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-300">{orders.length}</div>
              <div className="text-amber-400/70 text-sm">Total Orders</div>
            </div>
            <div className="bg-[#3a2b2b]/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">
                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
              </div>
              <div className="text-amber-400/70 text-sm">Active Orders</div>
            </div>
            <div className="bg-[#3a2b2b]/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-amber-400/70 text-sm">Delivered</div>
            </div>
            <div className="bg-[#3a2b2b]/50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-400">
                {orders.filter(o => o.status === 'cancelled').length}
              </div>
              <div className="text-amber-400/70 text-sm">Cancelled</div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#3a2b2b]/50 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-[#3a2b2b]/50 border border-amber-500/20 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition-all min-w-[150px]"
              >
                <option value="all" className="bg-[#3a2b2b]">All Status</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key} className="bg-[#3a2b2b]">
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={refreshOrders}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>

          {/* Desktop Orders Table */}
          <div className="hidden lg:block overflow-x-auto relative">
            {/* Scroll Indicators */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/10 to-transparent w-4 h-full pointer-events-none z-10"></div>
            <div className="absolute bottom-0 right-0 bg-gradient-to-l from-amber-500/10 to-transparent w-4 h-full pointer-events-none z-10"></div>
            
            <div className="relative">
              {/* Custom Scrollbar Styling */}
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  height: 12px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #3a2b2b;
                  border-radius: 6px;
                  border: 1px solid #4a3b3b;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: linear-gradient(90deg, #f59e0b, #d97706);
                  border-radius: 6px;
                  border: 1px solid #b45309;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: linear-gradient(90deg, #d97706, #b45309);
                  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-corner {
                  background: #3a2b2b;
                }
              `}</style>
              
              <table className="w-full min-w-[1200px] custom-scrollbar">
                <thead>
                  <tr className="bg-[#3a2b2b]/50">
                    <th className="p-4 text-left text-amber-400 w-32">Order ID</th>
                    <th className="p-4 text-left text-amber-400 w-48">Customer</th>
                    <th className="p-4 text-left text-amber-400 w-40">Contact</th>
                    <th className="p-4 text-left text-amber-400 w-48">Address</th>
                    <th className="p-4 text-center text-amber-400 w-32">Total</th>
                    <th className="p-4 text-left text-amber-400 w-48">Status</th>
                    <th className="p-4 text-left text-amber-400 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center">
                        <div className="text-amber-400/70">
                          <FiBox className="text-4xl mx-auto mb-2" />
                          <p className="text-lg">No orders found</p>
                          <p className="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusInfo = statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = statusInfo.icon;
                      const totalPrice = calculateTotalPrice(order.items);
                      
                      return (
                        <tr key={order._id} className="border-b border-amber-500/10 hover:bg-[#3a2b2b]/30 transition-colors">
                          <td className="p-4">
                            <div className="font-mono text-amber-300 text-sm">
                              #{order._id.slice(-8)}
                            </div>
                            <div className="text-xs text-amber-400/60">
                              {order.createdAt}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FiUser className="text-amber-400" />
                              <div>
                                <div className="text-amber-100 font-medium">
                                  {order.firstName} {order.lastName}
                                </div>
                                <div className="text-xs text-amber-400/60">
                                  {order.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FiPhone className="text-amber-400" />
                              <span className="text-amber-100 text-sm">{order.phone}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-start gap-2">
                              <FiMapPin className="text-amber-400 mt-1 flex-shrink-0" />
                              <div className="text-amber-100 text-sm">
                                <div className="truncate max-w-[200px]" title={order.address}>
                                  {order.address}
                                </div>
                                <div className="text-xs text-amber-400/60">
                                  {order.city} - {order.zipCode}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <FiBox className="text-amber-400" />
                              <span className="text-amber-300 text-lg font-medium">
                                ₹{totalPrice.toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-2">
                              {/* Current Status Display */}
                              <div className="flex items-center gap-2">
                                <span className={`${statusInfo.color} text-lg`}>
                                  <StatusIcon />
                                </span>
                                <span className={`${statusInfo.color} text-sm font-medium`}>
                                  {statusInfo.label}
                                </span>
                              </div>
                              
                              
                              
                              {/* Delivery Information */}
                              {order.expectedDelivery && (
                                <div className="text-xs text-amber-400/80 bg-amber-900/10 px-2 py-1 rounded">
                                  <FiCalendar className="inline mr-1" />
                                  Expected: {order.expectedDelivery}
                                </div>
                              )}
                              {order.deliveredAt && (
                                <div className="text-xs text-green-400/80 bg-green-900/10 px-2 py-1 rounded">
                                  <FiCalendar className="inline mr-1" />
                                  Delivered: {order.deliveredAt}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <div className="relative">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                  disabled={updatingStatus === order._id || order.status === 'delivered'}
                                  className={`w-full px-3 py-2 rounded-lg ${statusInfo.bg} ${statusInfo.color} border border-amber-500/20 text-sm cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                                >
                                  <option value="pending" className="bg-yellow-900/20 text-yellow-400">Pending</option>
                                  <option value="processing" className="bg-blue-900/20 text-blue-400">Processing</option>
                                  <option value="preparing" className="bg-orange-900/20 text-orange-400">Preparing</option>
                                  <option value="outForDelivery" className="bg-purple-900/20 text-purple-400">On the Way</option>
                                  {order.status === 'delivered' && (
                                    <option value="delivered" className="bg-green-900/20 text-green-400">Delivered (Confirmed by Customer)</option>
                                  )}
                                  <option value="cancelled" className="bg-red-900/20 text-red-400">Cancelled</option>
                                </select>
                                {updatingStatus === order._id && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                    <div className="text-amber-400 text-xs">Updating...</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openOrderDetails(order)}
                                  className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FiEye />
                                </button>
                                {(order.status === 'delivered' || order.status === 'cancelled') && (
                                  <button
                                    onClick={() => handleDeleteOrderClick(order._id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete Order"
                                  >
                                    <FiTrash2 />
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 mt-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-amber-400/70">
                <FiBox className="text-4xl mx-auto mb-2" />
                <p className="text-lg">No orders found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;
                const totalPrice = calculateTotalPrice(order.items);
                
                return (
                  <div
                    key={order._id}
                    className="bg-[#3a2b2b]/50 rounded-xl p-4 border border-amber-500/20 hover:bg-[#3a2b2b]/70 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-amber-300 text-sm font-semibold mb-1">
                          #{order._id.slice(-8)}
                        </div>
                        <div className="text-xs text-amber-400/60 mb-2">{order.createdAt}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className={`${statusInfo.color} text-base`} />
                          <span className={`${statusInfo.color} text-sm font-medium`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <FiBox className="text-amber-400 text-sm" />
                          <span className="text-amber-300 font-semibold">
                            ₹{totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-amber-400 text-sm flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-amber-100 font-medium text-sm truncate">
                            {order.firstName} {order.lastName}
                          </div>
                          <div className="text-xs text-amber-400/60 truncate">
                            {order.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-amber-400 text-sm flex-shrink-0" />
                        <span className="text-amber-100 text-sm">{order.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FiMapPin className="text-amber-400 text-sm mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-amber-100 text-xs line-clamp-2">
                            {order.address}
                          </div>
                          <div className="text-xs text-amber-400/60">
                            {order.city} - {order.zipCode}
                          </div>
                        </div>
                      </div>
                    </div>

                    {order.expectedDelivery && (
                      <div className="text-xs text-amber-400/80 bg-amber-900/10 px-2 py-1 rounded mb-2">
                        <FiCalendar className="inline mr-1" />
                        Expected: {order.expectedDelivery}
                      </div>
                    )}
                    {order.deliveredAt && (
                      <div className="text-xs text-green-400/80 bg-green-900/10 px-2 py-1 rounded mb-2">
                        <FiCalendar className="inline mr-1" />
                        Delivered: {order.deliveredAt}
                      </div>
                    )}

                    <div className="space-y-2 pt-3 border-t border-amber-500/20">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingStatus === order._id}
                          className={`w-full px-3 py-2 rounded-lg ${statusInfo.bg} ${statusInfo.color} border border-amber-500/20 text-sm cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all`}
                        >
                          <option value="pending" className="bg-yellow-900/20 text-yellow-400">Pending</option>
                          <option value="processing" className="bg-blue-900/20 text-blue-400">Processing</option>
                          <option value="preparing" className="bg-orange-900/20 text-orange-400">Preparing</option>
                          <option value="outForDelivery" className="bg-purple-900/20 text-purple-400">Out for Delivery</option>
                          <option value="delivered" className="bg-green-900/20 text-green-400">Delivered</option>
                          <option value="cancelled" className="bg-red-900/20 text-red-400">Cancelled</option>
                        </select>
                        {updatingStatus === order._id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <div className="text-amber-400 text-xs">Updating...</div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="flex-1 flex items-center justify-center gap-2 p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 rounded-lg transition-colors border border-amber-500/30"
                        >
                          <FiEye />
                          <span className="text-sm">View</span>
                        </button>
                        {(order.status === 'delivered' || order.status === 'cancelled') && (
                          <button
                            onClick={() => handleDeleteOrderClick(order._id)}
                            className="flex items-center justify-center gap-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors border border-red-500/30"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#4b3b3b] rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-300">
                  Order Details - #{selectedOrder._id.slice(-8)}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-amber-400 hover:text-amber-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                    <FiUser /> Customer Information
                  </h4>
                  <div className="bg-[#3a2b2b]/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-amber-400" />
                      <span className="text-amber-100 font-medium">
                        {selectedOrder.firstName} {selectedOrder.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail className="text-amber-400" />
                      <span className="text-amber-100">{selectedOrder.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-amber-400" />
                      <span className="text-amber-100">{selectedOrder.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FiMapPin className="text-amber-400 mt-1" />
                      <div className="text-amber-100">
                        <div className="font-medium">Delivery Address:</div>
                        <div>{selectedOrder.address}</div>
                        <div>{selectedOrder.city} - {selectedOrder.zipCode}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                    <FiBox /> Order Information
                  </h4>
                  <div className="bg-[#3a2b2b]/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-amber-400">Order ID:</span>
                      <span className="text-amber-100 font-mono">#{selectedOrder._id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400">Order Date:</span>
                      <span className="text-amber-100">{selectedOrder.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400">Current Status:</span>
                      <span className={`${statusConfig[selectedOrder.status]?.color} font-medium`}>
                        {statusConfig[selectedOrder.status]?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400">Payment Method:</span>
                      <span className="text-amber-100">
                        {paymentConfig[selectedOrder.paymentMethod?.toLowerCase()]?.label || 'Online Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400">Payment Status:</span>
                      <span className={`${statusConfig[selectedOrder.paymentStatus]?.color || 'text-amber-400'}`}>
                        {selectedOrder.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    {selectedOrder.expectedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-amber-400">Expected Delivery:</span>
                        <span className="text-amber-100">{selectedOrder.expectedDelivery}</span>
                      </div>
                    )}
                    {selectedOrder.deliveredAt && (
                      <div className="flex justify-between">
                        <span className="text-amber-400">Delivered At:</span>
                        <span className="text-amber-100">{selectedOrder.deliveredAt}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                  <FiShoppingBag /> Order Items ({selectedOrder.items.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-[#3a2b2b]/50 p-4 rounded-lg flex items-center gap-4 hover:bg-[#3a2b2b]/70 transition-colors border border-amber-500/10">
                      <div className="relative">
                        <img
                          src={item.item.imageUrl ? 
                            (item.item.imageUrl.startsWith('http') ? 
                              item.item.imageUrl : 
                              `http://localhost:4000${item.item.imageUrl}`) : 
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNNjAgMTQwIEwxMDAgMTAwIEwxNDAgMTQwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"
                          }
                          alt={item.item.name}
                          className="w-16 h-16 object-cover rounded-lg border border-amber-500/20"
                          onError={(e) => {
                            console.log('Modal image failed to load:', e.target.src);
                            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMyYTJhMmEiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjM2EzYTNhIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMiIgcng9IjgiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiM2NjYiLz48cGF0aCBkPSJNNjAgMTQwIEwxMDAgMTAwIEwxNDAgMTQwIiBzdHJva2U9IiM2NjYiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iMTAwIiB5PSIxNzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
                          }}
                        />
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#2a1e14]">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-amber-100 font-medium text-lg">{item.item.name}</h5>
                        <div className="flex items-center gap-4 text-sm text-amber-400/80 mt-1">
                          <span className="bg-amber-900/20 px-2 py-1 rounded">₹{item.item.price.toFixed(2)}</span>
                          <span className="text-amber-300">×</span>
                          <span className="bg-blue-900/20 px-2 py-1 rounded">{item.quantity}</span>
                          <span className="text-amber-300">=</span>
                          <span className="text-amber-200 font-bold text-base">
                            ₹{(item.item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mt-6 bg-[#3a2b2b]/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-amber-300 mb-4">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-amber-400">Subtotal:</span>
                    <span className="text-amber-100">₹{selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400">Tax:</span>
                    <span className="text-amber-100">₹{selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400">Shipping:</span>
                    <span className="text-amber-100">₹{selectedOrder.shipping?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between border-t border-amber-500/20 pt-2">
                    <span className="text-amber-300 font-semibold">Total:</span>
                    <span className="text-amber-200">₹{selectedOrder.total?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-amber-300 mb-4">Update Order Status</h4>
                <div className="bg-[#3a2b2b]/50 p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-amber-400">Current Status:</span>
                    <div className="flex items-center gap-2">
                      <span className={`${statusConfig[selectedOrder.status]?.color} text-lg`}>
                        {React.createElement(statusConfig[selectedOrder.status]?.icon)}
                      </span>
                      <span className={`${statusConfig[selectedOrder.status]?.color} font-medium`}>
                        {statusConfig[selectedOrder.status]?.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-amber-400 text-sm font-medium">
                      Change Status To:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                        disabled={updatingStatus === selectedOrder._id || selectedOrder.status === 'delivered'}
                        className="w-full px-4 py-3 bg-[#2a1e14]/50 border border-amber-500/20 rounded-lg text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 transition-all"
                      >
                        <option value="pending" className="bg-yellow-900/20 text-yellow-400">
                          🟡 Pending - Order received, awaiting processing
                        </option>
                        <option value="processing" className="bg-blue-900/20 text-blue-400">
                          🔵 Processing - Order being prepared
                        </option>
                        <option value="preparing" className="bg-orange-900/20 text-orange-400">
                          🟠 Preparing - Food being cooked
                        </option>
                        <option value="outForDelivery" className="bg-purple-900/20 text-purple-400">
                          🟣 On the Way - Order served to delivery boy, notification sent to customer
                        </option>
                        {selectedOrder.status === 'delivered' && (
                          <option value="delivered" className="bg-green-900/20 text-green-400">
                            🟢 Delivered - Confirmed by customer
                          </option>
                        )}
                        <option value="cancelled" className="bg-red-900/20 text-red-400">
                          🔴 Cancelled - Order cancelled
                        </option>
                      </select>
                      {updatingStatus === selectedOrder._id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                          <div className="text-amber-400 text-sm">Updating status...</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-amber-400/60 bg-amber-900/10 p-2 rounded">
                      💡 <strong>Customer Notification:</strong> When you change the status, the customer will automatically see the update in their order history page.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        onHide={hideNotification} 
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteOrderCancel}
        onConfirm={handleDeleteOrderConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete order #${orderToDelete?._id?.slice(-6)}? This will remove it from the admin panel but won't affect the customer's order history.`}
        confirmText="Delete Order"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Order;