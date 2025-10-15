// models/Order.js
// ========================================
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ''
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'assigned',
      'picked_up',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [arr => arr.length > 0, 'Order must contain at least one item']
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi', 'razorpay'],
      default: 'cod'
    },
    // ✅ NEW: Razorpay Payment Fields
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: {
      type: String,
      default: null
    },
    razorpayPaymentId: {
      type: String,
      default: null
    },
    razorpaySignature: {
      type: String,
      default: null
    },
    // ✅ END: Razorpay Payment Fields
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'assigned',
        'picked_up',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ],
      default: 'pending'
    },
    statusHistory: [statusHistorySchema]
  },
  {
    timestamps: true // automatically adds createdAt and updatedAt
  }
);

// Automatically add a new status entry whenever status changes
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      updatedBy: this.customer // you can customize this logic in controller
    });
  }
  next();
});

// ✅ NEW: Index for Razorpay payment ID lookups
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ deliveryAgent: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;