//LandingPage.js

import React, { useState, createContext, useContext, useEffect } from 'react';
import {
  ShoppingCart,
  Star,
  Package,
  X,
  User,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react';

// Auth Context (embedded)
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          const normalizedUser = {
            ...parsedUser,
            _id: parsedUser._id || parsedUser.id,
            id: parsedUser.id || parsedUser._id,
          };
          setUser(normalizedUser);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
     const response = await fetch('https://ecommerce-db-backend-b4xf.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const normalizedUser = {
          ...data.user,
          _id: data.user._id || data.user.id,
          id: data.user.id || data.user._id,
        };

        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('token', data.token || 'dummy-token');

        setUser(normalizedUser);
        setLoading(false);
        return { success: true, user: normalizedUser, message: 'Login successful' };
      } else {
        const errorMessage = data.message || 'Login failed';
        setError(errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check if the server is running.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    if (!userData.name || !userData.email || !userData.password) {
      const errorMessage = 'All fields are required';
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }

    try {
      const payload = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        role: userData.role || 'customer',
      };

      const response = await fetch('https://ecommerce-db-backend-b4xf.onrender.com/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const errorMessage = 'Server returned invalid response';
        setError(errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }

      if (response.ok) {
        setLoading(false);
        return { 
          success: true, 
          message: data.message || 'Registration successful! Please login.', 
          user: data.user 
        };
      } else {
        let errorMessage = data.message || 'Registration failed';
        
        if (response.status === 400) {
          errorMessage = data.message || 'Invalid input. Please check your details.';
        } else if (response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        setError(errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      let errorMessage = 'Network error. Please check if the server is running.';
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:5000';
      }
      
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Toast Notification
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium shadow-lg transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }`;
  
  toast.innerHTML = `<span class="inline-flex items-center gap-2">
    <span class="text-xl">${icons[type]}</span>
    <span>${message}</span>
  </span>`;
  toast.style.transform = 'translateX(400px)';
  toast.style.opacity = '0';

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

const LandingPage = () => {
  const { user, login, register } = useAuth();

  // Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  
  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI States
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modal helpers
  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowForgotPasswordModal(false);
    setAuthError('');
    setFieldErrors({});
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    setForgotPasswordEmail('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setAuthError('');
    setFieldErrors({});
    setTimeout(() => setShowRegisterModal(true), 150);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowForgotPasswordModal(false);
    setAuthError('');
    setFieldErrors({});
    setTimeout(() => setShowLoginModal(true), 150);
  };

  const openForgotPassword = () => {
    setShowLoginModal(false);
    setAuthError('');
    setFieldErrors({});
    setTimeout(() => setShowForgotPasswordModal(true), 150);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setFieldErrors({});

    const errors = {};
    const trimmedEmail = loginData.email.trim();
    const trimmedPassword = loginData.password.trim();

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address';
    }

    if (!trimmedPassword) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setAuthLoading(true);

    try {
      const result = await login(trimmedEmail, trimmedPassword);

      if (result.success) {
        showToast('Login Successful! Redirecting...', 'success');
        setShowLoginModal(false);
        
        setTimeout(() => {
          const role = result.user.role;
          if (role === 'admin') {
            window.location.href = '/admin';
          } else if (role === 'delivery_agent') {
            window.location.href = '/delivery';
          } else {
            window.location.href = '/products';
          }
        }, 1000);
      } else {
        setAuthError(result.message || 'Invalid credentials');
        showToast(result.message || 'Invalid credentials', 'error');
      }
    } catch (error) {
      const msg = error.message || 'An error occurred during login';
      setAuthError(msg);
      showToast(msg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setFieldErrors({});

    const errors = {};
    const trimmedName = registerData.name.trim();
    const trimmedEmail = registerData.email.trim();
    const trimmedPassword = registerData.password.trim();
    const trimmedConfirm = registerData.confirmPassword.trim();

    if (!trimmedName) {
      errors.name = 'Name is required';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address';
    }

    if (!trimmedPassword) {
      errors.password = 'Password is required';
    } else if (trimmedPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!trimmedConfirm) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (trimmedPassword !== trimmedConfirm) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      showToast(firstError, 'error');
      return;
    }

    setAuthLoading(true);

    try {
      const registrationData = {
        name: trimmedName,
        email: trimmedEmail.toLowerCase(),
        password: trimmedPassword,
        confirmPassword: trimmedConfirm,
        role: 'customer'
      };

      const result = await register(registrationData);

      if (result.success) {
        showToast('Registration Successful! Please login.', 'success');
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        setAuthError('');
        setFieldErrors({});
        setShowRegisterModal(false);
        setTimeout(() => setShowLoginModal(true), 1000);
      } else {
        const errorMsg = result.message || 'Registration failed. Please try again.';
        setAuthError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      const errorMsg = error.message || 'An error occurred during registration';
      setAuthError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setFieldErrors({});

    const trimmedEmail = forgotPasswordEmail.trim();

    if (!trimmedEmail) {
      setFieldErrors({ email: 'Email is required' });
      showToast('Please enter your email address', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldErrors({ email: 'Enter a valid email address' });
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setAuthLoading(true);

    try {
      // Simulate API call - Replace with actual forgot password API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showToast('Password reset link sent to your email!', 'success');
      setForgotPasswordEmail('');
      setShowForgotPasswordModal(false);
      setTimeout(() => setShowLoginModal(true), 1000);
    } catch (error) {
      const errorMsg = 'Failed to send reset email. Please try again.';
      setAuthError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            Welcome to Our Store
          </h1>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            SwiftShop
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
            Discover amazing products at unbeatable prices
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
            {user ? (
              <>
                <button
                  onClick={() => (window.location.href = '/products')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Shop Now
                </button>
                <button
                  onClick={() => (window.location.href = '/customer')}
                  className="border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Login
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up Free
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Shop With Us?</h2>
            <p className="text-gray-600 text-lg">Experience the best online shopping with these amazing benefits</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Quality Products</h3>
              <p className="text-gray-600">Handpicked items with guaranteed quality and authenticity</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100">
              <div className="bg-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Fast Delivery</h3>
              <p className="text-gray-600">Lightning-fast delivery right to your doorstep</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="bg-yellow-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Top Rated</h3>
              <p className="text-gray-600">Highly rated by thousands of satisfied customers</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="bg-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Secure Payment</h3>
              <p className="text-gray-600">100% secure payment with multiple options</p>
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN MODAL - Split Screen Design */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden transform transition-all flex flex-col md:flex-row max-h-[90vh]">
            {/* Left Side - Image/Banner */}
            <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <div className="mb-8">
                  <ShoppingCart className="w-16 h-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                  <p className="text-blue-100 text-lg">Sign in to continue your shopping journey</p>
                </div>
                <div className="space-y-4 mt-12">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Fast & Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Track Your Orders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Exclusive Deals & Offers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Wide Range of Products</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <button
                  onClick={closeModals}
                  disabled={authLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {authError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{authError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => {
                        setLoginData({ ...loginData, email: e.target.value });
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      disabled={authLoading}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({ ...loginData, password: e.target.value });
                        setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                      disabled={authLoading}
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    disabled={authLoading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                    onClick={() => showToast('Google login coming soon!', 'info')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                    onClick={() => showToast('Facebook login coming soon!', 'info')}
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium">Facebook</span>
                  </button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={switchToRegister}
                      disabled={authLoading}
                      className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER MODAL - Split Screen Design */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden transform transition-all flex flex-col md:flex-row max-h-[90vh]">
            {/* Left Side - Image/Banner */}
            <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-green-600 to-teal-700 p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
              </div>
              <div className="relative z-10">
                <div className="mb-8">
                  <UserPlus className="w-16 h-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-4">Join Us Today!</h2>
                  <p className="text-green-100 text-lg">Create an account and unlock exclusive benefits</p>
                </div>
                <div className="space-y-4 mt-12">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Get exclusive member discounts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Early access to new products</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Personalized recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span>Fast & easy checkout</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <button
                  onClick={closeModals}
                  disabled={authLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {authError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{authError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, name: e.target.value });
                        setFieldErrors({ ...fieldErrors, name: '' });
                      }}
                      disabled={authLoading}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.name
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, email: e.target.value });
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      disabled={authLoading}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, password: e.target.value });
                        setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                      disabled={authLoading}
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({ ...registerData, confirmPassword: e.target.value });
                        setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                      }}
                      disabled={authLoading}
                      className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-green-500'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Re-enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={authLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center pt-2">
                  Customer accounts only. Admin/Delivery accounts created by administrators.
                </p>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                    onClick={() => showToast('Google signup coming soon!', 'info')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                    onClick={() => showToast('Facebook signup coming soon!', 'info')}
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-sm font-medium">Facebook</span>
                  </button>
                </div>

                <div className="text-center pt-4 border-t">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={switchToLogin}
                      disabled={authLoading}
                      className="text-green-600 hover:text-green-700 font-semibold disabled:opacity-50"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
              <button
                onClick={closeModals}
                disabled={authLoading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 rounded-full p-2 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{authError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        setForgotPasswordEmail(e.target.value);
                        setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      disabled={authLoading}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <Mail className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-4 border-t">
                  <p className="text-gray-600 text-sm">
                    Remember your password?{' '}
                    <button
                      type="button"
                      onClick={switchToLogin}
                      disabled={authLoading}
                      className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
                    >
                      Back to Login
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

// Wrap with AuthProvider for standalone use
const LandingPageWithAuth = () => (
  <AuthProvider>
    <LandingPage />
  </AuthProvider>
);

export default LandingPageWithAuth;