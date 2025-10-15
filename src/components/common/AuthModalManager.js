// src/components/auth/AuthModalManager.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthModalManager = ({ isOpen, onClose, onSuccess, initialModal = 'register' }) => {
  const [currentModal, setCurrentModal] = useState(initialModal);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const switchModal = (modalType) => {
    setCurrentModal(modalType);
    setError('');
    setSuccessMessage('');
    if (modalType === 'login') {
      setFormData({
        name: '',
        email: formData.email, // Keep email when switching
        phone: '',
        password: '',
        role: 'customer'
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ecommerce-db-backend-b4xf.onrender.com/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: formData.role || 'customer'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Account created successfully! Please login to continue.');
        setTimeout(() => {
          switchModal('login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://ecommerce-db-backend-b4xf.onrender.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        // Normalize user data
        const normalizedUser = {
          ...data.user,
          _id: data.user._id || data.user.id,
          id: data.user.id || data.user._id
        };

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('token', data.token);
        
        // Trigger storage event for AuthContext
        window.dispatchEvent(new Event('storage'));

        setSuccessMessage(`Welcome ${normalizedUser.name}!`);
        
        if (onSuccess) onSuccess();
        
        // Redirect based on role
        setTimeout(() => {
          if (normalizedUser.role === 'customer') {
            navigate('/products');
          } else if (normalizedUser.role === 'admin') {
            navigate('/admin');
          } else if (normalizedUser.role === 'delivery_agent') {
            navigate('/delivery');
          } else {
            navigate('/');
          }
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentModal === 'register' ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={currentModal === 'register' ? handleRegister : handleLogin} className="p-6 space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          {/* Error Display */}
          {error && !successMessage && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!successMessage && (
            <>
              {/* Name Input - Only for Register */}
              {currentModal === 'register' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Phone Input - Only for Register */}
              {currentModal === 'register' && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              )}

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role Selection - Only for Register */}
              {currentModal === 'register' && (
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="delivery_agent">Delivery Agent</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {currentModal === 'register' ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  currentModal === 'register' ? 'Create Account' : 'Sign In'
                )}
              </button>
            </>
          )}
        </form>

        {!successMessage && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-600 text-center">
              {currentModal === 'register' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => switchModal('login')}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    disabled={loading}
                    type="button"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => switchModal('register')}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    disabled={loading}
                    type="button"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModalManager;