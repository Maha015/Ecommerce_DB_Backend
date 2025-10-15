// backend/controllers/analyticsController.js - COMPLETE WITH STATUS UPDATES
import Order from '../models/Order.js';
import User from '../models/User.js';

// =====================
// ✨ NEW: UPDATE AGENT STATUS
// =====================
export const updateAgentStatus = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { status, isOnline } = req.body;
    
    console.log(`🔄 Updating agent status:`, { userId, status, isOnline });
    
    const validStatuses = ['available', 'busy', 'offline'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: available, busy, or offline'
      });
    }
    
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('✅ Agent status updated:', { 
      name: user.name, 
      status: user.status, 
      isOnline: user.isOnline 
    });
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: user
    });
    
  } catch (error) {
    console.error('❌ Update agent status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// =====================
// ✨ NEW: GET AGENT PROFILE
// =====================
export const getAgentProfile = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('❌ Get agent profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// =====================
// GET ALL ORDERS (for admin modal)
// =====================
export const getAllOrders = async (req, res) => {
  try {
    console.log('📋 Getting all orders for admin modal...');
    
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${orders.length} total orders`);
    
    res.json({
      success: true,
      data: orders
    });
    
  } catch (error) {
    console.error('❌ Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all orders',
      error: error.message
    });
  }
};

// =====================
// ADMIN DASHBOARD STATS
// =====================
export const getAdminDashboardStats = async (req, res) => {
  try {
    console.log('📊 Getting admin dashboard stats...');
    
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalAgents = await User.countDocuments({ role: 'delivery_agent' });
    
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    const pendingOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'confirmed'] } 
    });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    const recentOrders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    const deliveryAgents = await User.find({ role: 'delivery_agent' })
      .select('name email phone isOnline status')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log('✅ Admin stats fetched successfully');
    
    res.json({
      success: true,
      data: {
        totalOrders,
        totalCustomers,
        totalAgents,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders,
        deliveredOrders,
        recentOrders,
        deliveryAgents
      }
    });
    
  } catch (error) {
    console.error('❌ Get admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard statistics',
      error: error.message
    });
  }
};

// =====================
// GET ALL DELIVERY AGENTS
// =====================
export const getAllDeliveryAgents = async (req, res) => {
  try {
    console.log('🚚 Getting all delivery agents...');
    
    const agents = await User.find({ role: 'delivery_agent' })
      .select('name email phone isOnline status')
      .sort({ name: 1 })
      .lean();
    
    console.log(`✅ Found ${agents.length} delivery agents`);
    
    res.json({
      success: true,
      data: agents
    });
    
  } catch (error) {
    console.error('❌ Get delivery agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery agents',
      error: error.message
    });
  }
};

// =====================
// GET UNASSIGNED ORDERS
// =====================
export const getUnassignedOrders = async (req, res) => {
  try {
    console.log('📦 Getting unassigned orders...');
    
    const orders = await Order.find({
      $or: [
        { deliveryAgent: null },
        { deliveryAgent: { $exists: false } }
      ],
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Found ${orders.length} unassigned orders`);
    
    res.json({
      success: true,
      data: orders
    });
    
  } catch (error) {
    console.error('❌ Get unassigned orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unassigned orders',
      error: error.message
    });
  }
};

// =====================
// ASSIGN ORDER TO AGENT
// =====================
export const assignOrderToAgent = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { agentId } = req.body;
    
    console.log(`🎯 Assigning order ${orderId} to agent ${agentId}...`);
    
    const agent = await User.findOne({ 
      _id: agentId, 
      role: 'delivery_agent' 
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent not found'
      });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.deliveryAgent = agentId;
    order.status = 'assigned';
    
    if (order.statusHistory) {
      order.statusHistory.push({
        status: 'assigned',
        timestamp: new Date(),
        updatedBy: req.user.id || req.user.userId
      });
    }
    
    await order.save();
    
    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name email phone');
    
    console.log('✅ Order assigned successfully');
    
    res.json({
      success: true,
      message: 'Order assigned successfully',
      data: updatedOrder
    });
    
  } catch (error) {
    console.error('❌ Assign order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign order',
      error: error.message
    });
  }
};

// =====================
// CUSTOMER DASHBOARD STATS
// =====================
export const getCustomerDashboardStats = async (customerId) => {
  const totalOrders = await Order.countDocuments({ customer: customerId });
  const deliveredOrders = await Order.countDocuments({ 
    customer: customerId, 
    status: 'delivered' 
  });
  const pendingOrders = await Order.countDocuments({ 
    customer: customerId, 
    status: { $in: ['pending', 'confirmed', 'assigned', 'picked_up', 'out_for_delivery'] } 
  });

  const totalSpent = await Order.aggregate([
    { $match: { customer: customerId, status: 'delivered' } }, 
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);

  const recentOrders = await Order.find({ customer: customerId })
    .populate('deliveryAgent', 'name phone')
    .sort({ createdAt: -1 })
    .limit(5);

  const orderHistory = await Order.aggregate([
    { 
      $match: { 
        customer: customerId, 
        createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } 
      } 
    },
    { 
      $group: { 
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        }, 
        count: { $sum: 1 }, 
        spent: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0] } } 
      } 
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return {
    overview: { 
      totalOrders, 
      deliveredOrders, 
      pendingOrders, 
      totalSpent: totalSpent[0]?.total || 0 
    },
    recentOrders,
    orderHistory
  };
};

// =====================
// DELIVERY AGENT DASHBOARD STATS
// =====================
export const getDeliveryAgentDashboardStats = async (agentId) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const totalOrders = await Order.countDocuments({ deliveryAgent: agentId });
  const deliveredOrders = await Order.countDocuments({ 
    deliveryAgent: agentId, 
    status: 'delivered' 
  });
  const pendingOrders = await Order.countDocuments({ 
    deliveryAgent: agentId, 
    status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] } 
  });

  const todayDeliveries = await Order.countDocuments({ 
    deliveryAgent: agentId, 
    status: 'delivered', 
    actualDelivery: { $gte: startOfDay } 
  });

  const totalEarnings = await Order.aggregate([
    { $match: { deliveryAgent: agentId, status: 'delivered' } }, 
    { $group: { _id: null, total: { $sum: { $multiply: ['$total', 0.1] } } } }
  ]);
  
  const todayEarnings = await Order.aggregate([
    { 
      $match: { 
        deliveryAgent: agentId, 
        status: 'delivered', 
        actualDelivery: { $gte: startOfDay } 
      } 
    }, 
    { $group: { _id: null, total: { $sum: { $multiply: ['$total', 0.1] } } } }
  ]);

  const ratings = await Order.find({ 
    deliveryAgent: agentId, 
    'rating.score': { $exists: true } 
  }).select('rating.score');
  
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, order) => sum + order.rating.score, 0) / ratings.length 
    : 0;

  const currentOrders = await Order.find({ 
    deliveryAgent: agentId, 
    status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] } 
  })
    .populate('customer', 'name phone address')
    .sort({ createdAt: -1 });

  const deliveryTrends = await Order.aggregate([
    { 
      $match: { 
        deliveryAgent: agentId, 
        status: 'delivered', 
        actualDelivery: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      } 
    },
    { 
      $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$actualDelivery" } }, 
        count: { $sum: 1 }, 
        earnings: { $sum: { $multiply: ['$total', 0.1] } } 
      } 
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    overview: { 
      totalOrders, 
      deliveredOrders, 
      pendingOrders, 
      averageRating: Math.round(averageRating * 10) / 10, 
      completionRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0 
    },
    earnings: { 
      total: totalEarnings[0]?.total || 0, 
      today: todayEarnings[0]?.total || 0 
    },
    today: { deliveries: todayDeliveries },
    currentOrders,
    deliveryTrends
  };
};

// =====================
// DASHBOARD STATS BY ROLE
// =====================
export const getDashboardStats = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;

    let stats = {};

    switch (role) {
      case 'admin':
        return await getAdminDashboardStats(req, res);
        
      case 'customer':
        stats = await getCustomerDashboardStats(userId);
        break;
        
      case 'delivery_agent':
        stats = await getDeliveryAgentDashboardStats(userId);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};