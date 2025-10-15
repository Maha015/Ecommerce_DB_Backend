// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import  connectDB  from "./config/config.js";
import jwt from "jsonwebtoken";

// Import routes (NO DUPLICATES)
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import dashboardRoutes from './routes/dashboard.js';
import productsRoutes from './routes/products.js';
import userRoutes from "./routes/users.js";
import orderRoutes from "./routes/orders.js";
import agentRoutes from "./routes/agentRoutes.js";
import analyticsRoutes from "./routes/analytics.js";
import razorpayRoutes from "./routes/razorpay.js";

// Import models
import User from "./models/User.js";
import Order from "./models/Order.js";
import Cart from './models/Cart.js';
import Wishlist from './models/Wishlist.js';


// Import middleware
import { authenticateToken } from './middleware/auth.js';
import errorHandler from "./middleware/errorHandler.js";
import corsMiddleware from "./middleware/cors.js";

dotenv.config();
connectDB();

const app = express();

// ========================================
// MIDDLEWARE
// ========================================
// CORS must be first to handle preflight requests
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'E-commerce Delivery API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      orders: '/api/orders',
      dashboard: '/api/dashboard',
      products: '/api/products'
    }
  });
});

// ========================================
// AUTHENTICATION ROUTES
// ========================================

// REGISTER ENDPOINT
app.post('/api/register', async (req, res) => {
  try {
    console.log('📝 Registration request received:', { 
      ...req.body, 
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });

    const { name, email, password, confirmPassword, role, phone, address } = req.body;

    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, and password are required' 
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Name must be at least 2 characters long' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address' 
      });
    }

    if (trimmedPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (confirmPassword && trimmedPassword !== confirmPassword.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Passwords do not match' 
      });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      console.log('❌ User already exists:', trimmedEmail);
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered. Please use a different email.' 
      });
    }

    const newUser = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      role: role || 'customer',
      createdAt: new Date()
    });

    const savedUser = await newUser.save();
    
    console.log('✅ User registered successfully:', {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.',
      user: {
        id: savedUser._id,
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        phone: savedUser.phone,
        address: savedUser.address
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration. Please try again.' 
    });
  }
});

// LOGIN ENDPOINT
// LOGIN ENDPOINT - FIXED TO USE STRING ID
app.post('/api/login', async (req, res) => {
  try {
    console.log('🔐 Login request received for:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      console.log('❌ User not found:', trimmedEmail);
      return res.status(404).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    if (trimmedPassword !== user.password) {
      console.log('❌ Password mismatch for user:', trimmedEmail);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // ✅ CRITICAL FIX: Convert _id to string for JWT
    const userIdString = String(user._id);

    const token = jwt.sign(
      { 
        userId: userIdString,  // ✅ Store as string
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "24h" }
    );

    user.lastLogin = new Date();
    await user.save();

    console.log('✅ Login successful:', {
      id: userIdString,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userIdString,
        _id: userIdString,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      },
      token: token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login. Please try again.' 
    });
  }
});

// VERIFY TOKEN ENDPOINT
app.get('/api/verify-token', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Token verification failed' 
    });
  }
});

// CREATE DEFAULT USERS
app.post('/api/create-default-users', async (req, res) => {
  try {
    const defaultUsers = [
      { name: 'Admin User', email: 'admin@delivery.com', phone: '9999999999', password: 'admin123', role: 'admin', address: 'Admin Office' },
      { name: 'Delivery Agent 1', email: 'agent1@delivery.com', phone: '8888888881', password: 'agent123', role: 'delivery_agent', address: 'Agent Hub 1' },
      { name: 'Delivery Agent 2', email: 'agent2@delivery.com', phone: '8888888882', password: 'agent123', role: 'delivery_agent', address: 'Agent Hub 2' },
      { name: 'Delivery Agent 3', email: 'agent3@delivery.com', phone: '8888888883', password: 'agent123', role: 'delivery_agent', address: 'Agent Hub 3' }
    ];

    const createdUsers = [];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const newUser = new User(userData);
        const savedUser = await newUser.save();
        createdUsers.push({ name: savedUser.name, email: savedUser.email, role: savedUser.role });
      }
    }

    res.json({ 
      success: true,
      message: 'Default users processed', 
      created: createdUsers 
    });

  } catch (error) {
    console.error('Error creating default users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update all agents to available status
app.post('/api/admin/update-all-agents-status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    const result = await User.updateMany(
      { role: 'delivery_agent' },
      { 
        $set: { 
          status: 'available',
          isOnline: true 
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} delivery agents`);

    res.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} agents`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('❌ Update agents error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========================================
// PROTECTED ROUTES (Authentication required)
// ========================================

// ✅ ANALYTICS ROUTES - MOVE TO TOP, RIGHT AFTER AUTHENTICATION ROUTES
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Cart routes
app.use('/api/cart', authenticateToken, cartRoutes);

// Wishlist routes
app.use('/api/wishlist', authenticateToken, wishlistRoutes);

// Dashboard routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);

// Product routes
app.use('/api/products', productsRoutes);

// User routes
app.use('/api/users', authenticateToken, userRoutes);

// Agent routes
app.use('/api/agents', authenticateToken, agentRoutes);

app.use('/api/razorpay', authenticateToken, razorpayRoutes);




// ========================================
// ORDER ROUTES (Custom implementation)
// ========================================

// Get Orders with filters
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { customer, status, limit } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    console.log(`📦 Orders requested by ${userRole} (${userId})`);

    let query = {};

    if (userRole === 'customer') {
      query.customer = userId;
    } else if (userRole === 'delivery_agent') {
      query.deliveryAgent = userId;
    }

    if (customer) query.customer = customer;
    if (status) query.status = status;

    let ordersQuery = Order.find(query)
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name email phone')
      .sort({ createdAt: -1 });

    if (limit) {
      ordersQuery = ordersQuery.limit(parseInt(limit));
    }

    const orders = await ordersQuery;

    console.log(`📦 Found ${orders.length} orders`);

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Replace your existing POST /api/orders endpoint with this:
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    console.log('📦 Create order request:', req.body);

    const orderData = req.body;

    // Get logged-in user ID from token
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Fetch user details from DB
    const user = await User.findById(userId);

    // ✅ Construct the new order safely
    const newOrder = new Order({
      customer: userId,
      phone:
        orderData.phone ||
        orderData.deliveryDetails?.phone ||
        user?.phone ||
        'N/A',
      deliveryAddress:
        orderData.deliveryAddress ||
        orderData.deliveryDetails?.address ||
        user?.address ||
        'Not provided',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: orderData.paymentMethod === 'razorpay' ? 'paid' : 'pending',
      razorpayPaymentId: orderData.paymentDetails?.razorpayPaymentId || null,
      status: 'pending',
      createdAt: new Date(),
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          updatedBy: userId,
        },
      ],
    });

    await newOrder.save();

    console.log('✅ Order created successfully:', newOrder._id);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// server.js
// Update Order Status
app.put('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    console.log(`📦 Status update requested: Order ${orderId} to ${status} by ${userRole}`);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (userRole === 'customer' && order.customer.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this order' 
      });
    }

    if (userRole === 'delivery_agent' && order.deliveryAgent?.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this order' 
      });
    }

    order.status = status;
    order.updatedAt = new Date();
    
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: userId
    });

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('deliveryAgent', 'name email phone');

    console.log(`✅ Order ${orderId} status updated to ${status}`);

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Around line 150 in server.js, ADD this route BEFORE the existing cart routes:
app.delete('/api/cart/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = String(req.user.userId);
    const targetUserId = String(userId);

    if (authUserId !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to modify this cart' 
      });
    }

    await Cart.findOneAndUpdate(
      { userId: targetUserId },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );

    res.json({ 
      success: true, 
      data: [],
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});



// server.js - Fixed DELETE endpoint with better logging
app.delete('/api/wishlist/:userId/:productId', authenticateToken, async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const authUserId = String(req.user.userId);
    
    console.log('🗑️ DELETE wishlist item - User:', userId, 'Product:', productId);
    
    // Authorization check
    if (authUserId !== String(userId) && req.user.role !== 'admin') {
      console.error('❌ Authorization failed:', authUserId, 'trying to modify', userId);
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to modify this wishlist' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    console.log('📋 Current wishlist before removal:', user.wishlist.map(item => ({
      productId: item.productId,
      addedAt: item.addedAt
    })));

    // Find the product in wishlist
    const index = user.wishlist.findIndex(item => 
      String(item.productId) === String(productId)
    );
    
    if (index === -1) {
      console.error('❌ Product not in wishlist:', productId);
      console.log('Available products:', user.wishlist.map(item => item.productId));
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found in wishlist' 
      });
    }

    // Remove the item
    const removedItem = user.wishlist[index];
    user.wishlist.splice(index, 1);
    await user.save();

    console.log('✅ Removed from wishlist:', removedItem.productId);
    console.log('📋 Remaining wishlist:', user.wishlist.map(item => item.productId));

    res.json({ 
      success: true, 
      message: 'Product removed from wishlist',
      remainingCount: user.wishlist.length
    });
  } catch (error) {
    console.error('❌ Remove wishlist item error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to remove item from wishlist' 
    });
  }
});

// ============================================
// GET WISHLIST
// ============================================
app.get('/api/wishlist/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = String(req.user.userId);
    
    if (authUserId !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      // Create new wishlist if it doesn't exist
      wishlist = new Wishlist({ userId, items: [] });
      await wishlist.save();
    }

    console.log('✅ GET wishlist for user:', userId, '- Items:', wishlist.items.length);

    res.json({ 
      success: true, 
      items: wishlist.items 
    });
  } catch (error) {
    console.error('❌ Get wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// ADD TO WISHLIST
// ============================================
app.post('/api/wishlist/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = String(req.user.userId);
    
    if (authUserId !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }

    const { productId, name, price, image, rating, category, description } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: productId, name, price' 
      });
    }

    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Check if product already exists
    const existingItem = wishlist.items.find(
      item => String(item.productId) === String(productId)
    );

    if (existingItem) {
      console.log('⚠️ Product already in wishlist:', productId);
      return res.status(400).json({ 
        success: false, 
        error: 'Product already in wishlist' 
      });
    }

    // Add new item
    wishlist.items.push({
      productId,
      name,
      price,
      image: image || '/placeholder.png',
      rating: rating || 0,
      category: category || 'general',
      description: description || '',
      addedAt: new Date()
    });

    await wishlist.save();

    console.log('✅ Added to wishlist:', productId, '- Total items:', wishlist.items.length);

    res.json({ 
      success: true, 
      message: 'Product added to wishlist',
      items: wishlist.items 
    });
  } catch (error) {
    console.error('❌ Add to wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Optional: Add a clear all endpoint for debugging
app.delete('/api/wishlist/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = String(req.user.userId);
    
    console.log('🗑️ CLEAR entire wishlist - User:', userId);
    
    if (authUserId !== String(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to modify this wishlist' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const itemCount = user.wishlist.length;
    user.wishlist = [];
    await user.save();

    console.log('✅ Cleared wishlist - Removed', itemCount, 'items');

    res.json({ 
      success: true, 
      message: `Cleared ${itemCount} items from wishlist` 
    });
  } catch (error) {
    console.error('❌ Clear wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to clear wishlist' 
    });
  }
});
// ========================================
// PROFILE ROUTES
// ========================================

// Update Profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    console.log('👤 Profile update request for user:', userId);

    delete updates.password;
    delete updates.role;
    delete updates._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ Profile updated for user:', userId);

    res.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// ========================================
// ERROR HANDLING
// ========================================
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ========================================
// SERVER START
// ========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await mongoose.connection.close();
  process.exit(0);
});