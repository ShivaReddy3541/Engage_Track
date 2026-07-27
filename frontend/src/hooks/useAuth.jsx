import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set default authorization header mapping
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  const checkUserSession = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      // If token is invalid or expired, log out cleanly
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { access_token, role } = response.data;
      
      sessionStorage.setItem('token', access_token);
      setToken(access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      const meResponse = await axios.get('/api/auth/me');
      setUser(meResponse.data);
      setIsAuthenticated(true);
      return { success: true, role };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Authentication failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, full_name, role, roll_number = null) => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/register', { email, password, full_name, role, roll_number });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
