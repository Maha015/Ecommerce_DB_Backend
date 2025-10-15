// src/components/ProtectedRoute.js - REPLACE YOUR EXISTING FILE WITH THIS

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogIn, UserX } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = ['customer'] }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', {
    user: user ? `${user.name} (${user.role})` : null,
    loading,
    allowedRoles,
    hasUser: !!user,
    userRole: user?.role
  });

  // CRITICAL: Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // ONLY show Access Denied if loading is FALSE and user is NULL
  if (!loading && !user) {
    console.log('❌ Access denied - no user found');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserX className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this page. Please sign in to continue.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Go to Sign In
            </button>
            
            <p className="text-xs text-gray-500">
              Don't have an account? Sign up on the homepage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required role (only if user exists and loading is false)
  if (!loading && user && !allowedRoles.includes(user.role)) {
    console.log('❌ Access denied - insufficient permissions:', {
      userRole: user.role,
      requiredRoles: allowedRoles
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Insufficient Permissions</h2>
          
          <p className="text-gray-600 mb-6">
            Your account ({user.role}) doesn't have permission to access this page.
            {allowedRoles.includes('customer') && ' Customer access required.'}
            {allowedRoles.includes('admin') && ' Admin access required.'}
            {allowedRoles.includes('delivery_agent') && ' Delivery agent access required.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                if (user.role === 'admin') window.location.href = '/admin';
                else if (user.role === 'delivery_agent') window.location.href = '/delivery';
                else if (user.role === 'customer') window.location.href = '/customer';
                else window.location.href = '/';
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to My Dashboard
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has correct role
  console.log('✅ Access granted - rendering protected content');
  return children;
};

export default ProtectedRoute;