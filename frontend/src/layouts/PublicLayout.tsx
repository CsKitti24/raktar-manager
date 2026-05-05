import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../Home.css';

const PublicLayout: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">
            Raktár Manager
          </Link>
          <div className="search-bar">
            <input type="text" placeholder="Keresés alkatrész, cikkszám alapján..." />
            <button className="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="navbar-right">
          <button className="cart-btn" aria-label="Fiók" onClick={() => {
            if (isLoggedIn) navigate('/profile');
            else navigate('/login');
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          <button className="cart-btn" aria-label="Kosár" onClick={() => navigate('/checkout')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="cart-badge">{totalItems}</span>
          </button>
          {!isLoggedIn && (
            <Link to="/login" className="auth-btn" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: 'normal' }}>Belépés / Regisztráció</Link>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Raktár Manager Webshop</h4>
          </div>
          <div className="footer-section">
            <h4>Elérhetőség</h4>
            <p>Veszprém, Egyetem utca 1</p>
            <p>+36 30 123 4567</p>
          </div>
          <div className="footer-section">
            <h4>Kapcsolat</h4>
            <p><a href="mailto:info@raktarmanager.hu">info@raktarmanager.hu</a></p>
            <p><a href="mailto:reklamacio@raktarmanager.hu">reklamacio@raktarmanager.hu</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Raktár Manager. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
