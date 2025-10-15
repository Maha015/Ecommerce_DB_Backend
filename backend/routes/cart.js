// routes/cart.js - FIXED VERSION WITH PROPER ROUTE ORDERING
import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

// IMPORTANT: DELETE route MUST come BEFORE GET route to avoid conflicts
// CLEAR entire cart - DELETE /:userId (no productId)
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = String(req.user.userId);
    const targetUserId = String(userId);

    console.log(`📦 CLEAR cart - Auth: ${authUserId}, Target: ${targetUserId}`);

    if (authUserId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this cart' 
      });
    }

    // Find or create cart and clear items
    const cart = await Cart.findOneAndUpdate(
      { userId: targetUserId },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );

    console.log(`✅ Cart cleared for user ${targetUserId}`);

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

// GET user's cart
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = String(req.user.userId);
    const targetUserId = String(userId);
    
    console.log(`📦 GET Cart - Auth: ${authUserId}, Target: ${targetUserId}`);
    
    if (authUserId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this cart' 
      });
    }

    const cart = await Cart.findOne({ userId: targetUserId });
    
    console.log(`📦 Cart fetched:`, cart?.items?.length || 0, 'items');
    
    res.json({ 
      success: true, 
      data: cart?.items || [] 
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ADD item to cart
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = String(req.user.userId);
    const targetUserId = String(userId);
    
    console.log('========================================');
    console.log('📦 ADD TO CART REQUEST');
    console.log('Auth User ID:', authUserId);
    console.log('Target User ID:', targetUserId);
    console.log('Match:', authUserId === targetUserId);
    console.log('========================================');
    
    if (authUserId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this cart'
      });
    }

    const { productId, name, price, image, quantity, category } = req.body;

    console.log(`📦 Adding to cart:`, { productId, name, quantity });

    if (!productId || !name || !price || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, name, price, image'
      });
    }

    let cart = await Cart.findOne({ userId: targetUserId });

    if (!cart) {
      cart = new Cart({ userId: targetUserId, items: [] });
      console.log(`📦 Creating new cart for user ${targetUserId}`);
    }

    const existingItemIndex = cart.items.findIndex(
      item => String(item.productId) === String(productId)
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += (quantity || 1);
      console.log(`📦 Updated quantity for ${productId}:`, cart.items[existingItemIndex].quantity);
    } else {
      cart.items.push({ 
        productId: String(productId), 
        name, 
        price, 
        image, 
        quantity: quantity || 1,
        category 
      });
      console.log(`📦 Added new item ${productId} to cart`);
    }

    await cart.save();
    
    console.log(`✅ Cart saved. Total items:`, cart.items.length);
    
    res.json({ 
      success: true, 
      data: cart.items,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// UPDATE cart item quantity
router.put('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;
    const authUserId = String(req.user.userId);
    const targetUserId = String(userId);

    console.log(`📦 UPDATE Cart - Auth: ${authUserId}, Target: ${targetUserId}, Product: ${productId}`);

    if (authUserId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this cart' 
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ userId: targetUserId });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    const itemIndex = cart.items.findIndex(
      item => String(item.productId) === String(productId)
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      
      console.log(`✅ Cart quantity updated for ${productId} to ${quantity}`);
      
      res.json({ 
        success: true, 
        data: cart.items,
        message: 'Cart updated'
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// REMOVE single item from cart - DELETE /:userId/:productId
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const authUserId = String(req.user.userId);
    const targetUserId = String(userId);

    console.log(`📦 DELETE from cart - Auth: ${authUserId}, Target: ${targetUserId}, Product: ${productId}`);

    if (authUserId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this cart' 
      });
    }

    const cart = await Cart.findOne({ userId: targetUserId });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    cart.items = cart.items.filter(
      item => String(item.productId) !== String(productId)
    );

    await cart.save();
    
    console.log(`✅ Item ${productId} removed. Remaining:`, cart.items.length);
    
    res.json({ 
      success: true, 
      data: cart.items,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;