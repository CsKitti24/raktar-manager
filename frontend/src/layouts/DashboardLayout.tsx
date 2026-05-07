import React from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

// ── Sidebar config per role ────────────────────────────────
const ADMIN_MENU = [
  { path: '/admin',            label: 'Vezérlőpult',       icon: '📊', exact: true },
  { path: '/admin/users',      label: 'Felhasználókezelés', icon: '👥' },
  { path: '/admin/products',   label: 'Termékmenedzsment',  icon: '📦' },
  { path: '/admin/orders',     label: 'Rendelések',          icon: '📋' },
  { path: '/admin/categories', label: 'Kategóriák',          icon: '🏷️' },
  { path: '/admin/complaints', label: 'Reklamációk',         icon: '💬' },
];

const WAREHOUSE_MENU = [
  { path: '/warehouse',          label: 'Vezérlőpult',      icon: '📊', exact: true },
  { path: '/warehouse/receive',  label: 'Áru bevételezése', icon: '📥' },
  { path: '/warehouse/dispatch', label: 'Áru kiadása',      icon: '📤' },
  { path: '/warehouse/orders',   label: 'Rendelések',        icon: '📋' },
  { path: '/warehouse/storage',  label: 'Tárolóhelyek',      icon: '📍' },
];

const CARRIER_MENU = [
  { path: '/carrier', label: 'Fuvarjaim', icon: '🚚', exact: true },
];

const SUPPLIER_MENU = [
  { path: '/supplier', label: 'Beszállítói feladatok', icon: '📦', exact: true },
];

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.roles.includes('Admin');
  const isWarehouseman = user?.roles.includes('Warehouseman');
  const isCarrier = user?.roles.includes('Carrier');
  const isSupplier = user?.roles.includes('Supplier');

  // If on /warehouse path, show warehouse menu; if /carrier show carrier menu; otherwise admin menu
  const isWarehousePath = window.location.pathname.startsWith('/warehouse');
  const isCarrierPath = window.location.pathname.startsWith('/carrier');
  const isSupplierPath = window.location.pathname.startsWith('/supplier');

  let menuItems = ADMIN_MENU;
  if (isSupplierPath || (!isAdmin && !isWarehouseman && !isCarrier && isSupplier)) {
    menuItems = SUPPLIER_MENU;
  } else if (isCarrierPath || (!isAdmin && !isWarehouseman && isCarrier)) {
    menuItems = CARRIER_MENU;
  } else if (isWarehousePath || (!isAdmin && isWarehouseman)) {
    menuItems = WAREHOUSE_MENU;
  }


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-wrapper">
      {/* ── Global Header ── */}
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/" className="header-logo">Raktár Manager</Link>
        </div>

        <div className="header-center">
        </div>

        <div className="header-right">
          <button className="header-icon-btn" style={{ width: 'auto', padding: '0 10px', display: 'flex', gap: '5px' }} onClick={handleLogout} aria-label="Kijelentkezés">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span style={{ fontSize: '0.875rem' }}>Kijelentkezés</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section-label">Menü</div>
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
