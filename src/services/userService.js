// src/services/userService.js - Enhanced with E-commerce Features
import api from './api';

class UserService {
  // User authentication
  async login(credentials) {
    try {
      const response = await api.login(credentials);
      if (response.success && response.data) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
        localStorage.setItem('token', response.data.token || 'dummy-token');
        
        return {
          success: true,
          user: response.data.user || response.data,
          token: response.data.token,
          message: response.message || 'Login successful'
        };
      }
      return response;
    } catch (error) {
      console.error('UserService login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      const response = await api.register(userData);
      return response;
    } catch (error) {
      console.error('UserService register error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  async logout() {
    try {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      console.error('UserService logout error:', error);
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(localStorage.getItem('user') && localStorage.getItem('token'));
  }

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || 'customer';
  }

  // User profile management
  async getProfile() {
    try {
      const response = await api.getProfile();
      return response;
    } catch (error) {
      console.error('UserService getProfile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get profile'
      };
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.updateProfile(profileData);
      
      if (response.success && response.data) {
        // Update localStorage with new profile data
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...profileData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return response;
    } catch (error) {
      console.error('UserService updateProfile error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  }

  // Wishlist management
  async getWishlist() {
    try {
      const response = await api.getWishlist();
      return response;
    } catch (error) {
      console.error('UserService getWishlist error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to get wishlist'
      };
    }
  }

  async addToWishlist(productId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to add items to wishlist');
      }
      
      const response = await api.addToWishlist(productId);
      return response;
    } catch (error) {
      console.error('UserService addToWishlist error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add to wishlist'
      };
    }
  }

  async removeFromWishlist(productId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to manage wishlist');
      }
      
      const response = await api.removeFromWishlist(productId);
      return response;
    } catch (error) {
      console.error('UserService removeFromWishlist error:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove from wishlist'
      };
    }
  }

  // Cart management
  async getCart() {
    try {
      const response = await api.getCart();
      return response;
    } catch (error) {
      console.error('UserService getCart error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to get cart'
      };
    }
  }

  async addToCart(productId, quantity = 1) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to add items to cart');
      }
      
      const response = await api.addToCart(productId, quantity);
      return response;
    } catch (error) {
      console.error('UserService addToCart error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add to cart'
      };
    }
  }

  async updateCartQuantity(productId, quantity) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to manage cart');
      }
      
      const response = await api.updateCartQuantity(productId, quantity);
      return response;
    } catch (error) {
      console.error('UserService updateCartQuantity error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update cart'
      };
    }
  }

  async removeFromCart(productId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to manage cart');
      }
      
      const response = await api.removeFromCart(productId);
      return response;
    } catch (error) {
      console.error('UserService removeFromCart error:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove from cart'
      };
    }
  }

  async clearCart() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Please login to manage cart');
      }
      
      const response = await api.clearCart();
      return response;
    } catch (error) {
      console.error('UserService clearCart error:', error);
      return {
        success: false,
        error: error.message || 'Failed to clear cart'
      };
    }
  }

  // Order management
  async getUserOrders() {
    try {
      const user = this.getCurrentUser();
      if (!user?._id) {
        throw new Error('Please login to view orders');
      }
      
      const response = await api.getOrders({ userId: user._id });
      return response;
    } catch (error) {
      console.error('UserService getUserOrders error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to get orders'
      };
    }
  }

  async createOrder(orderData) {
    try {
      const user = this.getCurrentUser();
      if (!user?._id) {
        throw new Error('Please login to place order');
      }
      
      const response = await api.createOrder({
        ...orderData,
        userId: user._id
      });
      
      return response;
    } catch (error) {
      console.error('UserService createOrder error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order'
      };
    }
  }

  // Dashboard stats
  async getDashboardStats() {
    try {
      const userRole = this.getUserRole();
      const response = await api.getDashboardStats(userRole);
      return response;
    } catch (error) {
      console.error('UserService getDashboardStats error:', error);
      return {
        success: false,
        data: {},
        error: error.message || 'Failed to get dashboard stats'
      };
    }
  }

  // User management (for admins)
  async getUsers(role = null) {
    try {
      const response = await api.getUsers(role);
      return response;
    } catch (error) {
      console.error('UserService getUsers error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to get users'
      };
    }
  }

  async createUser(userData) {
    try {
      const response = await api.createUser(userData);
      return response;
    } catch (error) {
      console.error('UserService createUser error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create user'
      };
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await api.updateUser(userId, userData);
      return response;
    } catch (error) {
      console.error('UserService updateUser error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user'
      };
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.deleteUser(userId);
      return response;
    } catch (error) {
      console.error('UserService deleteUser error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete user'
      };
    }
  }

  // Analytics and insights
  async getPopularProducts() {
    try {
      const response = await api.getPopularProducts();
      return response;
    } catch (error) {
      console.error('UserService getPopularProducts error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to get popular products'
      };
    }
  }

  async getUserStats(userId) {
    try {
      const response = await api.getUserStats(userId);
      return response;
    } catch (error) {
      console.error('UserService getUserStats error:', error);
      return {
        success: false,
        data: {},
        error: error.message || 'Failed to get user stats'
      };
    }
  }

  // Utility methods
  formatUserName(user) {
    if (!user) return 'Unknown User';
    return user.name || user.email || 'User';
  }

  formatUserRole(role) {
    const roleMap = {
      'admin': 'Administrator',
      'delivery_agent': 'Delivery Agent',
      'customer': 'Customer'
    };
    return roleMap[role] || 'Customer';
  }

  validateUserData(userData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || userData.email !== undefined) {
      if (!userData.email || !userData.email.includes('@')) {
        errors.push('Valid email is required');
      }
    }

    if (!isUpdate || userData.name !== undefined) {
      if (!userData.name || userData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
    }

    if (!isUpdate || userData.password !== undefined) {
      if (!isUpdate && (!userData.password || userData.password.length < 6)) {
        errors.push('Password must be at least 6 characters long');
      }
    }

    if (userData.phone && userData.phone.length < 10) {
      errors.push('Phone number must be at least 10 digits');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clear user data (for logout)
  clearUserData() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}

const userService = new UserService();
export default userService;