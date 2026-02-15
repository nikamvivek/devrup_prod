  // src/services/orderService.js
  import axios from '../services/api';

  export const orderService = {
    // Get all orders
    // async getOrders() {
    //   try {
    //     const response = await axios.get('/api/orders/');
    //     // Return the data array directly - make sure we're returning an array
    //     return Array.isArray(response.data) ? response.data : 
    //           (response.data.results || response.data.data || []);
    //   } catch (error) {
    //     console.error('Error fetching orders:', error);
    //     throw error;
    //   }
    // },


    async getOrders() {
  try {
    let allOrders = [];
    let url = '/api/orders/';
    
    // Fetch all pages
    while (url) {
      const response = await axios.get(url);
      const results = response.data.results || [];
      allOrders = [...allOrders, ...results];
      url = response.data.next; // Get next page URL
    }
    
    return allOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
},
    // Get a specific order
    async getOrder(orderId) {
      try {
        const response = await axios.get(`/api/orders/${orderId}/`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
        throw error;
      }
    },
    
    // Create Cash-on-Delivery Order
  async createCODOrder(orderData) {
    try {
      const response = await axios.post('/api/checkout/cod/', {
        address_id: orderData.address_id,
        coupon_id: orderData.coupon_id || null,
        discount_value: orderData.discount_value || '0.00',
        product_discount: orderData.product_discount || '0.00',
      });
      return response.data;
    } catch (error) {
      console.error('COD Order Error:', error.response?.data || error);
      throw error;
    }
  },

  // Initiate Online Payment (returns payment URL)
  async initiateOnlinePayment(orderData) {
    try {
      const response = await axios.post('/api/checkout/online/', {
        address_id: orderData.address_id,
        coupon_id: orderData.coupon_id || null,
        discount_value: orderData.discount_value || '0.00',
      });
      return response.data;
    } catch (error) {
      console.error('Online Payment Initiation Error:', error.response?.data || error);
      throw error;
    }
  },

  // Check Payment Status (after redirect)
  async checkPaymentStatus(merchantOrderId) {
    try {
      const response = await axios.post('/api/payment/status/', {
        merchant_order_id: merchantOrderId,
      });
      return response.data;
    } catch (error) {
      console.error('Payment Status Check Error:', error.response?.data || error);
      throw error;
    }
  },


    // // Update order status (admin only)
    // async updateOrderStatus(orderId, status) {
    //   try {
    //     const response = await axios.post(`/api/orders/${orderId}/update-status/`, { status });
    //     return response.data;
    //   } catch (error) {
    //     console.error(`Error updating status for order ${orderId}:`, error);
    //     throw error;
    //   }
    // },

    async updateOrderStatus(orderId, status, shippingDetails = null) {
      try {
        // Use spread operator to flatten shipping details into the payload
        const payload = {
          status,
          ...(shippingDetails && {
            delivery_partner: shippingDetails.delivery_partner,
            tracking_number: shippingDetails.tracking_number,
            tracking_url: shippingDetails.tracking_url || '',
            expected_delivery_date: shippingDetails.expected_delivery_date
          })
        };
        
        console.log('Sending payload to backend:', payload); // Debug log
        
        // FIX: Change update_status to update-status (with hyphen)
        const response = await axios.post(`/api/orders/${orderId}/update-status/`, payload);
        return response.data;
      } catch (error) {
        console.error(`Error updating status for order ${orderId}:`, error);
        
        // Log additional error details for debugging
        if (error.response) {
          console.error('Response error data:', error.response.data);
          console.error('Response status:', error.response.status);
        }
        
      throw error;
    }
  },


    // Process payment (depends on your payment integration)
    async processPayment(paymentData) {
      try {
        const response = await axios.post('/api/payments/confirm/', paymentData);
        return response.data;
      } catch (error) {
        console.error('Error processing payment:', error);
        throw error;
      }
    }
  };