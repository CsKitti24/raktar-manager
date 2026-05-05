import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../Register.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload: Record<string, string> = {
                username,
                full_name: fullName,
                email,
                password
            };
            if (phone.trim() !== '') {
                payload.phone = phone;
            }

            await axios.post(`${API_URL}/auth/register`, payload);
            
            alert('Sikeres regisztráció! Kérlek jelentkezz be.');
            navigate('/login');
            
        } catch (err: unknown) {
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.data) {
                const data = err.response.data as Record<string, string>;
                setError(data.message || data.msg || 'Hiba történt a regisztráció során.');
            } else {
                setError('Hiba történt a regisztráció során. Kérlek ellenőrizd az adataidat és a hálózatot!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="register-container" style={{ minHeight: 'auto', padding: '40px 0' }}>
                <div className="register-card">
                    <div className="register-header">
                        <h1>RaktárManager</h1>
                        <p>Hozd létre a fiókodat</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="username">Felhasználónév</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Például: admin_user"
                                autoComplete="username"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fullName">Teljes név</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="Kovács János"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email cím</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@raktar.hu"
                                autoComplete="email"
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
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Telefonszám (opcionális)</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+36 30 123 4567"
                                autoComplete="tel"
                            />
                        </div>
                        <button type="submit" className="register-btn" disabled={loading}>
                            {loading ? 'Regisztráció folyamatban...' : 'Regisztráció'}
                        </button>
                        <div className="login-link-container">
                            Már van fiókod? <Link to="/login" className="login-link">Jelentkezz be itt</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
