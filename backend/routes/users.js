import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getCustomers,
  getCustomerOrders
} from '../controllers/userController.js';

import {
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors
} from '../middleware/validation.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// =====================
// Apply authentication middleware to all routes
// =====================
router.use(protect);

// =====================
// User Profile Routes
// =====================

// Get current user's profile
router.get('/profile', getUserProfile);

// Update current user's profile
router.put(
  '/profile',
  validateProfileUpdate,
  handleValidationErrors,
  updateUserProfile
);

// Change password for current user
router.put(
  '/password',
  validatePasswordChange,
  handleValidationErrors,
  changePassword
);

// =====================
// Admin-only routes
// =====================

// Get all customers (admin only)
router.get('/customers', authorize('admin'), getCustomers);

// Get a specific customer's orders (admin only)
router.get(
  '/customers/:id/orders',
  authorize('admin'),
  getCustomerOrders
);

// =====================
// Export router
// =====================
export default router;
