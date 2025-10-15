import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, Star, ShoppingCart, Heart, Eye, User, LogOut, X, ChevronDown, Menu, Filter, Sparkles, TrendingUp, Zap, ChevronRight, ArrowUpRight } from 'lucide-react';
import { categories, searchProducts } from '../data/productsData';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    addToCart, 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist,
    getCartItemCount 
  } = useProduct();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [suggestions, setSuggestions] = useState([]);


  const getProductImage = (product) => {
    const imageMap = {
      'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80',
      'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&q=80',
      'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80',
      'Tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&q=80',
      'Wearables': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop&q=80',
      'Drones': 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop&q=80',
      'Gaming': 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop&q=80',
      'Cameras': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop&q=80',
      'Fitness': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop&q=80',
      'Office': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop&q=80',
      'Bedroom': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop&q=80',
      'Living Room': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&q=80',
      'Dining': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop&q=80',
      'Storage': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop&q=80',
      'Supplements': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&q=80',
      'Medical Devices': 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=400&fit=crop&q=80',
      'Emergency Care': 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&h=400&fit=crop&q=80',
      'Sports Nutrition': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop&q=80',
      'Monitoring Devices': 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&h=400&fit=crop&q=80'
    };

    return imageMap[product.subcategory] || 
           `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80`;
  };

  const filteredProducts = useMemo(() => {
    let products = [];

    if (selectedCategory === 'all') {
      products = categories.reduce((acc, category) => [...acc, ...category.products], []);
    } else {
      const category = categories.find(cat => cat.id === selectedCategory);
      products = category ? category.products : [];
    }

    if (searchQuery.trim()) {
      const searchResults = searchProducts(searchQuery);
      products = products.filter(product => 
        searchResults.some(result => result.id === product.id)
      );
    }

    products = products.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
      default:
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return products;
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    await addToCart(product, 1);
  };

  const handleWishlistToggle = async (e, product) => {
    e.stopPropagation();
    const productId = product.id || product._id;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(product);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 transition-all duration-200 ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : star <= rating
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const ProductCard = ({ product, isListView = false }) => {
    const productId = product.id || product._id;
    const inWishlist = isInWishlist(productId);
    
    if (isListView) {
      return (
        <div 
          className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-300 cursor-pointer transition-all duration-500 hover:shadow-2xl backdrop-blur-xl bg-opacity-90"
          onClick={() => navigate(`/products/${product.id}`)}
          onMouseEnter={() => setHoveredCard(productId)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex gap-6 p-6">
            <div className="w-56 h-56 flex-shrink-0 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative shadow-lg">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/300x300/1e293b/ffffff?text=${encodeURIComponent(
                    product.name.substring(0, 20)
                  )}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              {product.rating >= 4.5 && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-gray-900">Best Seller</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-2">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {product.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center gap-4">
                  {renderStars(product.rating)}
                  <span className="text-xs text-gray-500 font-semibold">({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div>
                  <div className="text-sm text-gray-500 font-semibold mb-1">Price</div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                    {formatPrice(product.price)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    className="p-3.5 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all transform hover:scale-110 duration-300 group/btn shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/products/${product.id}`);
                    }}
                  >
                    <Eye className="w-5 h-5 text-slate-700" />
                  </button>
                  <button 
                    className={`p-3.5 rounded-2xl transition-all transform hover:scale-110 duration-300 shadow-md ${
                      inWishlist 
                        ? 'bg-red-100' 
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                    onClick={(e) => handleWishlistToggle(e, product)}
                  >
                    <Heart className={`w-5 h-5 transition-all ${
                      inWishlist ? 'text-red-500 fill-red-500' : 'text-slate-700'
                    }`} />
                  </button>
                  <button 
                    className="px-6 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-2xl transition-all transform hover:scale-105 duration-300 flex items-center gap-2.5 font-bold shadow-lg hover:shadow-2xl"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="group relative h-full cursor-pointer transition-all duration-500"
        onClick={() => navigate(`/products/${product.id}`)}
        onMouseEnter={() => setHoveredCard(productId)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-gray-300 h-full shadow-md group-hover:shadow-2xl transition-all duration-500 flex flex-col backdrop-blur-xl bg-opacity-90">
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 group-hover:to-slate-300">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/300x300/1e293b/ffffff?text=${encodeURIComponent(
                  product.name.substring(0, 20)
                )}`;
              }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/95 backdrop-blur-sm text-slate-900 px-3.5 py-2 rounded-full shadow-lg">
                <Sparkles className="w-3 h-3" />
                {product.category}
              </span>
            </div>

            {product.rating >= 4.5 && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                <Star className="w-4 h-4 text-white fill-white" />
              </div>
            )}

            <button 
              className={`absolute top-4 right-4 p-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all transform hover:scale-110 duration-300 ${
                inWishlist 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/95 text-slate-700 opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => handleWishlistToggle(e, product)}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white' : ''}`} />
            </button>

            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
              <button 
                className="w-full py-3 bg-white hover:bg-gray-50 text-slate-900 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product.id}`);
                }}
              >
                <Eye className="w-4 h-4" />
                Quick View
              </button>
            </div>
          </div>

          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2 min-h-[3rem] leading-snug">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-600 line-clamp-2 mb-4 min-h-[2rem]">
              {product.description}
            </p>

            <div className="flex items-center gap-2 mb-4">
              {renderStars(product.rating)}
              <span className="text-xs text-gray-500 font-semibold">({product.reviews})</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div>
                <div className="text-xs text-gray-500 font-semibold mb-1">From</div>
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
                  {formatPrice(product.price)}
                </div>
              </div>
              
              <button 
                className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-2xl transition-all transform hover:scale-110 duration-300 shadow-lg hover:shadow-xl"
                onClick={(e) => handleAddToCart(e, product)}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FiltersSidebar = ({ isMobile = false }) => (
    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 ${isMobile ? '' : 'sticky top-24'}`}>
      <div className="p-7">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-900" />
              Categories
            </h3>
            {isMobile && (
              <button onClick={() => setShowMobileFilters(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all font-bold text-sm transform hover:scale-105 duration-300 flex items-center justify-between group ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-slate-50'
              }`}
            >
              All Products
              <ChevronRight className={`w-4 h-4 transition-all ${selectedCategory === 'all' ? 'text-white' : 'text-gray-400'}`} />
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 text-sm font-bold transform hover:scale-105 duration-300 justify-between group ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  {category.name}
                </div>
                <ChevronRight className={`w-4 h-4 transition-all ${selectedCategory === category.id ? 'text-white' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10 pb-10 border-b-2 border-gray-200">
          <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
            <Zap className="w-5 h-5 text-slate-900" />
            Price Range
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2.5 block uppercase tracking-wider">Min Price</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-slate-50 font-semibold transition-all"
                placeholder="₹0"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2.5 block uppercase tracking-wider">Max Price</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 200000 }))}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm bg-slate-50 font-semibold transition-all"
                placeholder="₹200,000"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-gray-900 mb-5">Sort By</h3>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none bg-slate-50 text-sm font-bold text-gray-900 cursor-pointer transition-all"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );

  const cartCount = getCartItemCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      {/* Premium Header */}
      <header className="bg-white/70 backdrop-blur-2xl border-b-2 border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent whitespace-nowrap">
                SwiftShop
              </h1>
              
              <div className="flex-1 max-w-xl hidden md:block">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-slate-900 transition-colors" />
                  <input
  type="text"
  placeholder="Search products..."
  value={searchQuery}
  onChange={(e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      const results = searchProducts(value).slice(0, 5); // show top 5 matches
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }}
  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all text-sm font-medium"
/>

                </div>
              </div>

              {suggestions.length > 0 && (
  <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-xl">
    {suggestions.map((item) => (
      <div
        key={item.id}
        onClick={() => {
          setSearchQuery(item.name);
          setSuggestions([]);
          navigate(`/products/${item.id}`);
        }}
        className="px-4 py-3 text-sm text-gray-700 hover:bg-slate-100 cursor-pointer transition-all"
      >
        <div className="font-bold">{item.name}</div>
        <div className="text-xs text-gray-500">{item.category}</div>
      </div>
    ))}
  </div>
)}

            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden p-3 text-gray-700 hover:bg-slate-100 rounded-2xl transition-all transform hover:scale-110 duration-300"
              >
                <Filter className="w-5 h-5" />
              </button>

              <button 
                onClick={() => navigate('/wishlist')}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-red-50 rounded-2xl transition-all transform hover:scale-105 duration-300 font-bold text-sm"
              >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
              
              <button 
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-blue-50 rounded-2xl transition-all transform hover:scale-105 duration-300 relative font-bold text-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-xl animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <div className="hidden lg:flex items-center gap-4 pl-4 border-l-2 border-gray-200">
                <button 
                  onClick={() => navigate('/customer')}
                  className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-slate-100 rounded-2xl transition-all transform hover:scale-105 duration-300 font-bold text-sm"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name || 'User'}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all transform hover:scale-110 duration-300"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <button className="lg:hidden p-3 text-gray-700 hover:bg-slate-100 rounded-2xl transition-all transform hover:scale-110 duration-300">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto rounded-r-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <FiltersSidebar isMobile={true} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-96 flex-shrink-0">
            <FiltersSidebar />
          </aside>

          {/* Products Area */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 p-7 mb-10">
              <div className="flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-1">Now Showing</p>
                    <h2 className="text-3xl font-black text-gray-900">
                      {selectedCategory === 'all' 
                        ? 'All Products' 
                        : categories.find(cat => cat.id === selectedCategory)?.name
                      }
                    </h2>
                  </div>
                  <div className="px-5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg">
                    {filteredProducts.length}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3.5 transition-all ${
                        viewMode === 'grid'
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <div className="w-px bg-gray-200" />
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3.5 transition-all ${
                        viewMode === 'list'
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-slate-50'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-7'
                  : 'space-y-6'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isListView={viewMode === 'list'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-lg">
                <div className="w-40 h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Search className="w-20 h-20 text-slate-400" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-600 text-lg font-medium">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;