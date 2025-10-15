// routes/wishlist.js - FINAL VERSION WITH VALIDATION
import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET user's wishlist
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = String(req.user.userId);
    const targetUserId = String(userId);

    console.log(`❤️ Wishlist GET - Auth: ${requestUserId}, Target: ${targetUserId}`);

    if (requestUserId !== targetUserId && req.user.role !== 'admin') {
      console.log('❌ Authorization failed: User IDs do not match');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this wishlist' 
      });
    }

    const wishlist = await Wishlist.findOne({ userId: targetUserId });
    
    console.log(`❤️ Wishlist fetched:`, wishlist?.items?.length || 0, 'items');
    
    res.json({ 
      success: true, 
      data: wishlist?.items || [] 
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ADD item to wishlist - WITH VALIDATION
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = String(req.user.userId);
    const targetUserId = String(userId);

    console.log(`❤️ Wishlist ADD - Auth: ${requestUserId}, Target: ${targetUserId}`);

    if (requestUserId !== targetUserId && req.user.role !== 'admin') {
      console.log('❌ Authorization failed: User IDs do not match');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this wishlist' 
      });
    }

    const { productId, name, price, image, rating, category, description } = req.body;
    
    // Validate required fields
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Product price is required'
      });
    }

    console.log(`❤️ Adding product to wishlist:`, { productId, name, price, image });

    // Create product object with defaults for optional fields
    const productData = {
      productId: String(productId),
      name: String(name),
      price: Number(price),
      image: image ? String(image) : '/placeholder.png',
      rating: rating ? Number(rating) : 0,
      category: category ? String(category) : 'general',
      description: description ? String(description) : name
    };

    // Double-check image field
    if (!productData.image || productData.image === 'undefined' || productData.image === 'null') {
      productData.image = '/placeholder.png';
      console.warn('⚠️ Image missing, using placeholder');
    }

    let wishlist = await Wishlist.findOne({ userId: targetUserId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: targetUserId, items: [] });
      console.log(`❤️ Creating new wishlist for user ${targetUserId}`);
    }

    // Check if item already exists
    const existingItemIndex = wishlist.items.findIndex(
      item => String(item.productId) === String(productId)
    );

    if (existingItemIndex === -1) {
      // Add new item
      wishlist.items.push(productData);
      await wishlist.save();
      
      console.log(`✅ Item added to wishlist. Total:`, wishlist.items.length);
      
      res.json({ 
        success: true, 
        data: wishlist.items,
        message: 'Added to wishlist successfully!'
      });
    } else {
      // Item already exists - optionally update it
      console.log(`ℹ️ Item already in wishlist at index ${existingItemIndex}`);
      
      // Update existing item with new data
      wishlist.items[existingItemIndex] = {
        ...wishlist.items[existingItemIndex].toObject(),
        ...productData,
        addedAt: wishlist.items[existingItemIndex].addedAt // Keep original date
      };
      await wishlist.save();
      
      res.json({ 
        success: true, 
        data: wishlist.items,
        message: 'Item already in wishlist (updated)'
      });
    }
  } catch (error) {
    console.error('Add to wishlist error:', error);
    console.error('Error details:', error.errors);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// REMOVE item from wishlist - ENHANCED
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const requestUserId = String(req.user.userId);
    const targetUserId = String(userId);

    console.log(`❤️ Wishlist REMOVE - Auth: ${requestUserId}, Target: ${targetUserId}, Product: ${productId}`);

    if (requestUserId !== targetUserId && req.user.role !== 'admin') {
      console.log('❌ Authorization failed: User IDs do not match');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this wishlist' 
      });
    }

    const wishlist = await Wishlist.findOne({ userId: targetUserId });
    
    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wishlist not found' 
      });
    }

    const initialLength = wishlist.items.length;
    const cleanProductId = String(productId).trim();
    
    console.log(`🔍 Looking for product: "${cleanProductId}" in ${initialLength} items`);
    console.log(`📋 Current items:`, wishlist.items.map(i => i.productId));
    
    // Find the index of the item to remove
    const itemIndex = wishlist.items.findIndex(item => {
      const itemProductId = String(item.productId).trim();
      return itemProductId === cleanProductId;
    });

    if (itemIndex === -1) {
      console.log(`❌ Item not found in wishlist`);
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    // Remove the specific item using splice (more reliable than filter)
    const removedItem = wishlist.items[itemIndex];
    console.log(`🗑️ Removing item at index ${itemIndex}:`, removedItem.productId);
    
    wishlist.items.splice(itemIndex, 1);
    
    // Save the updated wishlist
    await wishlist.save();
    
    console.log(`✅ Item removed successfully. Remaining:`, wishlist.items.length);
    console.log(`📋 Remaining items:`, wishlist.items.map(i => i.productId));
    
    res.json({ 
      success: true, 
      data: wishlist.items,
      message: 'Removed from wishlist successfully!',
      removed: {
        productId: removedItem.productId,
        name: removedItem.name
      }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// CLEAR entire wishlist
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = String(req.user.userId);
    const targetUserId = String(userId);

    console.log(`❤️ Wishlist CLEAR - Auth: ${requestUserId}, Target: ${targetUserId}`);

    if (requestUserId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this wishlist' 
      });
    }

    const wishlist = await Wishlist.findOne({ userId: targetUserId });
    
    if (!wishlist) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wishlist not found' 
      });
    }

    wishlist.items = [];
    await wishlist.save();
    
    console.log(`✅ Wishlist cleared for user ${targetUserId}`);
    
    res.json({ 
      success: true, 
      data: [],
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DEBUG endpoint - Get raw wishlist data (remove in production)
router.get('/:userId/debug', async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = String(req.user.userId);
    const targetUserId = String(userId);

    if (requestUserId !== targetUserId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const wishlist = await Wishlist.findOne({ userId: targetUserId }).lean();
    
    res.json({ 
      success: true,
      debug: {
        userId: targetUserId,
        itemCount: wishlist?.items?.length || 0,
        items: wishlist?.items?.map(item => ({
          productId: item.productId,
          productIdType: typeof item.productId,
          productIdLength: String(item.productId).length,
          name: item.name,
          hasImage: !!item.image,
          addedAt: item.addedAt
        })) || [],
        rawWishlist: wishlist
      }
    });
  } catch (error) {
    console.error('Debug wishlist error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;