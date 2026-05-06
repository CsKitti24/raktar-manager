import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import PublicLayout    from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import HomePage     from './pages/HomePage';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage  from './pages/ProfilePage';
import CheckoutPage from './pages/CheckoutPage';

// Admin pages
import AdminHomePage          from './pages/admin/AdminHomePage';
import UserManagementPage     from './pages/admin/UserManagementPage';
import ProductManagementPage  from './pages/admin/ProductManagementPage';
import OrderManagementPage    from './pages/admin/OrderManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';

// Warehouse pages
import WarehouseHomePage    from './pages/warehouse/WarehouseHomePage';
import WarehouseReceivePage from './pages/warehouse/WarehouseReceivePage';
import WarehouseDispatchPage from './pages/warehouse/WarehouseDispatchPage';
import WarehouseOrdersPage  from './pages/warehouse/WarehouseOrdersPage';
import WarehouseStoragePage from './pages/warehouse/WarehouseStoragePage';

// Carrier pages
import CarrierOrdersPage from './pages/carrier/CarrierOrdersPage';

// Supplier pages
import SupplierOrdersPage from './pages/supplier/SupplierOrdersPage';

import './index.css';

// ── Protected route (requires login) ──────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ── Role protected route ───────────────────────────────────
const RoleProtectedRoute = ({ roles, children }: { roles: string[]; children: React.ReactNode }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!user) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem' }} />
        Betöltés...
      </div>
    </div>
  );
  const hasRole = user.roles.some(r => roles.includes(r));
  if (!hasRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1e293b', color: '#fff', borderRadius: '10px', fontSize: '0.875rem' },
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <Routes>
            {/* ── Public routes ── */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login"    element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            </Route>

            {/* ── Admin routes ── */}
            <Route
              path="/admin"
              element={
                <RoleProtectedRoute roles={['Admin']}>
                  <DashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index                element={<AdminHomePage />} />
              <Route path="users"         element={<UserManagementPage />} />
              <Route path="products"      element={<ProductManagementPage />} />
              <Route path="orders"        element={<OrderManagementPage />} />
              <Route path="categories"    element={<CategoryManagementPage />} />
            </Route>

            {/* ── Warehouse routes ── */}
            <Route
              path="/warehouse"
              element={
                <RoleProtectedRoute roles={['Warehouseman', 'Admin']}>
                  <DashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index               element={<WarehouseHomePage />} />
              <Route path="receive"      element={<WarehouseReceivePage />} />
              <Route path="dispatch"     element={<WarehouseDispatchPage />} />
              <Route path="orders"       element={<WarehouseOrdersPage />} />
              <Route path="storage"      element={<WarehouseStoragePage />} />
            </Route>

            {/* ── Carrier routes ── */}
            <Route
              path="/carrier"
              element={
                <RoleProtectedRoute roles={['Carrier', 'Admin']}>
                  <DashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<CarrierOrdersPage />} />
            </Route>

            {/* ── Supplier routes ── */}
            <Route
              path="/supplier"
              element={
                <RoleProtectedRoute roles={['Supplier', 'Admin']}>
                  <DashboardLayout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<SupplierOrdersPage />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
