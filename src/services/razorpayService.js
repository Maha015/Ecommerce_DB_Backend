// src/services/razorpayService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ecommerce-db-backend-b4xf.onrender.com/api';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with default config
const razorpayAPI = axios.create({
  baseURL: `${API_URL}/razorpay`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
razorpayAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Razorpay Service
const razorpayService = {
  /**
   * Create a Razorpay order
   * @param {number} amount - Amount in rupees
   * @param {string} currency - Currency code (default: INR)
   * @param {string} receipt - Receipt ID
   * @returns {Promise} Razorpay order object
   */
  createOrder: async (amount, currency = 'INR', receipt = null) => {
    try {
      const response = await razorpayAPI.post('/create-order', {
        amount,
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      });

      return response.data;
    } catch (error) {
      console.error('❌ Create Razorpay order error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Verify Razorpay payment
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Razorpay signature
   * @returns {Promise} Verification result
   */
  verifyPayment: async (orderId, paymentId, signature) => {
    try {
      const response = await razorpayAPI.post('/verify-payment', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

      return response.data;
    } catch (error) {
      console.error('❌ Verify payment error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get payment details
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise} Payment details
   */
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await razorpayAPI.get(`/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Get payment details error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Initiate refund
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Refund amount (optional, for partial refund)
   * @param {string} reason - Refund reason
   * @returns {Promise} Refund details
   */
  initiateRefund: async (paymentId, amount = null, reason = '') => {
    try {
      const response = await razorpayAPI.post('/refund', {
        paymentId,
        amount,
        reason,
      });

      return response.data;
    } catch (error) {
      console.error('❌ Initiate refund error:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Open Razorpay checkout
   * @param {object} options - Razorpay checkout options
   * @returns {Promise} Payment result
   */
  openCheckout: (options) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      const razorpay = new window.Razorpay({
        ...options,
        handler: (response) => {
          resolve(response);
        },
        modal: {
          ...options.modal,
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          },
        },
      });

      razorpay.on('payment.failed', (response) => {
        reject(response.error);
      });

      razorpay.open();
    });
  },
};

export default razorpayService;