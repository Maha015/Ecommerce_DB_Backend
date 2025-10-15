// src/utils/helpers.js

// Format currency values
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Format date values
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

// Format date and time
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};

// Get order status color (alias for compatibility)
export const getStatusColor = (status) => {
  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-blue-600 bg-blue-100',
    assigned: 'text-purple-600 bg-purple-100',
    picked_up: 'text-orange-600 bg-orange-100',
    out_for_delivery: 'text-indigo-600 bg-indigo-100',
    delivered: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100'
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

// Alternative name for the same function
export const getOrderStatusColor = getStatusColor;

// Get formatted status text
export const getStatusText = (status) => {
  const statusTexts = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  
  return statusTexts[status] || 'Unknown';
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Generate order ID display
export const formatOrderId = (orderId) => {
  if (!orderId) return 'N/A';
  return `#${orderId.slice(-8).toUpperCase()}`;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// Calculate time ago
export const timeAgo = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDate(dateString);
  } catch (error) {
    console.error('Time ago calculation error:', error);
    return 'Unknown';
  }
};

// Get next status for order progression
export const getNextStatus = (currentStatus) => {
  const statusFlow = {
    pending: 'confirmed',
    confirmed: 'assigned',
    assigned: 'picked_up',
    picked_up: 'out_for_delivery',
    out_for_delivery: 'delivered'
  };
  
  return statusFlow[currentStatus] || null;
};

// Check if status can be updated
export const canUpdateStatus = (currentStatus, userRole) => {
  if (userRole === 'admin') return true;
  
  const updatableStatuses = {
    customer: ['pending'], // Customers can only cancel pending orders
    delivery_agent: ['assigned', 'picked_up', 'out_for_delivery']
  };
  
  return updatableStatuses[userRole]?.includes(currentStatus) || false;
};

// Generate random order items (for demo)
export const generateDemoItems = () => {
  const items = [
    'Pizza Margherita',
    'Chicken Burger',
    'Veg Biryani',
    'Pasta Alfredo',
    'Fish Curry',
    'Paneer Tikka',
    'Chocolate Cake',
    'Green Salad',
    'Soft Drinks',
    'Ice Cream'
  ];
  
  const numItems = Math.floor(Math.random() * 3) + 1;
  const selectedItems = [];
  
  for (let i = 0; i < numItems; i++) {
    const randomItem = items[Math.floor(Math.random() * items.length)];
    if (!selectedItems.includes(randomItem)) {
      selectedItems.push(randomItem);
    }
  }
  
  return selectedItems;
};

// Calculate delivery fee
export const calculateDeliveryFee = (orderTotal) => {
  if (orderTotal >= 500) return 0; // Free delivery over ₹500
  return 40; // ₹40 delivery fee
};

// Calculate tax
export const calculateTax = (subtotal) => {
  return Math.round(subtotal * 0.05); // 5% tax
};

// Calculate order total
export const calculateOrderTotal = (subtotal) => {
  const tax = calculateTax(subtotal);
  const deliveryFee = calculateDeliveryFee(subtotal);
  return subtotal + tax + deliveryFee;
};

// Local storage helpers
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// API error handler
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    // Clear auth and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    return 'Session expired. Please login again.';
  }
  
  if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  
  if (error.message?.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message?.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Create helpers object and export as default
const helpers = {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  getOrderStatusColor,
  getStatusText,
  truncateText,
  formatOrderId,
  isValidEmail,
  isValidPhone,
  formatPhone,
  timeAgo,
  getNextStatus,
  canUpdateStatus,
  generateDemoItems,
  calculateDeliveryFee,
  calculateTax,
  calculateOrderTotal,
  saveToLocalStorage,
  getFromLocalStorage,
  debounce,
  handleApiError
};

export default helpers;