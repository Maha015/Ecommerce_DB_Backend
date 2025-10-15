// src/contexts/ProductContext.js - COMPLETE FIXED VERSION
import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';


const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toast notification system
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    toast.textContent = message;
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });
    
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 200);
    }, 2500);
  };

  // Product operations
  const loadProducts = async (params = {}) => {
    try {
      setLoading(true);
      const response = await api.getProducts(params);
      
      if (response.success) {
        setProducts(response.data || []);
      } else {
        console.error('Failed to load products:', response.error);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== WISHLIST OPERATIONS ====================
const loadWishlist = async () => {
  try {
    const response = await api.getWishlist();
    console.log('📦 Raw wishlist response:', response);
    
    if (response.success) {
      const items = response.data || [];
      console.log('✅ Wishlist loaded:', items.length, 'items');
      
      // Debug each item
      items.forEach((item, idx) => {
        console.log(`Item ${idx}:`, {
          productId: item.productId,
          name: item.name,
          _id: item._id
        });
      });
      
      setWishlist(items);
    } else {
      console.error('❌ Failed to load wishlist:', response.error);
      setWishlist([]);
    }
  } catch (error) {
    console.error('❌ Error loading wishlist:', error);
    setWishlist([]);
  }
};



const addToWishlist = async (product) => {
  try {
    const productId = product._id || product.id || product.productId;
    
    console.log('❤️ addToWishlist called with:', product);
    console.log('❤️ Extracted productId:', productId);
    
    if (!productId) {
      showToast('Invalid product', 'error');
      return { success: false, message: 'Invalid product' };
    }
    
    // Check if already in wishlist using ONLY productId
    const isAlreadyInWishlist = wishlist.some(item => 
      String(item.productId) === String(productId)
    );
    
    if (isAlreadyInWishlist) {
      showToast('Product already in wishlist', 'info');
      return { success: false, message: 'Product already in wishlist' };
    }

    // Create optimistic item with correct structure
    const optimisticItem = {
      productId: productId,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0] || '/placeholder.png',
      rating: product.rating || 0,
      category: product.category || 'general',
      description: product.description || product.name,
      addedAt: new Date()
    };
    
    console.log('❤️ Optimistic item:', optimisticItem);
    
    // Optimistic update
    setWishlist(prev => [...prev, optimisticItem]);
    
    // API call - pass the full product, not just ID
    const response = await api.addToWishlist(product);
    
    if (response.success) {
      console.log('✅ Added to wishlist successfully');
      
      // Update with server response to ensure consistency
      if (response.data) {
        setWishlist(response.data);
      }
      
      showToast(response.message || 'Added to wishlist!', 'success');
      return { success: true, message: 'Added to wishlist' };
    } else {
      // Revert optimistic update
      console.error('❌ Add failed, reverting');
      setWishlist(prev => prev.filter(item => 
        String(item.productId) !== String(productId)
      ));
      showToast(response.message || response.error || 'Failed to add to wishlist', 'error');
      return { success: false, message: response.message || response.error };
    }
  } catch (error) {
    const productId = product._id || product.id || product.productId;
    setWishlist(prev => prev.filter(item => 
      String(item.productId) !== String(productId)
    ));
    console.error('❌ Error adding to wishlist:', error);
    showToast('Error adding to wishlist', 'error');
    return { success: false, message: error.message };
  }
};

const removeFromWishlist = async (productId) => {
  try {
    console.log('🗑️ removeFromWishlist called with:', productId);
    console.log('🗑️ Type of productId:', typeof productId);
    
    if (!productId || productId === 'undefined') {
      console.error('❌ Invalid productId:', productId);
      showToast('Invalid product ID', 'error');
      return { success: false, message: 'Invalid product ID' };
    }
    
    // Find item in wishlist using ONLY productId
    const productToRemove = wishlist.find(item => {
      console.log('Comparing:', item.productId, 'with', productId);
      return String(item.productId) === String(productId);
    });
    
    if (!productToRemove) {
      console.error('❌ Product not found in wishlist');
      console.log('Available products:', wishlist.map(i => i.productId));
      showToast('Product not found in wishlist', 'error');
      return { success: false, message: 'Product not found' };
    }
    
    console.log('✅ Found product to remove:', productToRemove);
    
    // Optimistic update - use ONLY productId
    setWishlist(prev => prev.filter(item => 
      String(item.productId) !== String(productId)
    ));
    
    const response = await api.removeFromWishlist(productId);
    
    if (response.success) {
      console.log('✅ Successfully removed from wishlist');
      showToast('Removed from wishlist', 'success');
      
      // Update with server response to stay in sync
      if (response.data) {
        setWishlist(response.data);
      }
      
      return { success: true };
    } else {
      // Revert optimistic update
      console.error('❌ Remove failed, reverting');
      setWishlist(prev => [...prev, productToRemove]);
      showToast(response.message || 'Failed to remove from wishlist', 'error');
      return { success: false, message: response.message };
    }
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    showToast('Error removing from wishlist', 'error');
    return { success: false, message: error.message };
  }
};

const isInWishlist = (productId) => {
  if (!productId) return false;
  
  // Use ONLY productId for comparison
  const result = wishlist.some(item => 
    String(item.productId) === String(productId)
  );
  
  console.log(`✅ isInWishlist(${productId}):`, result);
  return result;
};
  // ==================== CART OPERATIONS ====================
  const loadCart = async () => {
    try {
      const response = await api.getCart();
      if (response.success) {
        console.log('✅ Cart loaded:', response.data?.length || 0, 'items');
        setCart(response.data || []);
      } else {
        console.error('Failed to load cart:', response.error);
        setCart([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const productId = product._id || product.id || product.productId;
      
      if (!productId) {
        showToast('Invalid product', 'error');
        return { success: false, message: 'Invalid product' };
      }

      // Check if item already exists in cart
      const existingItem = cart.find(item => 
        String(item._id || item.productId) === String(productId)
      );
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        return await updateCartQuantity(productId, newQuantity);
      } else {
        // Add new item - optimistic update
        const cartItem = {
          _id: productId,
          productId: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: quantity
        };
        
        setCart(prev => [...prev, cartItem]);
        
        const response = await api.addToCart(product, quantity);
        
        if (response.success) {
          // Update with server response to ensure consistency
          setCart(response.data || []);
          showToast('Added to cart!', 'success');
          return { success: true, message: 'Added to cart' };
        } else {
          // Revert optimistic update
          setCart(prev => prev.filter(item => 
            String(item._id || item.productId) !== String(productId)
          ));
          showToast(response.error || 'Failed to add to cart', 'error');
          return { success: false, message: response.error };
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding to cart', 'error');
      return { success: false, message: error.message };
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return await removeFromCart(productId);
      }

      // Optimistic update
      const oldCart = [...cart];
      setCart(prev => prev.map(item => {
        const itemId = String(item._id || item.productId);
        return itemId === String(productId) ? { ...item, quantity } : item;
      }));
      
      const response = await api.updateCartQuantity(productId, quantity);
      
      if (response.success) {
        // Update with server response
        setCart(response.data || []);
        showToast('Cart updated', 'success');
        return { success: true };
      } else {
        // Revert optimistic update
        setCart(oldCart);
        showToast(response.error || 'Failed to update cart', 'error');
        return { success: false, message: response.error };
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      showToast('Error updating cart', 'error');
      return { success: false, message: error.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Optimistic update
      const oldCart = [...cart];
      setCart(prev => prev.filter(item => 
        String(item._id || item.productId) !== String(productId)
      ));
      
      const response = await api.removeFromCart(productId);
      
      if (response.success) {
        showToast('Removed from cart', 'success');
        return { success: true };
      } else {
        // Revert optimistic update
        setCart(oldCart);
        showToast(response.error || 'Failed to remove from cart', 'error');
        return { success: false, message: response.error };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showToast('Error removing from cart', 'error');
      return { success: false, message: error.message };
    }
  };

  const clearCart = async () => {
    try {
      console.log('🗑️ Clearing cart...');
      
      // Optimistic update
      const oldCart = [...cart];
      setCart([]);
      
      const response = await api.clearCart();
      
      if (response.success) {
        console.log('✅ Cart cleared successfully');
        showToast('Cart cleared', 'success');
        return { success: true };
      } else {
        // Revert if failed
        setCart(oldCart);
        showToast('Failed to clear cart', 'error');
        return { success: false };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast('Error clearing cart', 'error');
      return { success: false };
    }
  };

const moveToCart = async (productId) => {
    try {
      console.log('🔄 moveToCart called with productId:', productId);
      console.log('📋 Current wishlist:', wishlist.map(i => ({
        productId: i.productId,
        name: i.name
      })));
      
      // Find product in wishlist using ONLY productId
      const product = wishlist.find(item => 
        String(item.productId) === String(productId)
      );
      
      if (!product) {
        console.error('❌ Product not found in wishlist:', productId);
        showToast('Product not found in wishlist', 'error');
        return { success: false, error: 'Product not found in wishlist' };
      }

      console.log('✅ Found product in wishlist:', product);

      // Create cart item with correct structure
      const cartProduct = {
        _id: product.productId,
        productId: product.productId,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description
      };

      console.log('🛒 Adding to cart:', cartProduct);

      // Add to cart first
      const addResult = await addToCart(cartProduct, 1);
      
      if (addResult.success) {
        console.log('✅ Added to cart successfully, now removing from wishlist');
        // Then remove from wishlist
        const removeResult = await removeFromWishlist(productId);
        
        if (removeResult.success) {
          showToast('Moved to cart!', 'success');
          return { success: true };
        } else {
          console.error('❌ Failed to remove from wishlist after adding to cart');
          showToast('Added to cart but failed to remove from wishlist', 'warning');
          return { success: true }; // Still success since item is in cart
        }
      } else {
        console.error('❌ Failed to add to cart:', addResult);
        showToast(addResult.message || 'Failed to move to cart', 'error');
        return { success: false, error: addResult.message };
      }
    } catch (error) {
      console.error('❌ Error moving to cart:', error);
      showToast('Error moving to cart', 'error');
      return { success: false, error: error.message };
    }
  };

  
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const isInCart = (productId) => {
    return cart.some(item => 
      String(item._id || item.productId) === String(productId)
    );
  };

  // Load user-specific data
  const loadUserData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user._id || user.id) {
        console.log('🔄 Loading user data...');
        await Promise.all([
          loadWishlist(),
          loadCart()
        ]);
        console.log('✅ User data loaded');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Share product functionality
  const shareProduct = async (product, method = 'url') => {
    const productUrl = `${window.location.origin}/products/${product._id}`;
    const shareText = `Check out ${product.name} - ₹${product.price}`;
    
    try {
      switch (method) {
        case 'url':
          await navigator.clipboard.writeText(productUrl);
          showToast('Product link copied to clipboard!', 'success');
          return { success: true };
          
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: product.name,
              text: shareText,
              url: productUrl
            });
            return { success: true };
          } else {
            await navigator.clipboard.writeText(`${shareText} ${productUrl}`);
            showToast('Product details copied to clipboard!', 'success');
            return { success: true };
          }
          
        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`;
          window.open(whatsappUrl, '_blank');
          return { success: true };
          
        case 'facebook':
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
          window.open(facebookUrl, '_blank');
          return { success: true };
          
        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
          window.open(twitterUrl, '_blank');
          return { success: true };
          
        default:
          await navigator.clipboard.writeText(productUrl);
          showToast('Product link copied!', 'success');
          return { success: true };
      }
    } catch (error) {
      console.error('Error sharing product:', error);
      showToast('Failed to share product', 'error');
      return { success: false, message: error.message };
    }
  };

  const value = {
    // State
    products,
    wishlist,
    cart,
    loading,
    error,
    
    // Product operations
    loadProducts,
    
    // Wishlist operations
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    
    // Cart operations
    loadCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    moveToCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    
    // Utilities
    loadUserData,
    shareProduct,
    showToast
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;