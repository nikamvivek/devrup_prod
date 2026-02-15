// src/services/cartService.js
import axios from './api';

export const cartService = {
  // Get cart contents
  async getCart() {
    try {
      const response = await axios.get('/api/cart/');
      console.log('Raw cart response:', response.data);
      
      // Normalize response data if needed
      const cartData = response.data;
      
      // Ensure cart items exist and are properly formatted
      if (cartData && cartData.items) {
        // Process the items with product details if needed
        const processedItems = await Promise.all(cartData.items.map(async (item) => {
          try {
            // Try to get product info if not included
            if (item.product_variant && !item.product) {
              const productVariantId = item.product_variant.id;
              // First, try to get variant details with product info
              const variantDetails = await cartService.getProductVariantDetails(productVariantId);
              if (variantDetails && variantDetails.product) {
                return {
                  ...item,
                  product: variantDetails.product
                };
              }
            }
          } catch (error) {
            console.warn('Unable to fetch product details for variant:', error);
          }
          
          // Convert price values to numbers if needed
          if (item.product_variant) {
            if (typeof item.product_variant.price === 'string') {
              item.product_variant.price = parseFloat(item.product_variant.price);
            }
            
            if (typeof item.product_variant.discount_price === 'string') {
              item.product_variant.discount_price = parseFloat(item.product_variant.discount_price);
            }
          }
          
          return item;
        }));
        
        cartData.items = processedItems;
      }
      
      return cartData;
    } catch (error) {
      console.error('Error fetching cart:', error.response || error);
      throw error;
    }
  },

  // Get product variant details
  async getProductVariantDetails(variantId) {
    try {
      const response = await axios.get(`/api/products/variant/${variantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching variant details:', error);
      return null;
    }
  },

  // Get product details
  async getProductDetails(productId) {
    try {
      const response = await axios.get(`/api/products/${productId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  },

  // Add item to cart
  async addToCart(itemData) {
    console.log('Cart service: Adding to cart with data:', itemData);
    
    // Handle different data structures based on whether we have a variant ID or product ID
    const requestData = itemData.product_variant_id
      ? itemData  // Original structure for variants
      : {
          // Adapted structure for products without variants
          product_id: itemData.product_id,
          quantity: itemData.quantity
        };
    
    try {
      // Try primary endpoint first (for variants)
      let response;
      
      if (itemData.product_variant_id) {
        // If we have a variant ID, use the standard cart add endpoint
        response = await axios.post('/api/cart/add/', requestData);
      } else {
        // If we only have a product ID, try the alternate endpoint
        try {
          response = await axios.post('/api/cart/add-product/', requestData);
        } catch (variantError) {
          // If that fails, try the regular endpoint anyway as a fallback
          console.warn('Failed to add product directly, trying standard endpoint:', variantError);
          response = await axios.post('/api/cart/add/', requestData);
        }
      }
      
      console.log('Cart service: Successfully added to cart, response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Cart service: Error adding to cart:', error.response || error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await axios.put(`/api/cart/update/${itemId}/`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error.response || error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const response = await axios.delete(`/api/cart/remove/${itemId}/`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error.response || error);
      throw error;
    }
  },

// Validate and apply coupon with enhanced error handling for required fields
async applyCoupon(code, cartTotal) {
  try {
    // Validate required fields on the client side first
    if (!code) {
      throw new Error('Coupon code is required');
    }
    
    if (cartTotal === undefined || cartTotal === null) {
      throw new Error('Cart total is required');
    }
    
    const normalizedCartTotal = typeof cartTotal === 'string' 
      ? parseFloat(cartTotal) 
      : cartTotal;

    console.log('Applying coupon with data:', { 
      coupon: code,
      cart_total: normalizedCartTotal 
    });

    const response = await axios.post('/api/validate-coupon/', 
      { 
        coupon: code,
        cart_total: normalizedCartTotal 
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Coupon application response:', response.data);
    
    // Normalize response data
    const responseData = response.data;
    
    // Make sure discount and final_total are numbers
    if (responseData.discount && typeof responseData.discount === 'string') {
      responseData.discount = parseFloat(responseData.discount);
    }
    
    if (responseData.final_total && typeof responseData.final_total === 'string') {
      responseData.final_total = parseFloat(responseData.final_total);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error applying coupon:', error.response?.data || error.message || error);
    
    // Improved error handling to extract validation messages
    if (error.response) {
      const errorData = error.response.data;
      
      // Extract specific validation error messages
      if (error.response.status === 400) {
        // Handle various error formats that might come from Django
        if (errorData) {
          // Look for the simplest form first: field with "This field is required."
          const requiredFieldErrors = Object.entries(errorData)
            .filter(([key, value]) => 
              Array.isArray(value) && 
              value.some(msg => msg.includes("field is required"))
            )
            .map(([field, messages]) => {
              const msg = messages.find(m => m.includes("field is required"));
              return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            });
            
          if (requiredFieldErrors.length > 0) {
            throw new Error(requiredFieldErrors[0]);
          }
          
          // Case 1: Error is in the form {field: [error_messages]}
          const fieldErrors = Object.entries(errorData)
            .filter(([key, value]) => Array.isArray(value) && value.length > 0)
            .map(([field, messages]) => {
              // If the field is 'non_field_errors', don't include the field name
              if (field === 'non_field_errors') {
                return messages[0];
              }
              return `${messages[0]}`;
            });
            
          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors[0]); // Just throw the first error message
          }
          
          // Case 2: Error is in the form {error: "message"}
          if (errorData.error) {
            throw new Error(errorData.error);
          }
          
          // Case 3: Error is in the form {code: "message"}
          if (errorData.code && !Array.isArray(errorData.code)) {
            throw new Error(errorData.code);
          }
          
          // Case 4: Direct cart_total error message
          if (errorData.cart_total && Array.isArray(errorData.cart_total) && errorData.cart_total.length > 0) {
            throw new Error(errorData.cart_total[0]);
          }
          
          // Case 5: Direct code error message
          if (errorData.code && Array.isArray(errorData.code) && errorData.code.length > 0) {
            throw new Error(errorData.code[0]);
          }
        }
        // Default error if we couldn't extract a specific message
        throw new Error('Invalid coupon or cart data. Please check and try again.');
      } else if (error.response.status === 405) {
        throw new Error('Method not allowed. The API endpoint does not support this HTTP method.');
      } else if (error.response.status === 401) {
        throw new Error('Authentication required. Please log in to apply a coupon.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server:', error.request);
      throw new Error('No response received from server. Please check your network connection.');
    }
    
    // For any other type of error
    throw error;
  }
}
};