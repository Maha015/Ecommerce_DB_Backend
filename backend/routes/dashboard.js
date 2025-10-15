// 14. routes/dashboard.js
// ========================================

import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// GET dashboard statistics
router.get('/stats/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.userId;

    let stats = {};

    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const totalAgents = await User.countDocuments({ role: 'delivery_agent' });
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
      
      const orders = await Order.find();
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      stats = {
        totalOrders,
        totalCustomers,
        totalAgents,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        totalUsers
      };

    } else if (role === 'customer') {
      const customerOrders = await Order.find({ customer: userId });
      const totalOrders = customerOrders.length;
      const activeOrders = customerOrders.filter(order => 
        ['pending', 'confirmed', 'assigned', 'picked_up', 'out_for_delivery'].includes(order.status)
      ).length;
      const completedOrders = customerOrders.filter(order => order.status === 'delivered').length;
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      stats = {
        totalOrders,
        activeOrders,
        completedOrders,
        totalSpent
      };

    } else if (role === 'delivery_agent') {
      const agentOrders = await Order.find({ deliveryAgent: userId });
      const totalDeliveries = agentOrders.filter(order => order.status === 'delivered').length;
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayDeliveries = agentOrders.filter(order => 
        order.status === 'delivered' && 
        new Date(order.updatedAt) >= todayStart
      ).length;
      
      const earnings = totalDeliveries * 50;
      const rating = 4.5;
      
      const assignedOrders = await Order.find({ 
        deliveryAgent: userId,
        status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] }
      }).populate('customer', 'name email phone');
      
      const recentOrders = await Order.find({ 
        deliveryAgent: userId 
      }).populate('customer', 'name email phone').sort({ updatedAt: -1 }).limit(5);

      stats = {
        totalDeliveries,
        todayDeliveries,
        earnings,
        rating,
        assignedOrders,
        recentOrders
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats' 
    });
  }
});

export default router;