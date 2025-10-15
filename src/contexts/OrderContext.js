// src/contexts/OrderContext.js - Enhanced with E-commerce Features
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // State management
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Load orders based on user role
  const loadOrders = useCallback(async (params = {}) => {
    if (!isAuthenticated || !user?._id) {
      console.log('User not authenticated, skipping order load');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading orders for user:', user._id, 'role:', user.role);

      let ordersData = [];
      
      if (user.role === 'admin') {
        // Admin can see all orders
        const response = await api.getOrders(params);
        if (response.success) {
          ordersData = response.data || [];
        }
      } else if (user.role === 'customer') {
        // Customer can only see their own orders
        const response = await api.getOrders({ ...params, userId: user._id });
        if (response.success) {
          ordersData = response.data || [];
        }
      } else if (user.role === 'delivery_agent') {
        // Delivery agent can see assigned orders
        const response = await api.getOrders({ ...params, deliveryAgent: user._id });
        if (response.success) {
          ordersData = response.data || [];
        }
      }

      setOrders(ordersData);
      calculateOrderStats(ordersData);
      setDataFetched(true);
      console.log('Orders loaded successfully:', ordersData.length);
      return ordersData;

    } catch (error) {
      console.error('Failed to load orders:', error);
      setError(error.message || 'Failed to load orders');
      setOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Calculate order statistics
  const calculateOrderStats = useCallback((ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    };

    ordersData.forEach(order => {
      const status = order.status?.toLowerCase() || 'pending';
      
      switch (status) {
        case 'pending':
          stats.pending++;
          break;
        case 'confirmed':
          stats.confirmed++;
          break;
        case 'shipped':
          stats.shipped++;
          break;
        case 'delivered':
          stats.delivered++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
        default:
          stats.pending++;
      }

      // Calculate revenue (exclude cancelled orders)
      if (status !== 'cancelled') {
        stats.totalRevenue += parseFloat(order.total) || 0;
      }
    });

    setOrderStats(stats);
    return stats;
  }, []);

  // Create new order
  const createOrder = useCallback(async (orderData) => {
    if (!isAuthenticated || !user?._id) {
      throw new Error('Please login to create an order');
    }

    try {
      setLoading(true);
      console.log('Creating new order:', orderData);

      const response = await api.createOrder({
        ...orderData,
        userId: user._id,
        phone: user.phone,              // ✅ add this line
        deliveryAddress: user.address,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (response.success) {
        const newOrder = response.data;
        setOrders(prev => [newOrder, ...prev]);
        setCurrentOrder(newOrder);
        calculateOrderStats([newOrder, ...orders]);
        console.log('Order created successfully:', newOrder._id);
        return newOrder;
      } else {
        throw new Error(response.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, orders, calculateOrderStats]);

  // Update order
  const updateOrder = useCallback(async (orderId, updateData) => {
    if (!isAuthenticated) {
      throw new Error('Please login to update order');
    }

    try {
      setLoading(true);
      console.log('Updating order:', orderId, updateData);

      const response = await api.updateOrder(orderId, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      if (response.success) {
        const updatedOrder = response.data;
        setOrders(prev => 
          prev.map(order => 
            (order._id || order.id) === orderId ? updatedOrder : order
          )
        );
        
        if (currentOrder && (currentOrder._id || currentOrder.id) === orderId) {
          setCurrentOrder(updatedOrder);
        }

        calculateOrderStats(orders.map(order => 
          (order._id || order.id) === orderId ? updatedOrder : order
        ));
        
        console.log('Order updated successfully');
        return updatedOrder;
      } else {
        throw new Error(response.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Update order error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentOrder, orders, calculateOrderStats]);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, status) => {
    return updateOrder(orderId, { status });
  }, [updateOrder]);

  // Get order by ID
  const getOrder = useCallback((orderId) => {
    return orders.find(order => (order._id || order.id) === orderId);
  }, [orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => 
      (order.status || 'pending').toLowerCase() === status.toLowerCase()
    );
  }, [orders]);

  // Get recent orders
  const getRecentOrders = useCallback((limit = 5) => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
      .slice(0, limit);
  }, [orders]);

  // Cancel order (only for customers and admins)
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    if (!isAuthenticated) {
      throw new Error('Please login to cancel order');
    }

    const order = getOrder(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Check permissions
    if (user.role === 'customer' && order.userId !== user._id) {
      throw new Error('You can only cancel your own orders');
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status?.toLowerCase())) {
      throw new Error('Order cannot be cancelled in current status');
    }

    try {
      return await updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  }, [isAuthenticated, user, getOrder, updateOrderStatus]);

  // Get user's order history
  const getUserOrderHistory = useCallback(() => {
    if (user?.role !== 'customer') return [];
    return orders.filter(order => order.userId === user._id);
  }, [user, orders]);

  // Clear current order
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset data (for logout)
  const resetOrderData = useCallback(() => {
    setOrders([]);
    setCurrentOrder(null);
    setOrderStats({
      total: 0,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    });
    setError(null);
    setDataFetched(false);
  }, []);

  // Load orders when user changes
  useEffect(() => {
    if (isAuthenticated && user?._id && !dataFetched) {
      loadOrders();
    } else if (!isAuthenticated) {
      resetOrderData();
    }
  }, [isAuthenticated, user?._id, dataFetched, loadOrders, resetOrderData]);

  const value = {
    // Data
    orders,
    currentOrder,
    orderStats,
    loading,
    error,

    // Order operations
    loadOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    cancelOrder,
    
    // Getters
    getOrder,
    getOrdersByStatus,
    getRecentOrders,
    getUserOrderHistory,

    // Utility
    clearCurrentOrder,
    clearError,
    resetOrderData
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;