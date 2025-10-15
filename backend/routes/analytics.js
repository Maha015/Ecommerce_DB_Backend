// backend/routes/analytics.js - FIXED VERSION
import express from 'express';
import {
  getAdminDashboardStats,
  assignOrderToAgent,
  getAllDeliveryAgents,
  getUnassignedOrders,
  getAllOrders,
  getDashboardStats,
  updateAgentStatus,
  getAgentProfile
} from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js'; // ✅ FIXED

const router = express.Router();

console.log('📊 Analytics routes initializing...');

// Apply auth middleware to all routes
router.use(authenticateToken); // ✅ FIXED

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Delivery agent middleware
const requireDeliveryAgent = (req, res, next) => {
  if (req.user?.role !== 'delivery_agent') {
    return res.status(403).json({ 
      success: false, 
      message: 'Delivery agent access required' 
    });
  }
  next();
};

// =====================
// TEST ROUTE
// =====================
router.get('/test', (req, res) => {
  console.log('✅ Analytics test route hit');
  res.json({ 
    success: true, 
    message: 'Analytics routes working!',
    user: req.user 
  });
});

// =====================
// ADMIN ROUTES
// =====================
router.get('/admin/dashboard', requireAdmin, getAdminDashboardStats);
router.get('/admin/agents', requireAdmin, getAllDeliveryAgents);
router.get('/admin/unassigned-orders', requireAdmin, getUnassignedOrders);
router.get('/admin/all-orders', requireAdmin, getAllOrders);
router.put('/admin/orders/:orderId/assign', requireAdmin, assignOrderToAgent);

// =====================
// DELIVERY AGENT ROUTES
// =====================
router.get('/agent/profile', requireDeliveryAgent, getAgentProfile);
router.put('/agent/status', requireDeliveryAgent, updateAgentStatus);

// =====================
// GENERAL DASHBOARD
// =====================
router.get('/dashboard/:role', getDashboardStats);

console.log('✅ Analytics routes configured successfully');

export default router;