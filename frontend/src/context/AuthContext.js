import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      // Store auth data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  const changePassword = async (passwordData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await authAPI.changePassword({
        ...passwordData,
        token
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Password change failed' 
      };
    }
  };

  const setPassword = async (passwordData) => {
    try {
      const response = await authAPI.setPassword(passwordData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Set password error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Set password failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    changePassword,
    setPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};