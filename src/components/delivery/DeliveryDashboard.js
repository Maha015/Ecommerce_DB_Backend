import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, Clock, CheckCircle, MapPin, Star, Truck, DollarSign, 
  TrendingUp, Phone, User, LogOut, Navigation, Activity, AlertCircle, 
  Search, Bell, Menu, X, Sun, Moon, Award, Target
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalDeliveries: 0,
    todayDeliveries: 0,
    earnings: 0,
    rating: 0,
    assignedOrders: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAvailable, setIsAvailable] = useState('available');
  const [statusLoading, setStatusLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [weeklyDeliveries, setWeeklyDeliveries] = useState(0);

  useEffect(() => {
    const loadAgentProfile = async () => {
      try {
        console.log('👤 Loading agent profile...');
        const response = await api.getAgentProfile();
        
        if (response?.success && response.data) {
          const agentStatus = response.data.status || 'available';
          setIsAvailable(agentStatus);
          console.log('✅ Agent profile loaded:', { status: agentStatus });
        }
      } catch (error) {
        console.error('❌ Failed to load agent profile:', error);
        setIsAvailable('available');
      }
    };
    
    if (user?.role === 'delivery_agent') {
      loadAgentProfile();
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) {
        setLoading(false);
        return;
      }

      if (user.role !== 'delivery_agent') {
        setError('Access denied: Delivery agent role required');
        setLoading(false);
        return;
      }
      
      const statsResponse = await api.getDashboardStats('delivery_agent');

      if (statsResponse.success && statsResponse.data) {
        setDashboardData({
          totalDeliveries: statsResponse.data.totalDeliveries || 0,
          todayDeliveries: statsResponse.data.todayDeliveries || 0,
          earnings: statsResponse.data.earnings || 0,
          rating: statsResponse.data.rating || 4.5,
          assignedOrders: statsResponse.data.assignedOrders || [],
          recentOrders: statsResponse.data.recentOrders || []
        });
        setWeeklyDeliveries(statsResponse.data.weeklyDeliveries || 0);
      } else {
        setDashboardData({
          totalDeliveries: 25,
          todayDeliveries: 3,
          earnings: 1250,
          rating: 4.5,
          assignedOrders: [],
          recentOrders: []
        });
        setWeeklyDeliveries(10);
      }

    } catch (err) {
      console.error('❌ Error fetching delivery dashboard data:', err);
      setError(`Failed to load dashboard: ${err.message}`);
      
      setDashboardData({
        totalDeliveries: 0,
        todayDeliveries: 0,
        earnings: 0,
        rating: 0,
        assignedOrders: [],
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [fetchDashboardData, user]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const result = await logout();
      
      if (result && result.success) {
        setDashboardData({
          totalDeliveries: 0,
          todayDeliveries: 0,
          earnings: 0,
          rating: 0,
          assignedOrders: [],
          recentOrders: []
        });
        setError('');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log(`📦 Updating order ${orderId} to status: ${newStatus}`);
      
      const response = await api.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        console.log('✅ Order status updated successfully');
        await fetchDashboardData();
      } else {
        setError('Failed to update order status');
      }
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      setError('Error updating order status');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      const newIsOnline = newStatus !== 'offline';
      
      const response = await api.updateMyAgentStatus(newStatus, newIsOnline);
      
      if (response?.success) {
        setIsAvailable(newStatus);
        console.log('✅ Status updated successfully to:', newStatus);
      } else {
        throw new Error(response?.error || 'Failed to update status');
      }
      
    } catch (error) {
      console.error('❌ Status change error:', error);
      alert('Failed to update status: ' + error.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'picked_up': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'out_for_delivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAgentStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredOrders = dashboardData.assignedOrders?.filter(order => {
    const matchesSearch = order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order._id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 border-t-blue-600 mx-auto mb-4"></div>
            <Truck className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 text-lg font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'delivery_agent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-6">Delivery agent access required.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 border-gray-100'} backdrop-blur-xl border-b sticky top-0 z-50 shadow-lg`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Delivery Dashboard
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Manage deliveries efficiently
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>

              <div className="hidden sm:flex items-center space-x-3">
                <User className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <div className="text-right">
                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || 'Delivery Agent'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Agent ID: {user?.id?.slice(-6) || 'N/A'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[89px] h-[calc(100vh-89px)] w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/90 border-gray-100'} backdrop-blur-xl border-r transition-transform duration-300 z-40 overflow-y-auto`}>
          <div className="p-6 space-y-6">
            {/* Profile Card */}
            <div className={`text-center p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'Delivery Agent'}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                Delivery Professional
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(isAvailable)} animate-pulse`}></div>
                <span className={`text-sm font-semibold capitalize ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isAvailable}
                </span>
              </div>
            </div>

            {/* Status Controls */}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wide mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Quick Status
              </h4>
              <div className="space-y-2">
                {['available', 'busy', 'offline'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={statusLoading || isAvailable === status}
                    className={`w-full flex items-center space-x-3 p-3.5 rounded-xl transition-all font-medium ${
                      isAvailable === status
                        ? status === 'available' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : status === 'busy' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                        : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      status === 'available' ? 'bg-green-400' :
                      status === 'busy' ? 'bg-orange-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="capitalize">{status}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-yellow-50 to-orange-50'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wide mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Quick Stats
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Today's Deliveries</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dashboardData.todayDeliveries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Active Orders</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dashboardData.assignedOrders?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Rating</span>
                  <div className="flex items-center space-x-1">
                    <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dashboardData.rating}</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'Delivery Agent'}! 👋
              </h2>
              <p className="text-blue-100 mb-4 text-lg">
                Ready to deliver smiles today? 🚚
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium">
                  <Activity className="w-4 h-4 inline mr-2" />
                  Deliver efficiently, earn more!
                </div>
                {weeklyDeliveries > 0 && (
                  <div className="bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium">
                    <Award className="w-4 h-4 inline mr-2" />
                    {weeklyDeliveries} deliveries this week!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start space-x-3 shadow-lg">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-bold mb-1">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-3 text-red-700 hover:text-red-900 underline text-sm font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[
              { icon: Package, label: 'Total Deliveries', value: dashboardData.totalDeliveries, subtitle: 'Lifetime deliveries', color: 'blue' },
              { icon: CheckCircle, label: "Today's Deliveries", value: dashboardData.todayDeliveries, subtitle: 'Completed today', color: 'green' },
              { icon: DollarSign, label: 'Total Earnings', value: `₹${dashboardData.earnings.toLocaleString()}`, subtitle: 'This month', color: 'yellow' },
              { icon: Star, label: 'Average Rating', value: dashboardData.rating, subtitle: 'Star rating', color: 'purple' },
            ].map((stat, index) => (
              <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:-translate-y-1`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 ${
                    stat.color === 'blue' ? 'bg-blue-100' :
                    stat.color === 'green' ? 'bg-green-100' :
                    stat.color === 'yellow' ? 'bg-yellow-100' : 'bg-purple-100'
                  } rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`w-7 h-7 ${
                      stat.color === 'blue' ? 'text-blue-600' :
                      stat.color === 'green' ? 'text-green-600' :
                      stat.color === 'yellow' ? 'text-yellow-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <Target className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {stat.value}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {stat.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Assigned Orders */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl mb-6`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Assigned Orders
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {filteredOrders.length} active order{filteredOrders.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-11 pr-4 py-2.5 rounded-xl border-2 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                      } focus:border-blue-500 outline-none`}
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:border-blue-500 outline-none`}
                  >
                    <option value="all">All Status</option>
                    <option value="assigned">Assigned</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {filteredOrders.length > 0 ? (
                <div className="space-y-5">
                  {filteredOrders.map((order) => {
                    const isUrgent = order.priority === 'high' || new Date(order.createdAt) < new Date(Date.now() - 3600000);
                    
                    return (
                      <div 
                        key={order._id} 
                        className={`border-2 rounded-2xl p-6 hover:shadow-xl transition-all ${
                          isUrgent 
                            ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50' 
                            : darkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-white'
                        }`}
                      >
                        {isUrgent && (
                          <div className="flex items-center space-x-2 mb-4 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">URGENT ORDER</span>
                          </div>
                        )}
                        
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-4">
                              <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Order #{order._id?.slice(-8).toUpperCase()}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(order.status)}`}>
                                {order.status?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-blue-500" />
                                <div>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer</p>
                                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {order.customer?.name || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Phone className="w-5 h-5 text-green-500" />
                                <div>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {order.customer?.phone || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start space-x-2 md:col-span-2">
                                <MapPin className="w-5 h-5 text-red-500 mt-1" />
                                <div>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Delivery Address</p>
                                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {order.deliveryAddress || 'Address not provided'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-purple-500" />
                                <div>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order Time</p>
                                  <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-3 lg:ml-6">
                            <div className="text-right">
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Order Amount</p>
                              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                ₹{order.total?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-5 pt-5 border-t-2 border-gray-200 dark:border-gray-700">
                          {order.status === 'assigned' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Mark this order as picked up?')) {
                                  handleStatusUpdate(order._id, 'picked_up');
                                }
                              }}
                              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                            >
                              <Package className="w-5 h-5" />
                              <span>Mark as Picked Up</span>
                            </button>
                          )}
                          
                          {order.status === 'picked_up' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Mark this order as out for delivery?')) {
                                  handleStatusUpdate(order._id, 'out_for_delivery');
                                }
                              }}
                              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                            >
                              <Truck className="w-5 h-5" />
                              <span>Out for Delivery</span>
                            </button>
                          )}
                          
                          {order.status === 'out_for_delivery' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Mark this order as delivered?')) {
                                  handleStatusUpdate(order._id, 'delivered');
                                }
                              }}
                              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span>Mark as Delivered</span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => window.open(`https://maps.google.com/?q=${order.deliveryAddress}`, '_blank')}
                            className="sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold shadow-lg"
                          >
                            <Navigation className="w-5 h-5" />
                            <span>Navigate</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className={`w-20 h-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Package className={`w-10 h-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    No assigned orders
                  </h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchQuery || filterStatus !== 'all' 
                      ? 'No orders match your search criteria' 
                      : 'New orders will appear here when assigned to you'}
                  </p>
                  {(searchQuery || filterStatus !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterStatus('all');
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Deliveries
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Your delivery history
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {dashboardData.recentOrders?.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentOrders.slice(0, 5).map((order) => (
                    <div 
                      key={order._id} 
                      className={`flex items-center justify-between p-5 rounded-2xl transition-all hover:shadow-lg border-2 ${
                        darkMode ? 'bg-gray-700/30 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Order #{order._id?.slice(-8).toUpperCase()}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          {order.customer?.name && (
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              Customer: {order.customer.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₹{order.total?.toFixed(2) || '0.00'}
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-3`} />
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No delivery history yet</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                    Completed deliveries will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryDashboard;