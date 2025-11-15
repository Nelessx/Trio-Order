import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiTrendingUp, 
  FiTrendingDown,
  FiDollarSign,
  FiShoppingBag,
  FiPackage,
  FiRefreshCw,
  FiLoader,
  FiAlertCircle,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { styles } from '../assets/dummyadmin';

const Statistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePeriod, setActivePeriod] = useState('today');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:4000/api/orders/statistics', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStatistics(response.data.statistics);
      } else {
        throw new Error(response.data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FiLoader className="text-6xl text-amber-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-300 mb-2">Loading Statistics...</h2>
            <p className="text-amber-400/70">Please wait while we fetch your sales data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-8">
            <FiAlertCircle className="text-6xl text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-300 mb-2">Error Loading Statistics</h2>
            <p className="text-red-400/70 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <FiRefreshCw />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const currentStats = statistics[activePeriod];
  const periods = [
    { key: 'today', label: 'Today', icon: FiCalendar },
    { key: 'weekly', label: 'Last 7 Days', icon: FiBarChart2 },
    { key: 'monthly', label: 'This Month', icon: FiPieChart },
    { key: 'yearly', label: 'This Year', icon: FiTrendingUp }
  ];

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-900/20',
      processing: 'text-blue-400 bg-blue-900/20',
      preparing: 'text-orange-400 bg-orange-900/20',
      outForDelivery: 'text-purple-400 bg-purple-900/20',
      delivered: 'text-green-400 bg-green-900/20',
      cancelled: 'text-red-400 bg-red-900/20'
    };
    return colors[status] || 'text-amber-400 bg-amber-900/20';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      processing: 'Processing',
      preparing: 'Preparing',
      outForDelivery: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className={styles.cardContainer + " mb-6"}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className={styles.title + " text-left mb-2"}>Sales Statistics</h1>
              <p className="text-amber-400/70">Comprehensive sales analytics and insights</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Period Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {periods.map((period) => {
              const PeriodIcon = period.icon;
              const isActive = activePeriod === period.key;
              return (
                <button
                  key={period.key}
                  onClick={() => setActivePeriod(period.key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-[#3a2b2b]/50 border-amber-500/20 text-amber-400/70 hover:border-amber-500/50'
                  }`}
                >
                  <PeriodIcon className="text-2xl mb-2 mx-auto" />
                  <div className="text-sm font-medium">{period.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={styles.cardContainer + " p-6"}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-amber-400/70 text-sm">Total Orders</div>
              <FiShoppingBag className="text-amber-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-amber-300 mb-1">
              {currentStats.summary.totalOrders}
            </div>
            <div className="text-xs text-amber-400/60">
              {currentStats.label}
            </div>
          </div>

          <div className={styles.cardContainer + " p-6"}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-amber-400/70 text-sm">Total Revenue</div>
              <FiDollarSign className="text-green-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {formatCurrency(currentStats.summary.totalRevenue)}
            </div>
            <div className="text-xs text-amber-400/60">
              All orders (including pending)
            </div>
          </div>

          <div className={styles.cardContainer + " p-6"}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-amber-400/70 text-sm">Confirmed Revenue</div>
              <FiTrendingUp className="text-blue-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {formatCurrency(currentStats.summary.confirmedRevenue)}
            </div>
            <div className="text-xs text-amber-400/60">
              Only succeeded payments
            </div>
          </div>

          <div className={styles.cardContainer + " p-6"}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-amber-400/70 text-sm">Avg Order Value</div>
              <FiPackage className="text-purple-400 text-xl" />
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {formatCurrency(currentStats.summary.avgOrderValue)}
            </div>
            <div className="text-xs text-amber-400/60">
              Per order average
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Order Status Breakdown */}
          <div className={styles.cardContainer + " p-6"}>
            <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <FiBarChart2 /> Order Status Breakdown
            </h2>
            <div className="space-y-3">
              {Object.entries(currentStats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <div className="text-amber-300 font-semibold">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className={styles.cardContainer + " p-6"}>
            <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <FiPieChart /> Payment Status Breakdown
            </h2>
            <div className="space-y-3">
              {Object.entries(currentStats.paymentStatusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${
                      status === 'succeeded' ? 'text-green-400 bg-green-900/20' :
                      status === 'pending' ? 'text-yellow-400 bg-yellow-900/20' :
                      'text-red-400 bg-red-900/20'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <div className="text-amber-300 font-semibold">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className={styles.cardContainer + " p-6 mb-6"}>
          <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
            <FiBarChart2 /> Payment Method Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(currentStats.paymentMethodBreakdown).map(([method, count]) => (
              <div key={method} className="bg-[#3a2b2b]/50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-amber-300 mb-1">{count}</div>
                <div className="text-sm text-amber-400/70 capitalize">
                  {method === 'cod' ? 'Cash on Delivery' : method === 'online' ? 'Online Payment' : method}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Items */}
        {currentStats.topItems && currentStats.topItems.length > 0 && (
          <div className={styles.cardContainer + " p-6 mb-6"}>
            <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <FiTrendingUp /> Top Selling Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#3a2b2b]/50">
                    <th className="p-3 text-left text-amber-400">Rank</th>
                    <th className="p-3 text-left text-amber-400">Item Name</th>
                    <th className="p-3 text-center text-amber-400">Quantity</th>
                    <th className="p-3 text-center text-amber-400">Revenue</th>
                    <th className="p-3 text-center text-amber-400">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStats.topItems.map((item, index) => (
                    <tr key={index} className="border-b border-amber-500/10 hover:bg-[#3a2b2b]/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-amber-100 font-medium">{item.name}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-amber-300 font-semibold">{item.quantity}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-green-400 font-semibold">{formatCurrency(item.revenue)}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-blue-400 font-semibold">{item.orders}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daily Breakdown Chart */}
        {currentStats.dailyBreakdown && currentStats.dailyBreakdown.length > 0 && (
          <div className={styles.cardContainer + " p-6"}>
            <h2 className="text-xl font-bold text-amber-300 mb-4 flex items-center gap-2">
              <FiBarChart2 /> Daily Breakdown
              {activePeriod === 'today' && (
                <span className="text-sm text-amber-400/70 font-normal ml-2">(Today's Performance)</span>
              )}
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentStats.dailyBreakdown.map((day, index) => {
                const isToday = activePeriod === 'today';
                const isCurrentDay = new Date(day.date).toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={index} 
                    className={`bg-[#3a2b2b]/50 p-4 rounded-lg ${isToday || isCurrentDay ? 'border-2 border-amber-500/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-amber-300 font-medium">{formatDate(day.date)}</div>
                        {(isToday || isCurrentDay) && (
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-amber-400/70 text-sm">
                          Orders: <span className="text-amber-300 font-semibold">{day.orders}</span>
                        </div>
                        <div className="text-green-400/70 text-sm">
                          Revenue: <span className="text-green-300 font-semibold">{formatCurrency(day.revenue)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Progress bar for orders */}
                    {currentStats.summary.totalOrders > 0 ? (
                      <div className="w-full bg-[#2a1e14] rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${(day.orders / currentStats.summary.totalOrders) * 100}%` }}
                        ></div>
                      </div>
                    ) : (
                      <div className="w-full bg-[#2a1e14] rounded-full h-2">
                        <div className="bg-amber-500/20 h-2 rounded-full w-full"></div>
                      </div>
                    )}
                    {day.orders === 0 && (isToday || isCurrentDay) && (
                      <div className="mt-2 text-xs text-amber-400/60 italic">
                        No orders yet today
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;

