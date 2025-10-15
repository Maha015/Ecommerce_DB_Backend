import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { LogOut, Package, Users, Truck, DollarSign, X, Search, TrendingUp, Filter, ChevronDown, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Mail, Bell, Download, Moon, Sun, Calendar, BarChart3, Award, Zap, TrendingDown, RefreshCw, FileText } from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(value * percentage));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

// Toast Notification
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl text-white font-medium shadow-lg transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }`;
  
  toast.innerHTML = `<span class="inline-flex items-center gap-2">
    <span class="text-xl">${icons[type]}</span>
    <span>${message}</span>
  </span>`;
  toast.style.transform = 'translateX(400px)';
  toast.style.opacity = '0';

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-gray-200 p-3 rounded-xl w-14 h-14"></div>
        <div className="bg-gray-200 w-5 h-5 rounded"></div>
      </div>
      <div className="bg-gray-200 h-4 w-24 mb-2 rounded"></div>
      <div className="bg-gray-200 h-8 w-16 mb-2 rounded"></div>
      <div className="bg-gray-200 h-6 w-20 rounded-full"></div>
    </div>
    <div className="h-1 bg-gray-200"></div>
  </div>
);

// Notification Panel Component
const NotificationPanel = ({ isOpen, onClose, activities }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-end z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mt-16 mr-4 max-h-[80vh] flex flex-col overflow-hidden animate-slide-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'order' ? 'bg-blue-100' :
                    activity.type === 'delivery' ? 'bg-green-100' :
                    'bg-yellow-100'
                  }`}>
                    {activity.type === 'order' && <Package className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'delivery' && <Truck className="w-4 h-4 text-green-600" />}
                    {activity.type === 'alert' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// All Orders Modal Component
const AllOrdersModal = ({ isOpen, onClose, allOrders, allAgents, onAssignOrder, assignLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState({});

  if (!isOpen) return null;

  const getDateFilteredOrders = (orders) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      if (dateFilter === 'today') {
        return orderDate >= today;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredOrders = getDateFilteredOrders(allOrders).filter(order => {
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAssign = (orderId, agentId) => {
    onAssignOrder(orderId, agentId);
    setSelectedAgent(prev => ({ ...prev, [orderId]: '' }));
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Email', 'Status', 'Amount', 'Date'];
    const rows = filteredOrders.map(order => [
      order._id?.slice(-8).toUpperCase(),
      order.customer?.name || 'Unknown',
      order.customer?.email || 'N/A',
      order.status,
      order.total?.toFixed(2),
      new Date(order.createdAt).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Orders exported successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">All Orders</h2>
            <p className="text-gray-600 text-sm mt-1">Manage and assign all customer orders</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-white rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateFilter('today')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateFilter === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white min-w-[180px]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {filteredOrders.length > 0 ? (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-bold text-gray-900">
                          #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{order.customer?.name || 'Unknown'}</span>
                        <span className="text-gray-400">•</span>
                        <span>{order.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{order.total?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={selectedAgent[order._id] || ''}
                            onChange={(e) => setSelectedAgent(prev => ({ ...prev, [order._id]: e.target.value }))}
                            className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                          >
                            <option value="">Select Delivery Agent</option>
                            {allAgents.map((agent) => (
                              <option key={agent._id} value={agent._id}>
                                {agent.name} {agent.status === 'available' ? '🟢' : agent.status === 'busy' ? '🟡' : '⚫'}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => handleAssign(order._id, selectedAgent[order._id])}
                          disabled={assignLoading[order._id] || !selectedAgent[order._id]}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 whitespace-nowrap"
                        >
                          {assignLoading[order._id] ? 'Assigning...' : 'Assign Order'}
                        </button>
                      </div>
                    </div>
                  )}

                  {order.deliveryAgent && order.status !== 'pending' && order.status !== 'confirmed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Assigned to:</span>
                        <span className="font-semibold text-gray-900">{order.deliveryAgent.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 font-medium">
              Showing <span className="text-gray-900 font-bold">{filteredOrders.length}</span> of <span className="text-gray-900 font-bold">{allOrders.length}</span> orders
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState({});
  const [showAllOrdersModal, setShowAllOrdersModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [loadingAllOrders, setLoadingAllOrders] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalAgents: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState({});

  // Calculate chart data from existing data
  const getRevenueChartData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString() && order.status === 'delivered';
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      last7Days.push({
        date: dateStr,
        revenue: Math.round(revenue * 100) / 100,
        orders: dayOrders.length
      });
    }
    
    return last7Days;
  };

  const getOrderStatusData = () => {
    const statusCount = {};
    allOrders.forEach(order => {
      const status = order.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.replace(/_/g, ' ').toUpperCase(),
      value: count
    }));
  };

  const getAgentPerformance = () => {
    return deliveryAgents.map(agent => {
      const agentOrders = allOrders.filter(order => 
        order.deliveryAgent?._id === agent._id || order.deliveryAgent?.name === agent.name
      );
      
      const completedOrders = agentOrders.filter(order => order.status === 'delivered').length;
      const totalAssigned = agentOrders.length;
      const completionRate = totalAssigned > 0 ? Math.round((completedOrders / totalAssigned) * 100) : 0;
      
      return {
        ...agent,
        completedOrders,
        totalAssigned,
        completionRate
      };
    });
  };

  const getRecentActivities = () => {
    const activities = [];
    
    recentOrders.slice(0, 5).forEach(order => {
      if (order.status === 'pending') {
        activities.push({
          type: 'order',
          message: `New order #${order._id?.slice(-8).toUpperCase()} from ${order.customer?.name}`,
          time: new Date(order.createdAt).toLocaleString()
        });
      } else if (order.status === 'delivered') {
        activities.push({
          type: 'delivery',
          message: `Order #${order._id?.slice(-8).toUpperCase()} delivered successfully`,
          time: new Date(order.createdAt).toLocaleString()
        });
      }
    });
    
    return activities;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, agentsResponse] = await Promise.all([
        apiService.getAdminDashboardStats(),
        apiService.getAllDeliveryAgents()
      ]);

      if (statsResponse?.success) {
        const { 
          totalOrders, 
          totalCustomers, 
          totalAgents, 
          totalRevenue,
          pendingOrders,
          deliveredOrders,
          recentOrders: orders,
          deliveryAgents: agents
        } = statsResponse.data;
        
        setDashboardStats({
          totalOrders,
          totalCustomers,
          totalAgents,
          totalRevenue,
          pendingOrders,
          deliveredOrders
        });
        
        setRecentOrders(orders || []);
        setDeliveryAgents(agents || []);
      }

      if (agentsResponse?.success) {
        setAllAgents(agentsResponse.data || []);
      }

    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllOrders = useCallback(async () => {
    try {
      setLoadingAllOrders(true);

      const response = await apiService.getAllOrders();
      
      if (response?.success) {
        setAllOrders(response.data || []);
      } else {
        throw new Error(response?.message || 'Failed to load all orders');
      }

    } catch (error) {
      console.error('❌ Failed to fetch all orders:', error);
      showToast('Failed to load all orders: ' + error.message, 'error');
    } finally {
      setLoadingAllOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchAllOrders();
    
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchAllOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchAllOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchAllOrders()]);
    showToast('Dashboard refreshed!', 'success');
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAssignOrder = async (orderId, agentId) => {
    if (!agentId) {
      showToast('Please select a delivery agent', 'warning');
      return;
    }

    try {
      setAssignLoading(prev => ({ ...prev, [orderId]: true }));
      
      const response = await apiService.assignOrderToAgent(orderId, agentId);
      
      if (response?.success) {
        showToast('Order assigned successfully!', 'success');
        fetchDashboardData();
        fetchAllOrders();
      } else {
        throw new Error(response?.message || 'Failed to assign order');
      }
      
    } catch (error) {
      console.error('Assign order error:', error);
      showToast('Failed to assign order: ' + error.message, 'error');
    } finally {
      setAssignLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const handleViewAllOrders = async () => {
    setShowAllOrdersModal(true);
    if (allOrders.length === 0) {
      await fetchAllOrders();
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading && recentOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && recentOrders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const agentPerformance = getAgentPerformance();
  const recentActivities = getRecentActivities();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-md border-b sticky top-0 z-40 backdrop-blur-lg bg-opacity-95`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SwiftShop Admin
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dashboard & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className={`p-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-xl transition-all ${refreshing ? 'animate-spin' : ''}`}
                title="Refresh Dashboard"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-xl transition-all`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-xl transition-all relative`}
                >
                  <Bell className="w-5 h-5" />
                  {recentActivities.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {recentActivities.length}
                    </span>
                  )}
                </button>
              </div>

              <div className={`text-right hidden sm:block ${darkMode ? 'text-gray-300' : ''}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back,</p>
                <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{logoutLoading ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading && recentOrders.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Orders</p>
                  <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    <AnimatedCounter value={dashboardStats.totalOrders} />
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      {dashboardStats.pendingOrders} pending
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Customers</p>
                  <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    <AnimatedCounter value={dashboardStats.totalCustomers} />
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Active users
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Delivery Agents</p>
                  <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    <AnimatedCounter value={dashboardStats.totalAgents} />
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {deliveryAgents.filter(a => a.status === 'available').length} available
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-xl">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Revenue</p>
                  <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    ₹<AnimatedCounter value={Math.floor(dashboardStats.totalRevenue)} />
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      {dashboardStats.deliveredOrders} delivered
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              </div>
            </div>

            {allOrders.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} p-6 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Trend</h3>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last 7 days performance</p>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={getRevenueChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="date" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                        <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: darkMode ? '#1F2937' : '#fff',
                            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: darkMode ? '#fff' : '#000'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 5 }} name="Revenue (₹)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} p-6 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-6 h-6 text-purple-600" />
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Status</h3>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distribution by status</p>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={getOrderStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getOrderStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: darkMode ? '#1F2937' : '#fff',
                            border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: darkMode ? '#fff' : '#000'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} p-6 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-between items-center`}>
                  <div>
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Latest customer orders</p>
                  </div>
                  <button 
                    onClick={handleViewAllOrders}
                    disabled={loadingAllOrders}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 text-sm"
                  >
                    {loadingAllOrders ? 'Loading...' : 'View All'}
                  </button>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order._id} className={`border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'} rounded-xl p-4 hover:shadow-md transition-all`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>#{order._id?.slice(-8).toUpperCase()}</p>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {order.status?.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </div>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                                <Users className="w-4 h-4" />
                                {order.customer?.name || 'Unknown Customer'}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1 mt-1`}>
                                <Clock className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{order.total?.toFixed(2)}</p>
                            </div>
                          </div>

                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                  <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <select
                                    value={selectedAgent[order._id] || ''}
                                    onChange={(e) => setSelectedAgent(prev => ({ ...prev, [order._id]: e.target.value }))}
                                    className={`w-full pl-10 pr-4 py-2 text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none`}
                                  >
                                    <option value="">Select Agent</option>
                                    {allAgents.map((agent) => (
                                      <option key={agent._id} value={agent._id}>
                                        {agent.name} {agent.status === 'available' ? '🟢' : agent.status === 'busy' ? '🟡' : '⚫'}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <button
                                  onClick={() => handleAssignOrder(order._id, selectedAgent[order._id])}
                                  disabled={assignLoading[order._id] || !selectedAgent[order._id]}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                                >
                                  {assignLoading[order._id] ? 'Assigning...' : 'Assign'}
                                </button>
                              </div>
                            </div>
                          )}

                          {order.deliveryAgent && order.status !== 'pending' && order.status !== 'confirmed' && (
                            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-2 text-sm">
                                <Truck className="w-4 h-4 text-blue-600" />
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Assigned to:</span>
                                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{order.deliveryAgent.name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Package className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No orders yet</p>
                      <p className="text-sm">Orders will appear here once customers place them</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-purple-50'} p-6 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delivery Agents</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Active delivery team members</p>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {agentPerformance.length > 0 ? (
                    <div className="grid gap-4">
                      {agentPerformance.map((agent) => {
                        let statusColor = "bg-gray-100 text-gray-700";
                        let dotColor = "bg-gray-400";
                        if (agent.status === "available") {
                          statusColor = "bg-green-100 text-green-700";
                          dotColor = "bg-green-500";
                        } else if (agent.status === "busy") {
                          statusColor = "bg-yellow-100 text-yellow-700";
                          dotColor = "bg-yellow-500";
                        } else if (agent.status === "offline") {
                          statusColor = "bg-gray-100 text-gray-700";
                          dotColor = "bg-gray-400";
                        }

                        return (
                          <div
                            key={agent._id}
                            className={`border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white'} rounded-xl p-4 hover:shadow-md transition-all`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-3 h-3 rounded-full ${dotColor} animate-pulse`}></div>
                                
                                <div className="flex-1">
                                  <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{agent.name}</p>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                                    <Mail className="w-3 h-3" />
                                    {agent.email}
                                  </p>
                                  {agent.phone && (
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                                      <MapPin className="w-3 h-3" />
                                      {agent.phone}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor}`}>
                                {agent.status
                                  ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
                                  : "Offline"}
                              </span>
                            </div>

                            {agent.totalAssigned > 0 && (
                              <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Performance</span>
                                  <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{agent.completionRate}%</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${agent.completionRate}%` }}
                                  ></div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {agent.completedOrders} completed
                                  </span>
                                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {agent.totalAssigned} assigned
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Truck className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No delivery agents</p>
                      <p className="text-sm">Add delivery agents to start managing orders</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        activities={recentActivities}
      />

      <AllOrdersModal
        isOpen={showAllOrdersModal}
        onClose={() => setShowAllOrdersModal(false)}
        allOrders={allOrders}
        allAgents={allAgents}
        onAssignOrder={handleAssignOrder}
        assignLoading={assignLoading}
      />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .bg-gray-750 {
          background-color: #1F2937;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#1F2937' : '#f1f1f1'};
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4B5563' : '#888'};
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6B7280' : '#555'};
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;