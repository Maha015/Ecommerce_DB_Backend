// src/pages/ProductDetailPage.js - MODERN UI WITH ANIMATIONS
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Plus, Minus, Truck, Shield, RotateCcw, Check, ChevronRight, Zap, Award, TrendingUp } from 'lucide-react';
import { getProductById, getProductsByCategory } from '../data/productsData';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    addToCart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist 
  } = useProduct();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [shareMessage, setShareMessage] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const foundProduct = getProductById(productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
        const categoryProducts = getProductsByCategory(foundProduct.category.toLowerCase());
        const related = categoryProducts
          .filter(p => p.id !== productId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
      setLoading(false);
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-semibold"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 transition-all ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : star <= rating
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    const success = await addToCart(product, quantity);
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    navigate('/checkout', { 
      state: { 
        product: product,
        quantity: quantity 
      } 
    });
  };

  const handleWishlistToggle = async () => {
    const productId = product.id || product._id;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  const handleShareProduct = async () => {
    const productUrl = window.location.href;
    const shareText = `Check out ${product.name} - ${formatPrice(product.price)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl
        });
        return;
      } catch (error) {
        console.log('Web Share failed, falling back to clipboard');
      }
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setShareMessage('Failed to copy link');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const productImages = [
    product.image,
    product.image.replace('300x300', '400x400'),
    product.image.replace('300x300', '350x350'),
    product.image.replace('300x300', '380x380')
  ];

  const productIdStr = product.id || product._id;
  const inWishlist = isInWishlist(productIdStr);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Modern Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all transform hover:scale-110 active:scale-95"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Product Details
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShareProduct}
                className="p-2 hover:bg-blue-50 rounded-full transition-all relative"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
                {shareMessage && (
                  <span className="absolute -bottom-12 right-0 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex items-center space-x-1 shadow-lg animate-bounce">
                    <Check className="w-4 h-4" />
                    <span>{shareMessage}</span>
                  </span>
                )}
              </button>
              <button
                onClick={handleWishlistToggle}
                className="p-2 hover:bg-red-50 rounded-full transition-all transform hover:scale-110 active:scale-95"
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    inWishlist ? 'text-red-500 fill-current animate-pulse' : 'text-gray-600'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Modern Product Images Section */}
          <div className="space-y-4">
            {/* Main Image with Zoom Effect */}
            <div className="relative aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden group">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              )}
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                onLoad={() => setImageLoading(false)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Badge */}
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                17% OFF
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(index);
                    setImageLoading(true);
                  }}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-3 transition-all transform hover:scale-105 ${
                    selectedImage === index
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === index && (
                    <div className="absolute inset-0 bg-blue-500/20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modern Product Info Section */}
          <div className="space-y-6">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <Zap className="w-4 h-4" />
                <span>{product.category}</span>
              </span>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
                {renderStars(product.rating)}
                <span className="font-bold text-gray-900 ml-1">{product.rating}</span>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>{product.reviews} reviews</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Best Seller</span>
                </span>
              </div>
            </div>

            {/* Price Section with Modern Design */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-200">
              <div className="flex items-baseline space-x-3 mb-2">
                <span className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price * 1.2)}
                </span>
              </div>
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <Check className="w-4 h-4 text-green-600" />
                <span>Inclusive of all taxes • Save {formatPrice(product.price * 0.2)}</span>
              </p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity Selector - Modern */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Select Quantity</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-4 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5 text-gray-700" />
                  </button>
                  <span className="px-8 py-4 font-bold text-xl text-gray-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="p-4 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">Max 10 per order</span>
              </div>
            </div>

            {/* Action Buttons - Premium Design */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 active:scale-95 font-bold text-lg shadow-xl flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Buy Now</span>
              </button>
              
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 py-4 px-8 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 active:scale-95 font-bold text-lg shadow-xl flex items-center justify-center space-x-2 relative overflow-hidden"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
                {addedToCart && (
                  <span className="absolute inset-0 bg-green-500 flex items-center justify-center space-x-2 animate-pulse">
                    <Check className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">Added!</span>
                  </span>
                )}
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, text: 'Free Delivery', color: 'from-green-500 to-emerald-500' },
                { icon: RotateCcw, text: '7 Days Return', color: 'from-blue-500 to-cyan-500' },
                { icon: Shield, text: '2 Year Warranty', color: 'from-purple-500 to-pink-500' }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all transform hover:scale-105 border border-gray-100"
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-2`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modern Tabs Section */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex">
                {['description', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-5 px-6 font-semibold text-sm capitalize transition-all relative ${
                      activeTab === tab
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'description' && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></span>
                      <span>Product Description</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <span className="w-1 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded"></span>
                      <span>Uses & Purpose</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{product.uses}</p>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="animate-fadeIn">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded"></span>
                    <span>Technical Specifications</span>
                  </h3>
                  <div className="space-y-3">
                    {product.specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start space-x-3">
                          <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{spec}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="animate-fadeIn">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <span className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-orange-600 rounded"></span>
                    <span>Customer Reviews</span>
                  </h3>
                  
                  {/* Review Summary Card */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8 border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-6xl font-black text-gray-900 mb-2">{product.rating}</div>
                        <div className="flex justify-center mb-3">
                          {renderStars(product.rating)}
                        </div>
                        <p className="text-sm text-gray-600 font-semibold">{product.reviews} Total Reviews</p>
                      </div>
                      <div className="flex-1 max-w-md ml-12">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-semibold w-8">{stars}</span>
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <div className="flex-1 bg-white rounded-full h-3 shadow-inner">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.random() * 70 + 20}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700 font-medium w-10">
                              {Math.floor(Math.random() * 30 + 5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((reviewIndex) => (
                      <div key={reviewIndex} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                            U{reviewIndex}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">User {reviewIndex}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  {renderStars(Math.floor(Math.random() * 2) + 4)}
                                  <span className="text-sm text-gray-500">
                                    {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                                Verified Purchase
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {reviewIndex === 1 && "Excellent product! Great quality and fast delivery. Highly recommended."}
                              {reviewIndex === 2 && "Good value for money. Works as expected and the build quality is solid."}
                              {reviewIndex === 3 && "Amazing features and user-friendly design. Worth every penny!"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products - Modern Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <span className="w-2 h-10 bg-gradient-to-b from-blue-600 to-indigo-600 rounded"></span>
                <span>You May Also Like</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div
                  key={relatedProduct.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 transform hover:-translate-y-2"
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center mb-3">
                      {renderStars(relatedProduct.rating)}
                      <span className="ml-2 text-sm text-gray-600">({relatedProduct.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatPrice(relatedProduct.price)}
                      </p>
                      <ChevronRight className="w-5 h-5 text-blue-600 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;