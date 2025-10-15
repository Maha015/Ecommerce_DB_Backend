// src/components/Header.js - Enhanced with E-commerce Features
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProduct } from '../contexts/ProductContext';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  Package,
  LogIn,
  LogOut
} from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount, wishlist } = useProduct();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
      if (isMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen, isMenuOpen]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      setIsProfileDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  const getDashboardUrl = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'delivery_agent':
        return '/delivery/dashboard';
      case 'customer':
      default:
        return '/customer/dashboard';
    }
  };

  const NavLink = ({ href, children, onClick, className = '' }) => (
    <a
      href={href}
      onClick={onClick}
      className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${className}`}
    >
      {children}
    </a>
  );

  const IconButton = ({ onClick, children, badge, className = '' }) => (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600">ShopEasy</span>
            </a>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">Products</NavLink>
            
            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <IconButton 
                  onClick={() => window.location.href = '/wishlist'}
                  badge={wishlist.length}
                  className="mr-2"
                >
                  <Heart className="w-5 h-5" />
                </IconButton>

                {/* Cart */}
                <IconButton 
                  onClick={() => window.location.href = '/cart'}
                  badge={getCartItemCount()}
                  className="mr-4"
                >
                  <ShoppingCart className="w-5 h-5" />
                </IconButton>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden lg:inline">{user?.name || 'User'}</span>
                    <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-gray-500">{user?.email}</div>
                      </div>
                      
                      <a
                        href={getDashboardUrl()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </a>
                      
                      {user?.role === 'customer' && (
                        <>
                          <a
                            href="/customer/orders"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            My Orders
                          </a>
                          <a
                            href="/wishlist"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Wishlist ({wishlist.length})
                          </a>
                          <a
                            href="/cart"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Cart ({getCartItemCount()})
                          </a>
                        </>
                      )}
                      
                      <div className="border-t">
                        <button
                          onClick={handleLogout}
                          disabled={logoutLoading}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          {logoutLoading ? 'Signing out...' : 'Sign out'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink href="/login">
                  <LogIn className="w-4 h-4 inline mr-1" />
                  Login
                </NavLink>
                <a
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </a>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <>
                <IconButton 
                  onClick={() => window.location.href = '/cart'}
                  badge={getCartItemCount()}
                >
                  <ShoppingCart className="w-5 h-5" />
                </IconButton>
                <IconButton 
                  onClick={() => window.location.href = '/wishlist'}
                  badge={wishlist.length}
                >
                  <Heart className="w-5 h-5" />
                </IconButton>
              </>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-button p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden py-3 border-t">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t shadow-lg">
            <a
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Home
            </a>
            <a
              href="/products"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              Products
            </a>

            {isAuthenticated ? (
              <>
                <div className="border-t pt-3">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Signed in as <span className="font-medium text-gray-900">{user?.name}</span>
                  </div>
                  <a
                    href={getDashboardUrl()}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  >
                    Dashboard
                  </a>
                  
                  {user?.role === 'customer' && (
                    <>
                      <a
                        href="/wishlist"
                        className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        <span>Wishlist</span>
                        {wishlist.length > 0 && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {wishlist.length}
                          </span>
                        )}
                      </a>
                      <a
                        href="/cart"
                        className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        <span>Cart</span>
                        {getCartItemCount() > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {getCartItemCount()}
                          </span>
                        )}
                      </a>
                      <a
                        href="/customer/orders"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      >
                        My Orders
                      </a>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-700 hover:text-red-900 hover:bg-red-50 disabled:opacity-50"
                  >
                    {logoutLoading ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t pt-3 space-y-1">
                <a
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                >
                  Sign in
                </a>
                <a
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign up
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;