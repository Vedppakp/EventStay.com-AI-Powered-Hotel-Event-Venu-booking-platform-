import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eventstay_token') || '');
  const [loading, setLoading] = useState(true);

  // Initialize user from token
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to authenticate with stored token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const handleAuthSuccess = (data) => {
    localStorage.setItem('eventstay_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success) {
      handleAuthSuccess(res);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success) {
      handleAuthSuccess(res);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const switchRoleDemo = async (role) => {
    try {
      const res = await authAPI.demoLogin(role);
      if (res.success) {
        handleAuthSuccess(res);
        return res;
      }
    } catch (err) {
      console.error('Demo login failed:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('eventstay_token');
    setToken('');
    setUser(null);
  };

  const toggleWishlist = async (propertyId) => {
    if (!user) return;
    try {
      const res = await authAPI.toggleWishlist(propertyId);
      if (res.success) {
        setUser((prev) => ({
          ...prev,
          wishlist: res.wishlist
        }));
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const isWishlisted = (propertyId) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some((id) => (typeof id === 'string' ? id === propertyId : id._id === propertyId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isCustomer: user?.role === 'customer',
        isOwner: user?.role === 'owner',
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        switchRoleDemo,
        toggleWishlist,
        isWishlisted
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
