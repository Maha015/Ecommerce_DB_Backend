// src/pages/CartPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Package, Truck, Tag, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    getCartTotal,
    getCartItemCount,
    clearCart 
  } = useProduct();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      await updateCartQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear all items from cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md w-full border border-gray-100">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to login to view your cart</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all transform hover:scale-110 duration-300"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900">Shopping Cart</h1>
                  <p className="text-sm text-gray-600 font-medium">{cart.length} items</p>
                </div>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 font-bold hover:bg-red-50 px-4 py-2 rounded-2xl transition-all"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-slate-400" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 text-lg mb-8 font-medium">Add items to get started</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all transform hover:scale-105 font-bold shadow-lg inline-block"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">
                  Cart Items ({cart.length})
                </h2>
                <div className="space-y-5">
                  {cart.map((item) => {
                    const itemId = item._id || item.productId;
                    return (
                      <div
                        key={itemId}
                        className="flex items-center gap-6 p-6 border-2 border-gray-100 rounded-2xl hover:border-slate-200 hover:shadow-lg transition-all group"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-28 h-28 object-cover rounded-2xl cursor-pointer group-hover:scale-110 transition-transform duration-300"
                          onClick={() => navigate(`/products/${itemId}`)}
                        />
                        
                        <div className="flex-1">
                          <h3 
                            className="font-bold text-lg text-gray-900 mb-2 cursor-pointer hover:text-slate-900 line-clamp-2 group-hover:text-slate-700 transition-colors"
                            onClick={() => navigate(`/products/${itemId}`)}
                          >
                            {item.name}
                          </h3>
                          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-2">
                            {formatPrice(item.price)}
                          </p>
                          <p className="text-sm font-semibold text-gray-600">
                            Subtotal: <span className="text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center border-2 border-gray-200 rounded-2xl bg-slate-50">
                            <button
                              onClick={() => handleQuantityChange(itemId, item.quantity, -1)}
                              disabled={item.quantity <= 1}
                              className="p-3 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-5 h-5 text-slate-700" />
                            </button>
                            <span className="px-6 py-2 font-bold text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(itemId, item.quantity, 1)}
                              disabled={item.quantity >= 10}
                              className="p-3 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-5 h-5 text-slate-700" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(itemId)}
                            className="p-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all transform hover:scale-110 duration-300 border-2 border-red-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 flex items-start gap-4 border-2 border-green-200 shadow-lg">
                <Package className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-green-900 text-lg">Free Delivery</p>
                  <p className="text-sm text-green-800 font-medium">
                    Your order qualifies for FREE delivery nationwide
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 flex items-start gap-4 border-2 border-blue-200 shadow-lg">
                <Tag className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-blue-900 text-lg">Offers Available</p>
                  <p className="text-sm text-blue-800 font-medium">
                    Use code SAVE10 to get 10% off on your purchase
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-8 sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-700">Items ({getCartItemCount()})</span>
                    <span className="text-gray-900 font-bold">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-700">Delivery</span>
                    <span className="font-bold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-700">Tax</span>
                    <span className="text-gray-900 font-bold">Included</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-black text-gray-900">Total</span>
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">{formatPrice(getCartTotal())}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Inclusive of all taxes</p>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 px-6 rounded-2xl hover:from-slate-800 hover:to-slate-700 transition-all font-bold text-lg mb-4 shadow-lg transform hover:scale-105 duration-300"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full border-2 border-gray-300 text-gray-800 py-3 px-6 rounded-2xl hover:bg-slate-50 transition-all font-bold"
                >
                  Continue Shopping
                </button>

                <div className="mt-8 bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl p-5 border-2 border-blue-200">
                  <div className="flex items-center gap-2 text-xs text-gray-700 font-bold uppercase tracking-widest">
                    <Truck className="w-4 h-4 text-blue-700" />
                    <span>Delivery in 5-7 business days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;