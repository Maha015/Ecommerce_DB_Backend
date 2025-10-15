// src/services/api.js - Unified E-Commerce API Service with Admin Dashboard
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerce-db-backend-b4xf.onrender.com';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthToken() {
    const token = localStorage.getItem('token');
    console.log('🔍 Getting auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
    return token;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const token = this.getAuthToken();
      const url = `${this.baseURL}${endpoint}`;
      
      const config = {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      };

      if (options.method) delete options.method;

      console.log(`🔄 API Request: ${config.method} ${url}`);
      console.log('📤 Request headers:', config.headers);
      if (token) console.log('🔑 Token present:', !!token);

      const response = await fetch(url, config);
      
      console.log(`📥 Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: response.statusText 
        }));
        
        console.error(`❌ API Error: ${response.status} - ${errorData.message}`);
        
        if (response.status === 401) {
          console.log('🚪 Unauthorized - Clearing auth and redirecting');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        
        return { 
          success: false, 
          error: errorData.message || response.statusText, 
          data: null 
        };
      }

      const data = await response.json();
      console.log('✅ Request successful:', data);
      
      return { 
        success: true, 
        data: data.data || data, 
        message: data.message 
      };
    } catch (error) {
      console.error(`❌ Network Error for ${endpoint}:`, error);
      return { 
        success: false, 
        error: error.message || 'Network error', 
        data: null 
      };
    }
  }

  // ---------------- AUTH ----------------
  login(credentials) {
    return this.makeRequest('/api/login', { 
      method: 'POST', 
      body: JSON.stringify(credentials) 
    });
  }

  register(userData) {
    return this.makeRequest('/api/register', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    });
  }


  // ---------------- DASHBOARD ----------------
  getDashboardStats(role = 'customer') {
    return this.makeRequest(`/api/dashboard/stats/${role}`);
  }

  
  // ---------------- ORDERS ----------------
  getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/api/orders${queryString ? `?${queryString}` : ''}`);
  }

  createOrder(orderData) {
    return this.makeRequest('/api/orders', { 
      method: 'POST', 
      body: JSON.stringify(orderData) 
    });
  }

  updateOrder(orderId, updateData) {
    return this.makeRequest(`/api/orders/${orderId}`, { 
      method: 'PUT', 
      body: JSON.stringify(updateData) 
    });
  }

  updateOrderStatus(orderId, status) {
    return this.makeRequest(`/api/orders/${orderId}/status`, { 
      method: 'PUT', 
      body: JSON.stringify({ status }) 
    });
  }


  // ---------------- USERS ----------------
  getUsers(role = null) {
    const endpoint = role ? `/api/users?role=${role}` : '/api/users';
    return this.makeRequest(endpoint);
  }

  createUser(userData) {
    return this.makeRequest('/api/users', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    });
  }

  updateUser(userId, userData) {
    return this.makeRequest(`/api/users/${userId}`, { 
      method: 'PUT', 
      body: JSON.stringify(userData) 
    });
  }

  deleteUser(userId) {
    return this.makeRequest(`/api/users/${userId}`, { 
      method: 'DELETE' 
    });
  }

  // ---------------- PROFILE ----------------
  getProfile() {
    return this.makeRequest('/api/profile');
  }

  updateProfile(profileData) {
    return this.makeRequest('/api/profile', { 
      method: 'PUT', 
      body: JSON.stringify(profileData) 
    });
  }


  // ---------------- CART ----------------
  getCart() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      console.error('No user ID found');
      return Promise.resolve({ success: false, error: 'User not logged in', data: [] });
    }
    console.log('📦 Getting cart for user:', userId);
    return this.makeRequest(`/api/cart/${userId}`);
  }

  addToCart(product, quantity = 1) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return Promise.resolve({ success: false, error: 'User not logged in' });
    }
    
    const productId = String(product._id || product.id || product.productId);
    
    const payload = {
      productId: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity
    };
    
    console.log('📦 Adding to cart:', payload);
    
    return this.makeRequest(`/api/cart/${userId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  updateCartQuantity(productId, quantity) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return Promise.resolve({ success: false, error: 'User not logged in' });
    }
    
    const cleanProductId = String(productId);
    console.log('📦 Updating cart quantity:', { userId, productId: cleanProductId, quantity });
    
    return this.makeRequest(`/api/cart/${userId}/${cleanProductId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  removeFromCart(productId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return Promise.resolve({ success: false, error: 'User not logged in' });
    }
    
    const cleanProductId = String(productId);
    console.log('📦 Removing from cart:', { userId, productId: cleanProductId });
    
    return this.makeRequest(`/api/cart/${userId}`, {
      method: 'DELETE',
    });
  }

  clearCart() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return Promise.resolve({ success: false, error: 'User not logged in' });
    }
    console.log('📦 Clearing entire cart for user:', userId);
    return this.makeRequest(`/api/cart/${userId}`, { method: 'DELETE' });
  }

  // ---------------- WISHLIST ----------------
  getWishlist() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return Promise.resolve({ success: false, error: 'User not logged in', data: [] });
    }
    console.log('❤️ Getting wishlist for user:', userId);
    return this.makeRequest(`/api/wishlist/${userId}`);
  }
  
  async addToWishlist(product) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return { success: false, error: 'User not logged in' };
    }

    const productId = String(product._id || product.id || product.productId || product);
    
    console.log('❤️ Adding to wishlist:', productId);

    let productData = product;
    if (typeof product === 'string' || !product.name) {
      console.log('📦 Fetching product details for:', productId);
      const productResponse = await this.getProduct(productId);
      
      if (!productResponse.success || !productResponse.data) {
        console.error('❌ Failed to fetch product details:', productId);
        return { 
          success: false, 
          error: `Product ${productId} not found. Cannot add to wishlist.` 
        };
      }
      productData = productResponse.data;
    }

    if (!productData.name || productData.price === undefined) {
      console.error('❌ Invalid product data:', productData);
      return { 
        success: false, 
        error: 'Invalid product data. Missing name or price.' 
      };
    }

    const payload = {
      productId: String(productData._id || productData.id || productData.productId || productId),
      name: String(productData.name),
      price: Number(productData.price),
      image: String(productData.image || productData.images?.[0] || '/placeholder.png'),
      rating: Number(productData.rating || 0),
      category: String(productData.category || 'general'),
      description: String(productData.description || productData.name || '')
    };

    console.log('❤️ Final wishlist payload:', payload);

    if (!payload.image || payload.image === 'undefined') {
      payload.image = '/placeholder.png';
      console.warn('⚠️ Image missing, using placeholder');
    }

    return this.makeRequest(`/api/wishlist/${userId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  removeFromWishlist(productId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return Promise.resolve({ success: false, error: 'User not logged in' });
    }
    
    const cleanProductId = String(productId).trim();
    console.log('❤️ Removing from wishlist - User:', userId, 'Product:', cleanProductId);
    
    return this.makeRequest(`/api/wishlist/${userId}/${cleanProductId}`, {
      method: 'DELETE',
    });
  }

  clearWishlist() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    if (!userId) {
      return Promise.resolve({ success: false, error: 'User not logged in' });
    }
    console.log('❤️ Clearing entire wishlist for user:', userId);
    return this.makeRequest(`/api/wishlist/${userId}`, { method: 'DELETE' });
  }
  
  // ---------------- DELIVERY AGENT ----------------
  getDeliveryAgents() {
    return this.getUsers('delivery_agent');
  }

  createDeliveryAgent(agentData) {
    return this.makeRequest('/api/register', {
      method: 'POST',
      body: JSON.stringify({ ...agentData, role: 'delivery_agent' }),
    });
  }

  // ---------------- PRODUCTS ----------------
  getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/api/products${queryString ? `?${queryString}` : ''}`);
  }

  getProduct(productId) {
    return this.makeRequest(`/api/products/${productId}`);
  }

  // ---------------- PAYMENT ----------------
  createPaymentIntent(orderData) {
    return this.makeRequest('/api/payment/create-intent', { 
      method: 'POST', 
      body: JSON.stringify(orderData) 
    });
  }

  confirmPayment(paymentIntentId, paymentData) {
    return this.makeRequest('/api/payment/confirm', { 
      method: 'POST', 
      body: JSON.stringify({ paymentIntentId, ...paymentData }) 
    });
  }

  // ---------------- ANALYTICS ----------------
  getPopularProducts() {
    return this.makeRequest('/api/analytics/popular-products');
  }

  getUserStats(userId) {
    return this.makeRequest(`/api/analytics/user-stats/${userId}`);
  }


// ============================================================
// ✨ EXISTING: ADMIN DASHBOARD ANALYTICS FUNCTIONS
// ============================================================

/**
 * Get comprehensive admin dashboard statistics
 * Returns: totalOrders, totalCustomers, totalAgents, totalRevenue, 
 *          pendingOrders, deliveredOrders, recentOrders, deliveryAgents
 */
getAdminDashboardStats() {
  console.log('📊 Fetching admin dashboard stats...');
  return this.makeRequest('/api/analytics/admin/dashboard');
}

/**
 * Get all delivery agents with their status
 * Returns: Array of agents with name, email, phone, isOnline, status
 */
getAllDeliveryAgents() {
  console.log('🚚 Fetching all delivery agents...');
  return this.makeRequest('/api/analytics/admin/agents');
}

/**
 * Get all unassigned orders (no delivery agent assigned)
 * Returns: Array of orders with status 'pending' or 'confirmed' and no agent
 */
getUnassignedOrders() {
  console.log('📦 Fetching unassigned orders...');
  return this.makeRequest('/api/analytics/admin/unassigned-orders');
}

/**
 * Assign an order to a delivery agent
 * @param {string} orderId - The order ID to assign
 * @param {string} agentId - The delivery agent ID
 * Returns: Updated order with deliveryAgent field and status 'assigned'
 */
assignOrderToAgent(orderId, agentId) {
  console.log(`🎯 Assigning order ${orderId} to agent ${agentId}...`);
  return this.makeRequest(`/api/analytics/admin/orders/${orderId}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ agentId })
  });
}


// ============================================================
// ✨ NEW: GET ALL ORDERS FOR ADMIN MODAL
// ============================================================

getAllOrders() {
  console.log('📋 Fetching all orders for admin modal...');
  return this.makeRequest('/api/analytics/admin/all-orders');
}


  // ============================================================
  // Optional: Additional admin helper methods
  // ============================================================

  /**
   * Get orders by status (helper method)
   */
  getOrdersByStatus(status) {
    return this.getOrders({ status });
  }

  /**
   * Get online delivery agents only
   */
  async getOnlineDeliveryAgents() {
    const response = await this.getAllDeliveryAgents();
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.filter(agent => agent.isOnline)
      };
    }
    return response;
  }

  /**
   * Bulk assign multiple orders (for future enhancement)
   */
  async bulkAssignOrders(assignments) {
    console.log('🎯 Bulk assigning orders:', assignments);
    const results = await Promise.all(
      assignments.map(({ orderId, agentId }) => 
        this.assignOrderToAgent(orderId, agentId)
      )
    );
    return {
      success: results.every(r => r.success),
      data: results
    };
  }

  /**
   * Update delivery agent online status (for future enhancement)
   */

  
/**
 * Update delivery agent's own status (called by delivery agent themselves)
 * @param {string} status - Status: 'available', 'busy', or 'offline'
 * @param {boolean} isOnline - Online status
 */
updateMyAgentStatus(status, isOnline) {
  console.log('🔄 Updating my agent status:', { status, isOnline });
  return this.makeRequest('/api/analytics/agent/status', {
    method: 'PUT',
    body: JSON.stringify({ status, isOnline })
  });
}

/**
 * Get current agent profile with status
 */
getAgentProfile() {
  console.log('👤 Fetching agent profile...');
  return this.makeRequest('/api/analytics/agent/profile');
}
  updateAgentStatus(agentId, isOnline) {
    console.log(`🚚 Updating agent ${agentId} status to ${isOnline ? 'online' : 'offline'}`);
    return this.updateUser(agentId, { isOnline });
  }
}

const apiService = new ApiService();
export default apiService;