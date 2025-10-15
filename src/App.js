// src/App.js - COMPLETE WITH ALL E-COMMERCE ROUTES + ADMIN DASHBOARD
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProductProvider } from './contexts/ProductContext';

// Import components
import LandingPage from './components/common/LandingPage';
import LoadingScreen from './components/common/LoadingScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import DeliveryDashboard from './components/delivery/DeliveryDashboard';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './components/wishlist/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';


/* ---------------- ProtectedRoute Component ---------------- */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." fullScreen={true} />;
  }

  // Not logged in - redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role permissions - redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : 
                        user.role === 'delivery_agent' ? '/delivery/dashboard' : 
                        '/products';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/* ---------------- PublicRoute Component ---------------- */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading..." fullScreen={true} />;
  }

  // If user is logged in and tries to access landing page, redirect based on role
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'delivery_agent') {
      return <Navigate to="/delivery/dashboard" replace />;
    } else if (user.role === 'customer') {
      return <Navigate to="/products" replace />;
    }
  }

  return children;
};

/* ---------------- AppRoutes Component ---------------- */
const AppRoutes = () => (
  <Routes>
    {/* ==================== PUBLIC ROUTES ==================== */}
    <Route
      path="/"
      element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      }
    />

    {/* ==================== ADMIN ROUTES ==================== */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* ==================== DELIVERY AGENT ROUTES ==================== */}
    <Route
      path="/delivery"
      element={
        <ProtectedRoute allowedRoles={['delivery_agent']}>
          <DeliveryDashboard />
        </ProtectedRoute>
      }
    />
    
    <Route
      path="/delivery/dashboard"
      element={
        <ProtectedRoute allowedRoles={['delivery_agent']}>
          <DeliveryDashboard />
        </ProtectedRoute>
      }
    />

    {/* ==================== CUSTOMER ROUTES ==================== */}
    <Route
      path="/customer"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/customer/dashboard"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CustomerDashboard />
        </ProtectedRoute>
      }
    />

    {/* Products & Shopping Routes */}
    <Route
      path="/products"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ProductsPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/products/:productId"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ProductDetailPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/wishlist"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <WishlistPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/cart"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CartPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/checkout"
      element={
        <ProtectedRoute allowedRoles={['customer']}>
          <CheckoutPage />
        </ProtectedRoute>
      }
    />

    {/* ==================== CATCH-ALL ROUTE ==================== */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/* ---------------- Main App Component ---------------- */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <div className="App min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;