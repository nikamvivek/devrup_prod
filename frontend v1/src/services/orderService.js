  // src/services/orderService.js
  import axios from '../services/api';

  export const orderService = {

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
    
    throw error;
  }
},
    // Get a specific order
    async getOrder(orderId) {
      try {
        const response = await axios.get(`/api/orders/${orderId}/`);
        return response.data;
      } catch (error) {
        
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
      
      throw error;
    }
  },

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
        
         // Debug log
        
        // FIX: Change update_status to update-status (with hyphen)
        const response = await axios.post(`/api/orders/${orderId}/update-status/`, payload);
        return response.data;
      } catch (error) {
        
        
       
        
      throw error;
    }
  },


    // Process payment (depends on your payment integration)
    async processPayment(paymentData) {
      try {
        const response = await axios.post('/api/payments/confirm/', paymentData);
        return response.data;
      } catch (error) {
        
        throw error;
      }
    }
  };