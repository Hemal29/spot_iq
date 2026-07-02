import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import adminService from '../services/adminService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validateToken = useCallback(async () => {
    try {
      const response = await adminService.getDashboardStats();
      setAdmin(response.data?.admin || null);
    } catch {
      // Token exists but dashboard call failed — user is still authenticated
    } finally {
      setIsAuthenticated(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token, validateToken]);

  const login = async (email, password) => {
    const response = await adminService.login({ email, password });
    const { token: newToken, data: user } = response.data;

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    setAdmin(user);
    setIsAuthenticated(true);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const value = {
    admin,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
