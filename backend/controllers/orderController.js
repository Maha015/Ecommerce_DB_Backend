// controllers/orderController.js
import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get all orders (filtered by role)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    let orders;
    const { role, id } = req.user;

    if (role === 'admin') {
      orders = await Order.find()
        .populate('customer', 'name email phone')
        .populate('deliveryAgent', 'name phone')
        .sort({ createdAt: -1 });
    } else if (role === 'customer') {
      orders = await Order.find({ customer: id })
        .populate('deliveryAgent', 'name phone')
        .sort({ createdAt: -1 });
    } else if (role === 'delivery_agent') {
      orders = await Order.find({ deliveryAgent: id })
        .populate('customer', 'name phone address')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('deliveryAgent', 'name phone vehicleNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const { role, id } = req.user;
    if (role === 'customer' && order.customer._id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }
    if (role === 'delivery_agent' && order.deliveryAgent?._id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer only)
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, notes } = req.body;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      customer: req.user.id,
      items,
      total,
      deliveryAddress,
      paymentMethod: paymentMethod || 'cod',
      notes,
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone');

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { role } = req.user;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const allowedTransitions = {
      admin: ['confirmed', 'cancelled'],
      delivery_agent: ['picked_up', 'out_for_delivery', 'delivered']
    };

    if (!allowedTransitions[role] || !allowedTransitions[role].includes(status)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update to this status' });
    }

    order.status = status;
    order.updatedAt = new Date();
    if (status === 'delivered') order.actualDelivery = new Date();

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name phone');

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign order to delivery agent
// @route   PUT /api/orders/:id/assign
// @access  Private (Admin only)
export const assignOrder = async (req, res) => {
  try {
    const { deliveryAgentId } = req.body;
    const agent = await User.findOne({ _id: deliveryAgentId, role: 'delivery_agent', isActive: true });

    if (!agent) return res.status(404).json({ success: false, message: 'Delivery agent not found or not available' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.deliveryAgent = deliveryAgentId;
    order.status = 'assigned';
    order.updatedAt = new Date();
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name phone vehicleNumber');

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const { role, id } = req.user;
    if (role === 'customer' && order.customer.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (!['pending', 'confirmed', 'assigned'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add rating to delivered order
// @route   PUT /api/orders/:id/rating
// @access  Private (Customer only)
export const addRating = async (req, res) => {
  try {
    const { score, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this order' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only rate delivered orders' });
    }

    order.rating = { score, review, createdAt: new Date() };
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
