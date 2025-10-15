import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProduct } from '../../contexts/ProductContext';

import api from '../../services/api';
import { Heart, ShoppingCart, LogOut, Package, TrendingUp, DollarSign, Clock, MapPin, Phone, Mail, Edit2, Save, X, ChevronDown, ArrowRight, Truck, Shield, Star, CheckCircle, BarChart3, PieChart, Search, Filter, Download, Bell, User, Calendar, Menu, Home, CreditCard, Settings, HelpCircle, Gift, Zap, TrendingDown, Award } from 'lucide-react';

const CustomerDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const { 
    wishlist, 
    cart, 
    getCartTotal, 
    getCartItemCount
  } = useProduct();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [trackingModal, setTrackingModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rewardsModal, setRewardsModal] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    cartItems: 0,
    recentActivity: []
  });
  
  const [orders, setOrders] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchDashboardData = useCallback(async () => {
    if (dataFetched || !user?._id) return;

    try {
      setLoading(true);
      setError(null);

      const [statsResponse, ordersResponse, popularResponse] = await Promise.all([
        api.getDashboardStats('customer'),
        api.getOrders({ userId: user._id }),
        api.getPopularProducts()
      ]);

      // Calculate stats from actual orders
      const calculateStats = (orders) => {
        const delivered = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
        const pending = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
        const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        return {
          totalOrders: orders.length,
          pendingOrders: pending,
          deliveredOrders: delivered,
          totalSpent: totalSpent,
          wishlistItems: wishlist.length || 0,
          cartItems: getCartItemCount() || 0,
          recentActivity: []
        };
      };

      let stats = {
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalSpent: 0,
        wishlistItems: wishlist.length || 0,
        cartItems: getCartItemCount() || 0,
        recentActivity: []
      };

      const fetchedOrders = ordersResponse?.success ? ordersResponse.data || [] : [];
      
      if (fetchedOrders.length > 0) {
        stats = calculateStats(fetchedOrders);
      } else if (statsResponse?.success) {
        stats = { ...stats, ...statsResponse.data };
      }

      stats.wishlistItems = wishlist.length || 0;
      stats.cartItems = getCartItemCount() || 0;
      
      setDashboardStats(stats);
      setOrders(fetchedOrders);

      if (popularResponse?.success) {
        setPopularProducts(popularResponse.data || []);
      }

      setDataFetched(true);

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [dataFetched, user?._id, wishlist.length, getCartItemCount]);

  useEffect(() => {
    if (user) {
      const getAddressString = (address) => {
        if (typeof address === 'string') {
          return address;
        } else if (typeof address === 'object' && address !== null) {
          const parts = [];
          if (address.street) parts.push(address.street);
          if (address.city) parts.push(address.city);
          if (address.state) parts.push(address.state);
          if (address.pincode) parts.push(address.pincode);
          return parts.length > 0 ? parts.join(', ') : '';
        }
        return '';
      };

      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: getAddressString(user.address)
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?._id && !dataFetched) {
      fetchDashboardData();
    }
  }, [user?._id, dataFetched, fetchDashboardData]);

  useEffect(() => {
    if (dataFetched) {
      setDashboardStats(prev => ({
        ...prev,
        wishlistItems: wishlist.length || 0,
        cartItems: getCartItemCount() || 0
      }));
    }
  }, [wishlist.length, getCartItemCount, dataFetched]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      setDashboardStats({});
      setOrders([]);
      setDataFetched(false);
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

const handleSaveProfile = async () => {
  try {
    setProfileLoading(true);
    const response = await api.updateProfile(profile);
    
    console.log('📥 Profile update response:', response); // Debug log
    
    if (response?.success && response?.data) {
      // Update the auth context with new user data
      updateUser(response.data);
      
      setIsEditingProfile(false); // Exit edit mode
      alert('Profile updated successfully!');
    } else {
      throw new Error(response?.error || response?.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    alert('Failed to update profile: ' + error.message);
  } finally {
    setProfileLoading(false);
  }
};

  const handleRetry = () => {
    setDataFetched(false);
    setError(null);
    fetchDashboardData();
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', ring: 'ring-emerald-100' };
      case 'shipped': 
      case 'picked_up': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', ring: 'ring-blue-100' };
      case 'assigned': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', ring: 'ring-purple-100' };
      case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', ring: 'ring-amber-100' };
      case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', ring: 'ring-red-100' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500', ring: 'ring-slate-100' };
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Filter orders based on search and filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading user...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md backdrop-blur-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Access Denied</h2>
          <p className="text-slate-600 mb-6">Customer access required.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dataFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <X className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Failed to Load Dashboard</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, trend, trendValue }) => (
    <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -mr-16 -mt-16" style={{background: color}}></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
            {loading && !dataFetched ? (
              <div className="animate-pulse">
                <div className="h-9 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
                {trend && (
                  <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{trendValue}</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300" style={{background: color}}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Customer'}! 👋</h2>
              <p className="text-blue-100 text-lg">Here's what's happening with your orders today.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.location.href = '/products'} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg">
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          label="Total Orders"
          value={dashboardStats.totalOrders || 0}
          color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          icon={CheckCircle}
          label="Delivered"
          value={dashboardStats.deliveredOrders || 0}
          color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={dashboardStats.pendingOrders || 0}
          color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={`₹${dashboardStats.totalSpent ? dashboardStats.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}`}
          color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          trend="up"
          trendValue="+8%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Order Status Distribution</h3>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Delivered', count: dashboardStats.deliveredOrders || 0, color: 'bg-emerald-500', lightColor: 'bg-emerald-100' },
              { label: 'Pending', count: dashboardStats.pendingOrders || 0, color: 'bg-amber-500', lightColor: 'bg-amber-100' },
              { label: 'In Transit', count: Math.max(0, (dashboardStats.totalOrders || 0) - (dashboardStats.deliveredOrders || 0) - (dashboardStats.pendingOrders || 0)), color: 'bg-blue-500', lightColor: 'bg-blue-100' }
            ].map((item, idx) => {
              const percentage = dashboardStats.totalOrders > 0 ? (item.count / dashboardStats.totalOrders * 100) : 0;
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{item.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className={`w-full h-3 rounded-full ${item.lightColor} overflow-hidden`}>
                    <div className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`} style={{width: `${percentage}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spending Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Spending Analytics</h3>
            </div>
          </div>
          <div className="text-center mb-6">
            <p className="text-slate-600 text-sm mb-2 font-medium">Average Order Value</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ₹{dashboardStats.totalOrders > 0 ? Math.round(dashboardStats.totalSpent / dashboardStats.totalOrders).toLocaleString('en-IN') : '0'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <p className="text-slate-600 text-xs mb-1 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-blue-600">₹{Math.round(dashboardStats.totalSpent / 1000)}k</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <p className="text-slate-600 text-xs mb-1 font-medium">Orders Count</p>
              <p className="text-2xl font-bold text-purple-600">{dashboardStats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, label: 'Continue Shopping', color: 'from-blue-500 to-cyan-600', action: () => window.location.href = '/products' },
          { icon: Heart, label: 'Wishlist', color: 'from-pink-500 to-rose-600', badge: wishlist.length, action: () => window.location.href = '/wishlist' },
          { icon: Package, label: 'Track Orders', color: 'from-purple-500 to-indigo-600', action: () => setActiveTab('orders') },
          { icon: Gift, label: 'Rewards', color: 'from-amber-500 to-orange-600', badge: 'New', action: () => setRewardsModal(true) }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 text-left overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-slate-900">{item.label}</p>
              {item.badge && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            </div>
            <button onClick={() => setActiveTab('orders')} className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2 transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.length > 0 ? (
            orders.slice(0, 5).map((order, idx) => {
              const statusColor = getStatusColor(order.status);
              return (
                <div key={order._id} className="p-6 hover:bg-slate-50 transition-all duration-200 group">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-bold text-slate-900 text-lg">#{order._id?.slice(-6) || 'N/A'}</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`}></span>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {order.items?.length || 0} items
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">₹{order.total ? order.total.toFixed(2) : '0.00'}</p>
                      </div>
                      <button
                        onClick={() => setTrackingModal(order)}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-6 text-lg">No orders found</p>
              <button onClick={() => window.location.href = '/products'} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold">
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search orders by ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            All Orders ({filteredOrders.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, idx) => {
              const statusColor = getStatusColor(order.status);
              return (
                <div key={order._id} className="p-6 hover:bg-slate-50 transition-all duration-200 group">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="font-bold text-slate-900 text-lg">Order {order.orderNumber || String(order._id).slice(-8).toUpperCase()}</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot} animate-pulse`}></span>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {order.items?.length || 0} item(s)
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">Total: ₹{order.total ? order.total.toFixed(2) : '0.00'}</p>
                    </div>
                    <button
                      onClick={() => setTrackingModal(order)}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105 whitespace-nowrap"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-2 text-lg">No orders found</p>
              <p className="text-slate-500 text-sm mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => window.location.href = '/products'}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
              >
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
          </div>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-semibold"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
        
        <div className="p-8">
          {/* Profile Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile.name || 'User'}</h2>
              <p className="text-slate-600">{profile.email || 'No email provided'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  Verified Customer
                </span>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: User, label: 'Full Name', key: 'name', type: 'text' },
              { icon: Mail, label: 'Email Address', key: 'email', type: 'email' },
              { icon: Phone, label: 'Phone Number', key: 'phone', type: 'tel' },
              { icon: MapPin, label: 'Delivery Address', key: 'address', type: 'textarea' }
            ].map((field) => (
              <div key={field.key} className={field.key === 'address' ? 'md:col-span-2' : ''}>
                <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <field.icon className="w-4 h-4 text-slate-500" />
                  {field.label}
                </label>
                {isEditingProfile ? (
                  field.type === 'textarea' ? (
                    <textarea
                      value={profile[field.key]}
                      onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={profile[field.key]}
                      onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  )
                ) : (
                  <div className="px-4 py-3 bg-slate-50 rounded-xl text-slate-900 border border-slate-200 font-medium">
                    {profile[field.key] || 'Not provided'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isEditingProfile && (
            <div className="flex gap-3 mt-8 pt-8 border-t border-slate-200">
              <button 
                onClick={handleSaveProfile} 
                disabled={profileLoading} 
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <Save className="w-5 h-5" />
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditingProfile(false)}
                disabled={profileLoading}
                className="flex-1 bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-all hover:bg-slate-300 flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
                  <p className="text-xs text-slate-500">Welcome back, {user?.name || 'Customer'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{logoutLoading ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Dropdown */}
      {notificationsOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
          <div className="fixed top-20 right-4 sm:right-8 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notifications
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {orders.length > 0 ? (
                orders.slice(0, 5).map((order, idx) => {
                  const statusLower = order.status.toLowerCase();
                  let icon = Package;
                  let title = 'Order Update';
                  let message = `Order #${order._id?.slice(-6)} status: ${getStatusLabel(order.status)}`;
                  let color = 'text-slate-600';
                  
                  if (statusLower === 'delivered') {
                    icon = CheckCircle;
                    title = 'Order Delivered';
                    message = `Your order #${order._id?.slice(-6)} has been delivered successfully`;
                    color = 'text-emerald-600';
                  } else if (statusLower === 'shipped' || statusLower === 'picked_up') {
                    icon = Truck;
                    title = 'Order Shipped';
                    message = `Your order #${order._id?.slice(-6)} is on the way`;
                    color = 'text-blue-600';
                  } else if (statusLower === 'assigned') {
                    icon = User;
                    title = 'Order Assigned';
                    message = `Delivery partner assigned for order #${order._id?.slice(-6)}`;
                    color = 'text-purple-600';
                  } else if (statusLower === 'pending') {
                    icon = Clock;
                    title = 'Order Pending';
                    message = `Your order #${order._id?.slice(-6)} is being processed`;
                    color = 'text-amber-600';
                  }
                  
                  const timeAgo = new Date(order.createdAt);
                  const now = new Date();
                  const diffMs = now - timeAgo;
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffHours / 24);
                  
                  let timeText = '';
                  if (diffDays > 0) {
                    timeText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                  } else if (diffHours > 0) {
                    timeText = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                  } else {
                    timeText = 'Just now';
                  }
                  
                  return (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 cursor-pointer" onClick={() => { setTrackingModal(order); setNotificationsOpen(false); }}>
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 ${color}`}>
                          {React.createElement(icon, { className: "w-5 h-5" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm">{title}</p>
                          <p className="text-slate-600 text-sm truncate">{message}</p>
                          <p className="text-slate-500 text-xs mt-1">{timeText}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No notifications yet</p>
                  <p className="text-slate-500 text-sm mt-1">Your order updates will appear here</p>
                </div>
              )}
            </div>
            {orders.length > 0 && (
              <div className="p-4 border-t border-slate-200">
                <button onClick={() => { setActiveTab('orders'); setNotificationsOpen(false); }} className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  View All Orders
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Enhanced Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 p-6 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-3xl z-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Order Details</h3>
                <p className="text-sm text-slate-500">Order #{trackingModal._id?.slice(-6) || 'N/A'}</p>
              </div>
              <button
                onClick={() => setTrackingModal(null)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Order Status Timeline */}
              <div className="space-y-6">
                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Delivery Timeline
                </h4>
                <div className="relative">
                  {['Ordered', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                    const statusMap = { 'Ordered': 'pending', 'Processing': 'pending', 'Shipped': 'shipped', 'Delivered': 'delivered' };
                    const stepStatus = statusMap[step];
                    const currentStatus = trackingModal.status.toLowerCase();
                    
                    const isCompleted = (currentStatus === 'delivered') || 
                                       (currentStatus === 'shipped' && (step === 'Ordered' || step === 'Processing' || step === 'Shipped')) ||
                                       (currentStatus === 'picked_up' && (step === 'Ordered' || step === 'Processing')) ||
                                       (currentStatus === 'assigned' && step === 'Ordered') ||
                                       (currentStatus === 'pending' && step === 'Ordered');
                    const isCurrent = (currentStatus === 'delivered' && step === 'Delivered') ||
                                     (currentStatus === 'shipped' && step === 'Shipped') ||
                                     (currentStatus === 'picked_up' && step === 'Processing') ||
                                     ((currentStatus === 'assigned' || currentStatus === 'pending') && step === 'Processing');
                    
                    return (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                            isCurrent ? 'bg-gradient-to-r from-blue-500 to-indigo-600 ring-4 ring-blue-100 animate-pulse' :
                            'bg-slate-300'
                          }`}>
                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                          </div>
                          {idx < 3 && (
                            <div className={`w-1 h-16 ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-blue-500' : 'bg-slate-300'} transition-all duration-500 my-2`}></div>
                          )}
                        </div>
                        <div className="pt-2 pb-8">
                          <p className={`font-bold text-lg ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>{step}</p>
                          <p className={`text-sm mt-1 ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>
                            {isCompleted ? '✓ Completed' : isCurrent ? '• In Progress' : 'Pending'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Items
                </h4>
                <div className="space-y-3 bg-white rounded-xl p-4 border border-blue-100">
                  {trackingModal.items?.length > 0 ? (
                    trackingModal.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center pb-3 border-b last:border-b-0 last:pb-0">
                        <div className="flex-1">
                          <p className="text-slate-900 font-semibold">{item.name}</p>
                          <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-slate-900">₹{item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600">No items found</p>
                  )}
                  <div className="pt-4 border-t-2 border-slate-300 flex justify-between font-bold text-xl">
                    <span className="text-slate-900">Total Amount:</span>
                    <span className="text-blue-600">₹{trackingModal.total ? trackingModal.total.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Delivery Address
                </h4>
                <div className="bg-white rounded-xl p-4 border border-emerald-100">
                  <p className="font-bold text-slate-900 mb-2">{user?.name || 'Recipient Name'}</p>
                  <p className="text-slate-700 mb-2">{profile.address || 'Address not provided'}</p>
                  <p className="text-slate-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.phone || 'Phone not provided'}
                  </p>
                </div>
              </div>

              {/* Support Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  Need Help?
                </h4>
                <p className="text-slate-700 mb-4">If you have any questions or concerns about your order, our support team is ready to assist you.</p>
                
                {/* FAQ Accordion */}
                <div className="space-y-2 mb-4">
                  {[
                    { q: 'How can I track my order?', a: 'You can track your order in real-time using the tracking timeline above. You\'ll receive notifications at each stage of delivery.' },
                    { q: 'What is your return policy?', a: 'We offer a 30-day return policy for all products. Items must be in original condition with tags attached.' },
                    { q: 'How do I contact support?', a: 'You can reach our support team via email at support@store.com or call us at 1-800-SUPPORT. We\'re available 24/7.' }
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-purple-100 overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-purple-50 transition-colors"
                      >
                        <span className="font-semibold text-slate-900 text-sm">{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-4 pb-4">
                          <p className="text-slate-600 text-sm">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-4 mb-4 border border-purple-100">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Support Hours</p>
                  <p className="text-sm text-slate-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-slate-600">Saturday - Sunday: 10:00 AM - 4:00 PM</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a 
                    href="mailto:admin@delivery.com?subject=Order Support - Order #${trackingModal._id?.slice(-6)}&body=Hello,%0D%0A%0D%0AI need help with my order #${trackingModal._id?.slice(-6)}.%0D%0A%0D%0AOrder Details:%0D%0AOrder ID: ${trackingModal._id}%0D%0AStatus: ${getStatusLabel(trackingModal.status)}%0D%0ATotal Amount: ₹${trackingModal.total?.toFixed(2)}%0D%0A%0D%0APlease describe your issue below:%0D%0A%0D%0A"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Email Support
                  </a>
                  <a 
                    href="tel:+911800123456"
                    className="bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-xl transition-all border-2 border-slate-200 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Call: 1800-123-456
                  </a>
                </div>

                {/* Contact Information */}
                <div className="mt-4 bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-sm font-semibold text-slate-900 mb-3">Contact Information</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Email:</span>
                      <a href="mailto:admin@delivery.com" className="text-blue-600 hover:underline">admin@delivery.com</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Phone:</span>
                      <a href="tel:+911800123456" className="text-blue-600 hover:underline">+91 1800-123-456</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">Available:</span>
                      <span>24/7 Customer Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Modal */}
      {rewardsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-3xl z-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Gift className="w-7 h-7 text-amber-600" />
                  Rewards Program
                </h3>
                <p className="text-sm text-slate-600 mt-1">Earn points with every purchase</p>
              </div>
              <button
                onClick={() => setRewardsModal(false)}
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Current Points */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white text-center shadow-lg">
                <p className="text-sm font-semibold mb-2 opacity-90">Your Reward Points</p>
                <p className="text-6xl font-bold mb-2">0</p>
                <p className="text-sm opacity-90">Start shopping to earn points!</p>
              </div>

              {/* Coming Soon Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Coming Soon!</h4>
                    <p className="text-slate-700 text-sm">We're working on exciting rewards features. Soon you'll be able to earn and redeem points for amazing discounts and exclusive offers!</p>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div>
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  How It Works
                </h4>
                <div className="space-y-3">
                  {[
                    { icon: ShoppingCart, title: 'Shop & Earn', desc: 'Earn 1 point for every ₹10 spent', color: 'from-blue-500 to-cyan-600' },
                    { icon: Star, title: 'Bonus Points', desc: 'Get extra points on featured products', color: 'from-purple-500 to-pink-600' },
                    { icon: Gift, title: 'Redeem Rewards', desc: 'Use points for discounts on future orders', color: 'from-amber-500 to-orange-600' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={() => {
                  setRewardsModal(false);
                  window.location.href = '/products';
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Start Shopping Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;