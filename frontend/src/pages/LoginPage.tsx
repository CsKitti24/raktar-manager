import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Login.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LoginPage: React.FC = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const token = response.data?.token || response.data?.access_token;

      if (!token) { setError('Nem érkezett token a szervertől.'); return; }

      // login() fetches /auth/me and sets user+roles
      await login(token);

      // Fetch roles to determine redirect
      const meRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const roles: string[] = meRes.data?.roles ?? [];

      if (roles.includes('Admin') || roles.includes('Warehouseman')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string>;
        setError(data.message || data.msg || 'Hibás email cím vagy jelszó.');
      } else {
        setError('Hiba történt a bejelentkezés során. Ellenőrizd a hálózatot!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-container" style={{ minHeight: 'auto', padding: '40px 0' }}>
        <div className="login-card">
          <div className="login-header">
            <h1>RaktárManager</h1>
            <p>Jelentkezz be a fiókodba</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email cím</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Például: peter@gmail.com"
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Jelszó</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Írd be a jelszavadat"
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Bejelentkezés folyamatban...' : 'Bejelentkezés'}
            </button>
            <div className="register-link-container">
              Nincs még fiókod? <Link to="/register" className="register-link">Regisztrálj itt</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
