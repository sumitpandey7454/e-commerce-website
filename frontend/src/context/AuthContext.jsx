import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const googleLogin = useCallback(async (googleToken) => {
    const res = await api.post('/auth/google', { token: googleToken });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const sendOtp = useCallback(async (phone) => {
    const res = await api.post('/auth/send-otp', { phone });
    return res.data;
  }, []);

  const verifyOtp = useCallback(async (phone, otp, role) => {
    const res = await api.post('/auth/verify-otp', { phone, otp, role });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, googleLogin,
      sendOtp, verifyOtp, logout, updateUser,
      isAdmin:  user?.role === 'admin',
      isSeller: user?.role === 'seller',
      isBuyer:  user?.role === 'buyer',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};