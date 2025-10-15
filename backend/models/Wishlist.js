// models/Wishlist.js - FIXED WITH OPTIONAL IMAGE FIELD
import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  productId: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: String, 
    required: false,  // Changed to optional
    default: '/placeholder.png'  // Added default
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  category: { 
    type: String,
    default: 'general'
  },
  description: {
    type: String,
    default: ''
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

const wishlistSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  items: [wishlistItemSchema],
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
wishlistSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ 'items.productId': 1 });

export default mongoose.model('Wishlist', wishlistSchema);