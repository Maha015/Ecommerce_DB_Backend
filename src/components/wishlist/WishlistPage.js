// src/pages/WishlistPage.js - FIXED with better error handling
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProduct } from '../../contexts/ProductContext';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    wishlist, 
    removeFromWishlist, 
    moveToCart 
  } = useProduct();
  
  const [loading, setLoading] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 transition-all ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleRemove = async (productId) => {
    if (!window.confirm('Remove this item from wishlist?')) {
      return;
    }

    setLoading(prev => ({ ...prev, [productId]: 'removing' }));
    
    try {
      const result = await removeFromWishlist(productId);
      
      if (result.success) {
        console.log('✅ Removed from wishlist successfully');
      } else {
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Remove error:', error);
      alert('Failed to remove item from wishlist');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: null }));
    }
  };

  const handleMoveToCart = async (item) => {
    const productId = item.productId || item._id;
    
    setLoading(prev => ({ ...prev, [productId]: 'moving' }));
    
    try {
      console.log('🔄 Moving to cart:', { productId, item });
      
      const result = await moveToCart(productId);
      
      if (result.success) {
        console.log('✅ Moved to cart successfully');
        // Success message already shown in moveToCart function
      } else {
        alert(result.error || 'Failed to move item to cart');
      }
    } catch (error) {
      console.error('Move to cart error:', error);
      alert('Failed to move item to cart');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: null }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to login to view your wishlist</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-3 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all transform hover:scale-105 font-bold shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-2xl border-b-2 border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all transform hover:scale-110 duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600 font-medium">{wishlist.length} items saved</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {wishlist.length === 0 ? (
          <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Heart className="w-16 h-16 text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-600 text-lg mb-8 font-medium">Save items you love for later</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all transform hover:scale-105 font-bold shadow-lg inline-block"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-8 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-black text-gray-900">
                  {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} Saved
                </h2>
                <button
                  onClick={() => navigate('/products')}
                  className="text-slate-900 hover:text-slate-700 font-bold hover:bg-slate-100 px-4 py-2 rounded-2xl transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {wishlist.map((item) => {
                const productId = item.productId || item._id;
                const isLoading = loading[productId];
                
                return (
                  <div
                    key={productId}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden group transition-all duration-500 transform hover:scale-105"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-56 object-cover cursor-pointer group-hover:scale-125 transition-transform duration-700"
                        onClick={() => navigate(`/products/${productId}`)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      <button
                        onClick={() => handleRemove(productId)}
                        disabled={!!isLoading}
                        className="absolute top-4 right-4 p-3.5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-red-50 transition-all transform hover:scale-110 duration-300 disabled:opacity-50"
                      >
                        {isLoading === 'removing' ? (
                          <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        ) : (
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        )}
                      </button>
                      
                      <span className="absolute top-4 left-4 text-xs font-black text-white bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        {item.category}
                      </span>

                      {item.rating >= 4.5 && (
                        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2.5 shadow-lg">
                          <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 
                        className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-slate-700 transition-colors"
                        onClick={() => navigate(`/products/${productId}`)}
                      >
                        {item.name}
                      </h3>
                      
                      <div className="mb-4">
                        {renderStars(item.rating || 4.5)}
                      </div>

                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-6">
                        {formatPrice(item.price)}
                      </p>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          disabled={!!isLoading}
                          className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-3 px-4 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all font-bold flex items-center justify-center gap-2.5 shadow-lg transform hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading === 'moving' ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Moving...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-5 h-5" />
                              <span>Move to Cart</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleRemove(productId)}
                          disabled={!!isLoading}
                          className="w-full border-2 border-red-300 text-red-600 py-3 px-4 rounded-2xl hover:bg-red-50 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading === 'removing' ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Removing...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-5 h-5" />
                              <span>Remove</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;