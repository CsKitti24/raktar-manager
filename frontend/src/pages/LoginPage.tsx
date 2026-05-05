import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Login.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: username,
                password
            });
            
            const access_token = response.data?.access_token || response.data?.token;
            if (access_token) {
                login(access_token);
                // Here we can decode the token or fetch user profile to determine role
                // and navigate to either /dashboard or / (home)
                // Since user requested not to use a multi-role layout but jump straight to appropriate dashboard, 
                // we'll fetch profile later or assume / routes based on role.
                alert('Sikeres bejelentkezés!'); 
                navigate('/');
            } else {
                setError('Sikeres válasz, de nem érkezett token.');
            }
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data as Record<string, string>;
                setError(data.message || data.msg || 'Hiba történt a bejelentkezés során.');
            } else {
                setError('Hiba történt a bejelentkezés során. Kérlek ellenőrizd az adataidat és a hálózatot!');
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
                            <label htmlFor="username">Email cím</label>
                            <input
                                type="email"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Például: peldapeter@gmail.com"
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Jelszó</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
