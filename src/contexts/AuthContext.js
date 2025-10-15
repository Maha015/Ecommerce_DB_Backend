// src/contexts/AuthContext.js - FIXED WITH PRODUCTION API URL

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// ✅ Use environment variable or fallback to production URL
const API_URL = process.env.REACT_APP_API_URL || 'https://ecommerce-delivery-project-backend.onrender.com';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Toast notification helper
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium shadow-lg transition-all duration-300 ${
    type === 'success'
      ? 'bg-green-500'
      : type === 'error'
      ? 'bg-red-500'
      : type === 'warning'
      ? 'bg-yellow-500'
      : 'bg-blue-500'
  }`;
  toast.textContent = message;
  toast.style.transform = 'translateX(400px)';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        console.log('🔄 Initializing auth state...');
        console.log('🔗 API URL:', API_URL);
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          const normalizedUser = {
            ...parsedUser,
            _id: parsedUser._id || parsedUser.id,
            id: parsedUser.id || parsedUser._id,
          };

          console.log('✅ User restored from localStorage:', normalizedUser);
          setUser(normalizedUser);
        } else {
          console.log('ℹ️ No saved user found');
        }
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Listen for storage changes (cross-tab login/logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        console.log('🔄 Storage change detected, updating auth state');
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          try {
            const parsedUser = JSON.parse(savedUser);
            const normalizedUser = {
              ...parsedUser,
              _id: parsedUser._id || parsedUser.id,
              id: parsedUser.id || parsedUser._id,
            };
            setUser(normalizedUser);
          } catch (error) {
            console.error('Error parsing user from storage change:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const clearError = () => setError(null);

  // Login function
  const login = async (email, password) => {
    console.log('🔄 Login attempt started for:', email);
    console.log('🔗 Using API URL:', API_URL);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('📡 Login API response:', data);

      if (response.ok && data.user) {
        const normalizedUser = {
          ...data.user,
          _id: data.user._id || data.user.id,
          id: data.user.id || data.user._id,
        };

        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('token', data.token || 'dummy-token');

        setUser(normalizedUser);
        console.log('✅ Login successful:', normalizedUser);

        setLoading(false);
        return { success: true, user: normalizedUser, message: 'Login successful' };
      } else {
        const errorMessage = data.message || 'Login failed';
        setError(errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('❌ Login network error:', error);
      const errorMessage = 'Network error. Please check your connection.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    console.log('🔄 Registration attempt started with data:', {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      hasPassword: !!userData.password
    });
    console.log('🔗 Using API URL:', API_URL);
    
    setLoading(true);
    setError(null);

    if (!userData.name || !userData.email || !userData.password) {
      const errorMessage = 'All fields are required';
      console.error('❌ Validation failed:', errorMessage);
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

      console.log('📤 Sending registration request:', {
        ...payload,
        password: '[HIDDEN]'
      });

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      console.log('📡 Response status:', response.status, response.statusText);

      let data;
      try {
        data = await response.json();
        console.log('📡 Register API response:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        const errorMessage = 'Server returned invalid response';
        setError(errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }

      if (response.ok) {
        console.log('✅ Registration successful:', data);
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

        console.error('❌ Registration failed:', errorMessage, data);
        setError(errorMessage);
        setLoading(false);
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('❌ Registration network error:', error);
      let errorMessage = 'Network error. Please check your connection.';
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  // Update user function
  const updateUser = (userData) => {
    console.log('🔄 Updating user in context:', userData);
    
    setUser(prevUser => {
      const updatedUser = {
        ...prevUser,
        ...userData,
        _id: userData._id || userData.id || prevUser._id,
        id: userData.id || userData._id || prevUser.id,
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ User updated in context and localStorage:', updatedUser);
      
      return updatedUser;
    });
  };

  // Logout function with toast + redirect
  const logout = async () => {
    console.log('🔄 Logout initiated');
    setLoading(true);

    try {
      setUser(null);
      setError(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      setLoading(false);
      console.log('✅ Logout successful');

      showToast('Logged out successfully!', 'success');

      setTimeout(() => {
        window.location.href = '/';
      }, 500);

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      setLoading(false);

      showToast('Logged out successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);

      return { success: false, message: 'Logout completed with errors' };
    }
  };

  // Get user role
  const getUserRole = () => user?.role || 'customer';

  // Check if user is authenticated
  const isAuthenticated = () => !!user && !!localStorage.getItem('token');

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    getUserRole,
    isAuthenticated: isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;