// src/services/authService.js - UPDATED with email auth functions

import axios from '../services/api';

export const authService = {
  // Register new user
  async register(userData) {
    const response = await axios.post('/api/auth/register/', userData);
    return response.data;
  },

  // Activate account with token
  async activateAccount(token) {
    const response = await axios.post(`/api/auth/activate/${token}/`);
    return response.data;
  },

  // Resend activation email
  async resendActivationEmail(email) {
    const response = await axios.post('/api/auth/resend-activation/', { email });
    return response.data;
  },

  // Log in user
  async login(email, password) {
    const response = await axios.post('/api/auth/login/', { email, password });
    return response.data;
  },

  // Log out user
  async logout(refreshToken) {
    const response = await axios.post('/api/auth/logout/', { refresh: refreshToken });
    return response.data;
  },

  // Check if user is authenticated
  async checkAuth() {
    const response = await axios.get('/api/auth/check/');
    return response.data;
  },

  // Refresh the access token
  async refreshToken(refreshToken) {
    const response = await axios.post('/api/auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  },

  // Get user profile data
  async getUserProfile() {
    const response = await axios.get('/api/auth/profile/');
    return response.data;
  },

  // Update user profile
  async updateProfile(userData) {
    const response = await axios.put('/api/auth/profile/', userData);
    return response.data;
  },

  // Change password
  async changePassword(passwordData) {
    const response = await axios.post('/api/auth/password-change/', passwordData);
    return response.data;
  },

  // Request password reset
  async requestPasswordReset(email) {
    const response = await axios.post('/api/auth/password-reset/', { email });
    return response.data;
  },

  // Reset password with token
  async resetPassword(resetData) {
    const response = await axios.post('/api/auth/password-reset/confirm/', resetData);
    return response.data;
  },

  // Validate token (simple test to check if token is still valid)
  async validateToken(token) {
    try {
      const response = await axios.get('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  // Get user addresses
  async getAddresses() {
    try {
      const response = await axios.get('/api/address/');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      
      return [];
    }
  },
  
  // Add new address
  async addAddress(addressData) {
    try {
      const response = await axios.post('/api/address/', addressData);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  // Update address
  async updateAddress(addressId, addressData) {
    try {
      const response = await axios.put(`/api/address/${addressId}/`, addressData);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  // Delete address
  async deleteAddress(addressId) {
    try {
      const response = await axios.delete(`/api/address/${addressId}/`);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }
};