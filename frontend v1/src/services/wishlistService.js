// src/services/wishlistService.js
import axios from '../services/api';

export const wishlistService = {
  // Get wishlist contents
  async getWishlist() {
    const response = await axios.get('/api/wishlist/');
    return response.data;
  },

  // Add product to wishlist
  async addToWishlist(productId) {
    const response = await axios.post('/api/wishlist/', { product_id: productId });
    return response.data;
  },

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    const response = await axios.delete(`/api/wishlist/${productId}/`);
    return response.data;
  }
};