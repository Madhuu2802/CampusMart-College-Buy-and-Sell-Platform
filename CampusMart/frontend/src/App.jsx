import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import VendorDashboard from './pages/VendorDashboard';
import StudentMarketplace from './pages/StudentMarketplace';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import ApiTest from './pages/ApiTest';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import VendorsList from './pages/VendorsList';
import VendorStore from './pages/VendorStore';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access check
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Additional gating: vendor must be approved to access vendor-only routes
  if (requiredRole === 'vendor' && user.role === 'vendor' && !user.vendorDetails?.isApproved) {
    // Redirect to dashboard until admin approves vendor account
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen theme-container">
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor-dashboard"
                  element={
                    <ProtectedRoute requiredRole="vendor">
                      <Navbar />
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketplace"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <StudentMarketplace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendors"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <VendorsList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vendor/:id"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <VendorStore />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Navbar />
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <ProductDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Navbar />
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* API Test Route */}
                <Route path="/api-test" element={<ApiTest />} />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
