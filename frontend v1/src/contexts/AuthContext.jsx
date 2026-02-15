// src/contexts/AuthContext.jsx - UPDATED with email auth support

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../services/api';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresActivation, setRequiresActivation] = useState(false);
  const [activationEmail, setActivationEmail] = useState(null);

  // Set up axios interceptor for adding auth token to requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setLoading(true);
          const userData = await authService.getUserProfile();
          setUser(userData);
          setError(null);
          setRequiresActivation(false);
        } catch (err) {
          // If token is expired, try to refresh
          if (err.response && err.response.status === 401 && refreshToken) {
            try {
              const newTokens = await authService.refreshToken(refreshToken);
              setToken(newTokens.access);
              setRefreshToken(newTokens.refresh);
              localStorage.setItem('token', newTokens.access);
              localStorage.setItem('refreshToken', newTokens.refresh);
              // Retry getting user profile
              const userData = await authService.getUserProfile();
              setUser(userData);
              setError(null);
              setRequiresActivation(false);
            } catch (refreshErr) {
                            logout();
              setError('Session expired. Please log in again.');
            }
          } else {
                        logout();
            setError('Error loading user profile.');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
  }, [token, refreshToken]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      
      // Check if account activation is required
      if (response.requires_activation) {
        setRequiresActivation(true);
        setActivationEmail(response.email);
        setError(response.message);
        throw new Error(response.message);
      }
      
      // Save tokens
      setToken(response.access);
      setRefreshToken(response.refresh);
      localStorage.setItem('token', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      
      // Set user data
      setUser(response.user);
      setRequiresActivation(false);
      setActivationEmail(null);
      return response.user;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Transform data to match backend expectations
      const registrationData = {
        ...userData,
        password: userData.password,
        password_confirm: userData.confirm_password || userData.password_confirm,
        is_vendor: userData.is_vendor || false,
        is_customer: userData.is_customer !== undefined ? userData.is_customer : true
      };

      const response = await authService.register(registrationData);
      
      // Set activation state
      setRequiresActivation(true);
      setActivationEmail(userData.email);
      
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.errors || err.response?.data?.message || err.response?.data || 'Registration failed.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async (token) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.activateAccount(token);
      setRequiresActivation(false);
      setActivationEmail(null);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Account activation failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendActivationEmail = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.resendActivationEmail(email);
      setActivationEmail(email);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend activation email.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
          } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setRequiresActivation(false);
      setActivationEmail(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Password change failed.';
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await authService.requestPasswordReset(email);
    } catch (err) {
      // Still show success even if there's an error (security best practice)
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(resetData);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to reset password.';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to get the current token (can be used by other services)
  const getToken = async () => {
    if (!token) return null;
    
    try {
      await authService.validateToken(token);
      return token;
    } catch (err) {
      if (err.response && err.response.status === 401 && refreshToken) {
        try {
          const newTokens = await authService.refreshToken(refreshToken);
          setToken(newTokens.access);
          setRefreshToken(newTokens.refresh);
          localStorage.setItem('token', newTokens.access);
          localStorage.setItem('refreshToken', newTokens.refresh);
          return newTokens.access;
        } catch (refreshErr) {
                    logout();
          return null;
        }
      } else {
        return null;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        requiresActivation,
        activationEmail,
        login,
        register,
        logout,
        activateAccount,
        resendActivationEmail,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        getToken,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.is_admin || false,
        isVendor: user?.is_vendor || false,
        isActive: user?.is_active || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};