import User from '../models/User.js';
import Order from '../models/Order.js';
import bcrypt from 'bcryptjs';

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'customer'
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    user.password = undefined;

    res.status(200).json({ success: true, data: user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    user.updatedAt = new Date();
    await user.save();

    user.password = undefined;

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date();

    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all customers (Admin only)
// @route   GET /api/customers
// @access  Private (Admin)
export const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: 'customer' });

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer orders (Admin only)
// @route   GET /api/customers/:id/orders
// @access  Private (Admin)
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.params.id;

    const customer = await User.findOne({ _id: customerId, role: 'customer' }).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const orders = await Order.find({ customer: customerId })
      .populate('deliveryAgent', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      customer,
      orders: { count: orders.length, data: orders }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all delivery agents (Admin only)
// @route   GET /api/agents
// @access  Private (Admin)
export const getDeliveryAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'delivery_agent' }).select('-password').sort({ createdAt: -1 });

    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const totalOrders = await Order.countDocuments({ deliveryAgent: agent._id });
        const deliveredOrders = await Order.countDocuments({ deliveryAgent: agent._id, status: 'delivered' });

        const ratings = await Order.find({ deliveryAgent: agent._id, 'rating.score': { $exists: true } }).select('rating.score');

        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, order) => sum + order.rating.score, 0) / ratings.length
          : 0;

        return {
          ...agent.toObject(),
          stats: {
            totalOrders,
            deliveredOrders,
            averageRating: Math.round(averageRating * 10) / 10,
            completionRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0
          }
        };
      })
    );

    res.status(200).json({ success: true, count: agentsWithStats.length, data: agentsWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create delivery agent
// @route   POST /api/agents
// @access  Private (Admin)
export const createDeliveryAgent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, phone, password: hashedPassword, role: 'delivery_agent' });

    user.password = undefined;

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery agent
// @route   PUT /api/agents/:id
// @access  Private (Admin)
export const updateDeliveryAgent = async (req, res) => {
  try {
    const { name, phone, isActive } = req.body;

    const agent = await User.findOne({ _id: req.params.id, role: 'delivery_agent' });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found' });

    if (name) agent.name = name;
    if (phone) agent.phone = phone;
    if (typeof isActive === 'boolean') agent.isActive = isActive;

    agent.updatedAt = new Date();
    await agent.save();

    agent.password = undefined;

    res.status(200).json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Deactivate delivery agent
// @route   DELETE /api/agents/:id
// @access  Private (Admin)
export const deleteDeliveryAgent = async (req, res) => {
  try {
    const agent = await User.findOne({ _id: req.params.id, role: 'delivery_agent' });
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found' });

    const pendingOrders = await Order.countDocuments({
      deliveryAgent: req.params.id,
      status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] }
    });

    if (pendingOrders > 0) return res.status(400).json({ success: false, message: `Cannot delete agent with ${pendingOrders} pending deliveries` });

    agent.isActive = false;
    agent.updatedAt = new Date();
    await agent.save();

    res.status(200).json({ success: true, message: 'Delivery agent deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get delivery agent statistics
// @route   GET /api/agents/:id/stats
// @access  Private
export const getAgentStats = async (req, res) => {
  try {
    const agentId = req.params.id;

    if (req.user.role !== 'admin' && req.user.id !== agentId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these statistics' });
    }

    const agent = await User.findOne({ _id: agentId, role: 'delivery_agent' }).select('-password');
    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found' });

    const totalOrders = await Order.countDocuments({ deliveryAgent: agentId });
    const deliveredOrders = await Order.countDocuments({ deliveryAgent: agentId, status: 'delivered' });
    const pendingOrders = await Order.countDocuments({ deliveryAgent: agentId, status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] } });

    const ratedOrders = await Order.find({ deliveryAgent: agentId, 'rating.score': { $exists: true } }).select('rating.score');
    const averageRating = ratedOrders.length > 0 ? ratedOrders.reduce((sum, order) => sum + order.rating.score, 0) / ratedOrders.length : 0;

    const recentOrders = await Order.find({ deliveryAgent: agentId })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      averageRating: Math.round(averageRating * 10) / 10,
      completionRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0,
      totalRatings: ratedOrders.length
    };

    res.status(200).json({ success: true, agent, stats, recentOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
