import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApi';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      // You could decode the JWT to get admin info here
      setAdmin({ token });
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await adminApiService.login(email, password);
      console.log('Login response:', response);
      const { token, admin: adminData } = response;
      
      localStorage.setItem('adminToken', token);
      setIsAuthenticated(true);
      setAdmin({ ...adminData, token });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    login,
    logout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
