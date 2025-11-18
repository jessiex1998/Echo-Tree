import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Try to get user info from token
        // Decode JWT to get user ID (basic implementation)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.userId && payload.exp * 1000 > Date.now()) {
            // Token is valid, get user info
            const response = await api.get(`/users/${payload.userId}`);
            if (response.data.success) {
              setUser(response.data.data);
            } else {
              localStorage.removeItem('token');
            }
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/sessions', { username, password });
      const { data } = response.data;
      const token = data?.token;
      const userData = data?.user;
      
      if (token) {
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid login response format' };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed',
      };
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await api.post('/users', { username, password, email });
      const { data } = response.data;
      const token = data?.token;
      const userData = data?.user;
      
      if (token) {
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid registration response format' };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

