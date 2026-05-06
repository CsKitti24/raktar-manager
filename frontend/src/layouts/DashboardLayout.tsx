import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './DashboardLayout.css';

// ── Sidebar config per role ────────────────────────────────
const ADMIN_MENU = [
  { path: '/admin',            label: 'Vezérlőpult',       icon: '📊', exact: true },
  { path: '/admin/users',      label: 'Felhasználókezelés', icon: '👥' },
  { path: '/admin/products',   label: 'Termékmenedzsment',  icon: '📦' },
  { path: '/admin/orders',     label: 'Rendelések',          icon: '📋' },
  { path: '/admin/categories', label: 'Kategóriák',          icon: '🏷️' },
];

const WAREHOUSE_MENU = [
  { path: '/warehouse',         label: 'Készlet',            icon: '🏭', exact: true },
  { path: '/warehouse/orders',  label: 'Rendelések',          icon: '📋' },
  { path: '/warehouse/storage', label: 'Tárolóhelyek',        icon: '📍' },
];

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles.includes('Admin');
  const menuItems = isAdmin ? ADMIN_MENU : WAREHOUSE_MENU;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const searchPlaceholder = isAdmin
    ? 'Keresés felhasználó, termék alapján...'
    : 'Keresés cikkszám alapján...';

  return (
    <div className="dashboard-wrapper">
      {/* ── Global Header ── */}
      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/" className="header-logo">Raktár Manager</Link>
        </div>

        <div className="header-center">
          <div className="header-search">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="header-search-btn" aria-label="Keresés">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="header-right">
          {/* Cart icon */}
          <button className="header-icon-btn" aria-label="Kosár" onClick={() => navigate('/checkout')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && <span className="header-badge">{totalItems}</span>}
          </button>

          {/* Account dropdown */}
          <div className="user-menu" ref={dropdownRef}>
            <button
              className="header-icon-btn"
              onClick={() => setDropdownOpen(o => !o)}
              aria-label="Fiók"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span style={{ fontSize: '0.8rem', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username ?? 'Fiók'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="user-dropdown">
                <div style={{ padding: '0.5rem 0.875rem 0.4rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{user?.username}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{user?.roles.join(', ')}</div>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profil
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-logout" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
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
