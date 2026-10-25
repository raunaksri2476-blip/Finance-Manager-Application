import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Failed to verify token', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { token: jwtToken, ...userData } = response.data;
    
    setToken(jwtToken);
    setUser(userData);
    
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  };

  const register = async (name, email, password, confirmPassword, phone) => {
    const response = await authAPI.register({ name, email, password, confirmPassword, phone });
    const { token: jwtToken, ...userData } = response.data;
    
    setToken(jwtToken);
    setUser(userData);
    
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
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
