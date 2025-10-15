// 15. routes/products.js
// ========================================

import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET popular/trending products
router.get('/popular', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true })
      .sort({ sales: -1, rating: -1 })
      .limit(10);
    
    res.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET all products with filters
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (inStock) filter.inStock = inStock === 'true';
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);
    res.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET single product
// GET single product by custom id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }); // use `id` instead of _id
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    res.json({ 
      success: true, 
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});




export default router;