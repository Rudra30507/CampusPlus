import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuspulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('campuspulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('campuspulse_user');
    }
  }, [user]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.data);
      toast.success(`Welcome back, ${res.data.data.name}! 👋`);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      setUser(res.data.data);
      toast.success(`Account created! Welcome, ${res.data.data.name} 🎓`);
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-Click Login (SST Student / SST Event Council)
  const quickDemoLogin = async (role = 'student') => {
    if (role === 'organizer') {
      return await login('events@sst.scaler.com', 'password123');
    } else {
      return await login('rudra.24bcs10042@sst.scaler.com', 'password123');
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('campuspulse_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        quickDemoLogin,
        isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
