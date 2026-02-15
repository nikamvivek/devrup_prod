import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services/cartService';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const LOCAL_CART_KEY = 'localCart';

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Load local cart on mount (for guest users)
  useEffect(() => {
    if (!isAuthenticated) {
      loadLocalCart();
    }
  }, []);

  // Handle authentication changes - KEY FOR SYNC
  useEffect(() => {
    if (isAuthenticated) {
      syncLocalCartToBackend();
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated]);

  // Calculate totals whenever cart items or coupon change
  useEffect(() => {
    calculateTotals();
  }, [cartItems, coupon]);

  // Load cart from browser storage
  const loadLocalCart = () => {
    try {
      const localCartData = localStorage.getItem(LOCAL_CART_KEY);
      if (localCartData) {
        const parsedCart = JSON.parse(localCartData);
        setCartItems(parsedCart);
      }
    } catch (error) {
          }
  };

  // Save cart to browser storage
  const saveLocalCart = (items) => {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    } catch (error) {
          }
  };

  // Clear browser cart
  const clearLocalCart = () => {
    try {
      localStorage.removeItem(LOCAL_CART_KEY);
    } catch (error) {
          }
  };

  // CRITICAL: Sync local cart with backend after login
  const syncLocalCartToBackend = async () => {
    const localCartData = localStorage.getItem(LOCAL_CART_KEY);
    
    if (!localCartData || syncInProgress) return;
    
    setSyncInProgress(true);
    setLoading(true);
    
    try {
      const localCart = JSON.parse(localCartData);
      
      if (localCart.length > 0) {
                
        // Add each item to backend cart
        const syncPromises = localCart.map(item => 
          cartService.addToCart({
            product_variant_id: item.product_variant_id,
            quantity: item.quantity
          }).catch(err => {
                        return null;
          })
        );
        
        await Promise.all(syncPromises);
        
        // Clear local cart after successful sync
        clearLocalCart();
        
              }
      
      // Fetch the updated cart from backend
      await fetchCart();
    } catch (error) {
            setError('Failed to sync your cart. Some items may not have been added.');
    } finally {
      setSyncInProgress(false);
      setLoading(false);
    }
  };

  // Fetch cart from backend (authenticated users)
  const fetchCart = async () => {
    if (!isAuthenticated) {
      loadLocalCart();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const cartData = await cartService.getCart();
      
      if (cartData && cartData.items) {
        const processedItems = cartData.items.map(item => {
          const variant = item.product_variant || {};
          
          if (variant.price && typeof variant.price === 'string') {
            variant.price = parseFloat(variant.price);
          }
          
          if (variant.discount_price && typeof variant.discount_price === 'string') {
            variant.discount_price = parseFloat(variant.discount_price);
          }
          
          return {
            ...item,
            product_variant: variant
          };
        });
        
        setCartItems(processedItems);
      } else {
        setCartItems([]);
      }
    } catch (err) {
            setError('Failed to load your cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let total = 0;
    
    cartItems.forEach(item => {
      const variant = item.product_variant || {};
      let price = variant.is_discount_active && variant.discount_price 
        ? variant.discount_price 
        : variant.price;
      
      if (typeof price === 'string') {
        price = parseFloat(price);
      }
      
      if (!isNaN(price)) {
        total += price * item.quantity;
      }
    });
    
    setCartTotal(total);
    
    if (coupon) {
      let discountAmount = 0;
      
      if (coupon.discount_type === 'percent') {
        discountAmount = total * (parseFloat(coupon.discount_value) / 100);
        
        if (coupon.max_discount && discountAmount > parseFloat(coupon.max_discount)) {
          discountAmount = parseFloat(coupon.max_discount);
        }
      } else {
        discountAmount = parseFloat(coupon.discount_value);
      }
      
      setDiscount(discountAmount);
      setFinalTotal(total - discountAmount);
    } else {
      setDiscount(0);
      setFinalTotal(total);
    }
  };

  // Add to cart - handles both guest and authenticated users
  const addToCart = async (productData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        // Add to backend cart
        await cartService.addToCart(productData);
        await fetchCart();
      } else {
        // Add to local cart (guest user) with FULL product details
        const localCart = [...cartItems];
        
        // Check if item already exists
        const existingIndex = localCart.findIndex(
          item => item.product_variant_id === productData.product_variant_id
        );
        
        if (existingIndex !== -1) {
          // Update quantity
          localCart[existingIndex].quantity += productData.quantity;
        } else {
          // IMPORTANT: Store complete product details for guest cart display
          localCart.push({
            id: `local_${Date.now()}`, // Temporary ID
            product_variant_id: productData.product_variant_id,
            quantity: productData.quantity,
            added_at: new Date().toISOString(),
            // Store complete product_variant object with all details
            product_variant: productData.product_variant || {
              id: productData.product_variant_id,
              size: productData.size,
              price: productData.price,
              discount_price: productData.discount_price,
              is_discount_active: productData.is_discount_active
            },
            // Store complete product object with all details
            product: productData.product || {
              id: productData.product_id,
              name: productData.product_name,
              slug: productData.product_slug,
              main_image: productData.product_image,
              category_name: productData.category_name
            }
          });
        }
        
        setCartItems(localCart);
        saveLocalCart(localCart);
      }
      
      return true;
    } catch (err) {
            setError('Failed to add item to cart. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        await cartService.updateCartItem(itemId, quantity);
        
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      } else {
        // Update local cart
        const updatedCart = cartItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        
        setCartItems(updatedCart);
        saveLocalCart(updatedCart);
      }
      
      return true;
    } catch (err) {
            setError('Failed to update item. Please try again.');
      if (isAuthenticated) {
        await fetchCart();
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (isAuthenticated) {
        await cartService.removeFromCart(itemId);
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      } else {
        // Remove from local cart
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        saveLocalCart(updatedCart);
      }
      
      return true;
    } catch (err) {
            setError('Failed to remove item. Please try again.');
      if (isAuthenticated) {
        await fetchCart();
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setDiscount(0);
    if (!isAuthenticated) {
      clearLocalCart();
    }
  };

  const applyCoupon = async (code) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please log in to apply a coupon.');
      }
      
      const couponData = await cartService.applyCoupon(code, cartTotal);
      
      setCoupon(couponData.coupon);
      setDiscount(couponData.discount || 0);
      setFinalTotal(couponData.final_total || cartTotal);
      
      return true;
    } catch (err) {
            setCoupon(null);
      setDiscount(0);
      setFinalTotal(cartTotal);
      
      throw new Error(err.message || 'Failed to apply coupon. Please try again.');
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        loading,
        error,
        coupon,
        discount,
        finalTotal,
        syncInProgress,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
        getCartItemCount,
        isAuthenticated
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;