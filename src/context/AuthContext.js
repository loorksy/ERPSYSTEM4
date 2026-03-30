import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Demo mode - runs frontend only without backend
const DEMO_MODE = !API_URL || API_URL === '';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo user data
const DEMO_USER = {
  id: 1,
  email: 'demo@lorkerp.com',
  name: 'مستخدم تجريبي',
  role: 'admin',
  permissions: ['all']
};

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Demo mode - check localStorage for demo session
    if (DEMO_MODE) {
      const demoSession = localStorage.getItem('demo_session');
      if (demoSession) {
        setUser(DEMO_USER);
      }
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // Demo mode - accept any credentials
    if (DEMO_MODE) {
      localStorage.setItem('demo_session', 'true');
      setUser(DEMO_USER);
      return DEMO_USER;
    }

    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    const { access_token, refresh_token, ...userData } = response.data;
    
    // Store tokens
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name) => {
    // Demo mode
    if (DEMO_MODE) {
      localStorage.setItem('demo_session', 'true');
      setUser({ ...DEMO_USER, email, name });
      return { ...DEMO_USER, email, name };
    }

    const response = await axios.post(`${API_URL}/api/auth/register`, { email, password, name });
    const { access_token, refresh_token, ...userData } = response.data;
    
    // Store tokens
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    // Demo mode
    if (DEMO_MODE) {
      localStorage.removeItem('demo_session');
      setUser(null);
      return;
    }

    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    isDemo: DEMO_MODE
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
