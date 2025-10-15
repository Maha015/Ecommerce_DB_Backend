import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignOrder,
  cancelOrder,
  addRating
} from '../controllers/orderController.js';

import {
  validateOrderCreation,
  validateStatusUpdate,
  validateAgentAssignment,
  validateRating,
  handleValidationErrors
} from '../middleware/validation.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// =====================
// All routes are protected
// =====================
router.use(protect);

// =====================
// Orders routes
// =====================
router
  .route('/')
  .get(getOrders)
  .post(
    authorize('customer'),
    validateOrderCreation,
    handleValidationErrors,
    createOrder
  );

router
  .route('/:id')
  .get(getOrder);

router.put(
  '/:id/status',
  authorize('admin', 'delivery_agent'),
  validateStatusUpdate,
  handleValidationErrors,
  updateOrderStatus
);

router.put(
  '/:id/assign',
  authorize('admin'),
  validateAgentAssignment,
  handleValidationErrors,
  assignOrder
);

router.put('/:id/cancel', cancelOrder);

router.put(
  '/:id/rating',
  authorize('customer'),
  validateRating,
  handleValidationErrors,
  addRating
);

// =====================
// Export the router
// =====================
export default router;
