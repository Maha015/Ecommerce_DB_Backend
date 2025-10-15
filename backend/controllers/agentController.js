const User = require('../models/User');
const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');

// @desc    Get all delivery agents
// @route   GET /api/agents
// @access  Private (Admin only)
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await DeliveryAgent.find()
      .populate('user', 'name email phone isActive')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get specific delivery agent
// @route   GET /api/agents/:id
// @access  Private
exports.getAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.params.id)
      .populate('user', 'name email phone isActive');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent not found'
      });
    }

    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create delivery agent
// @route   POST /api/agents
// @access  Private (Admin only)
exports.createAgent = async (req, res) => {
  try {
    const { userId, vehicleType, vehicleNumber, licenseNumber, deliveryZones } = req.body;

    // Check if user exists and is not already an agent
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a delivery agent
    const existingAgent = await DeliveryAgent.findOne({ user: userId });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'User is already a delivery agent'
      });
    }

    // Update user role to delivery_agent
    user.role = 'delivery_agent';
    await user.save();

    // Create delivery agent profile
    const agent = await DeliveryAgent.create({
      user: userId,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      deliveryZones: deliveryZones || []
    });

    const populatedAgent = await DeliveryAgent.findById(agent._id)
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedAgent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update delivery agent
// @route   PUT /api/agents/:id
// @access  Private (Admin or Agent themselves)
exports.updateAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent not found'
      });
    }

    // Check if user is admin or the agent themselves
    if (req.user.role !== 'admin' && agent.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this agent'
      });
    }

    const updatedAgent = await DeliveryAgent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: updatedAgent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update agent location
// @route   PUT /api/agents/:id/location
// @access  Private (Agent only)
exports.updateAgentLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    const agent = await DeliveryAgent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent not found'
      });
    }

    // Check if user is the agent themselves
    if (agent.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this location'
      });
    }

    agent.currentLocation = {
      lat,
      lng,
      lastUpdated: new Date()
    };
    
    await agent.save();

    res.status(200).json({
      success: true,
      data: agent.currentLocation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle agent availability
// @route   PUT /api/agents/:id/availability
// @access  Private (Agent only)
exports.toggleAvailability = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent not found'
      });
    }

    // Check if user is the agent themselves
    if (agent.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update availability'
      });
    }

    agent.isAvailable = !agent.isAvailable;
    agent.updatedAt = Date.now();
    
    await agent.save();

    res.status(200).json({
      success: true,
      data: {
        isAvailable: agent.isAvailable
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get agent statistics
// @route   GET /api/agents/:id/stats
// @access  Private
exports.getAgentStats = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent not found'
      });
    }

    // Get recent orders for this agent
    const orders = await Order.find({ deliveryAgent: agent.user })
      .sort('-createdAt')
      .limit(10);

    // Calculate additional stats
    const totalOrders = await Order.countDocuments({ deliveryAgent: agent.user });
    const deliveredOrders = await Order.countDocuments({ 
      deliveryAgent: agent.user, 
      status: 'delivered' 
    });
    
    const completionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    // Update agent stats
    agent.stats.totalDeliveries = deliveredOrders;
    agent.stats.completionRate = completionRate;
    await agent.save();

    res.status(200).json({
      success: true,
      data: {
        stats: agent.stats,
        recentOrders: orders,
        totalOrders,
        deliveredOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deactivate delivery agent
// @route   DELETE /api/agents/:id
// @access  Private (Admin only)
exports.deactivateAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent not found'
      });
    }

    // Update user role back to customer
    await User.findByIdAndUpdate(agent.user, { role: 'customer', isActive: false });

    // Mark agent as inactive
    agent.isAvailable = false;
    agent.updatedAt = Date.now();
    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Delivery agent deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};