// src/contexts/WishlistContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use useCallback to stabilize the function reference
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlistItems(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load your wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load wishlist when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      setError('Please log in to add items to your wishlist.');
      return;
    }

    try {
      setLoading(true);
      await wishlistService.addToWishlist(productId);
      await fetchWishlist(); // Refresh wishlist after adding item
      setError(null);
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError('Failed to add item to wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      setLoading(true);
      await wishlistService.removeFromWishlist(productId);
      // Update local state without refetching
      setWishlistItems(wishlistItems.filter(item => item.product.id !== productId));
      setError(null);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if a product is in the wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.product.id === productId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};