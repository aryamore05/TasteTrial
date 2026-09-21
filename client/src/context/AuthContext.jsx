import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('tastetrail_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Load authenticated user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('tastetrail_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (data.success) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (error) {
        console.warn('Session expired or invalid token:', error.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem('tastetrail_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  };

  const signup = async (name, email, password) => {
    const data = await authApi.signup({ name, email, password });
    if (data.success && data.token) {
      localStorage.setItem('tastetrail_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Signup failed');
  };

  const logout = () => {
    localStorage.removeItem('tastetrail_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser: async () => {
          try {
            const data = await authApi.getMe();
            if (data.success) setUser(data.user);
          } catch (e) {
            // ignore
          }
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
