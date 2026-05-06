import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

export interface AuthUser {
  id: number;
  username: string;
  roles: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchUser = async (t: string) => {
    try {
      const resp = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(resp.data);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      fetchUser(storedToken);
    }
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    await fetchUser(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
