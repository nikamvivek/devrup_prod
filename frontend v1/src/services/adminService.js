// src/services/adminService.js
import axios from '../services/api';
import api from './api';

// Create an API service for admin-related operations
const adminService = {
  // Dashboard
  // getDashboardOverview: async () => {
  //   const response = await axios.get('/api/dashboard/overview/');
  //   return response.data;
  // },

  getDashboardOverview: async () => {
  const response = await axios.get('/api/dashboard/overview/');
  return response.data;
}
,
  // Sales Reports
  getSalesReport: async (params = {}) => {
    try {
      const { period = 'monthly', startDate, endDate } = params;
      
      let url = `/api/dashboard/sales-report/?period=${period}`;
      
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      
      if (endDate) {
        url += `&end_date=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  },

  getCategorySales: async (params = {}) => {
    try {
      const { startDate, endDate } = params;
      
      let url = '/api/dashboard/category-sales/';
      
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
      } else if (startDate) {
        url += `?start_date=${startDate}`;
      } else if (endDate) {
        url += `?end_date=${endDate}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching category sales:', error);
      throw error;
    }
  },

  exportSalesReport: async (params = {}) => {
    try {
      const { period = 'monthly', startDate, endDate, format = 'csv' } = params;
      
      let url = `/api/dashboard/sales-report/export/?period=${period}&format=${format}`;
      
      if (startDate) {
        url += `&start_date=${startDate}`;
      }
      
      if (endDate) {
        url += `&end_date=${endDate}`;
      }
      
      const response = await axios.get(url, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `sales-report-${period}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error exporting sales report:', error);
      throw error;
    }
  },
  
  // // Orders
  // getAllOrders: async () => {
  //   try {
  //     const response = await axios.get('/api/orders/');
  //     console.log('Raw orders response:', response.data);
      
  //     // If the response is directly an array, return it
  //     if (Array.isArray(response.data)) {
  //       return response.data;
  //     }
      
  //     // If the response has a results property (pagination format)
  //     if (response.data && response.data.results) {
  //       // Process each order to include full user details
  //       const orders = response.data.results;
        
  //       // For each order, fetch the user details if needed
  //       const ordersWithUserDetails = await Promise.all(orders.map(async (order) => {
  //         // If user is already an object with necessary details, just return the order
  //         if (order.user && typeof order.user === 'object' && order.user.first_name) {
  //           return order;
  //         }
          
  //         // If user is just an ID, fetch user details
  //         try {
  //           // Check if we need to fetch user details (if it's just an ID string)
  //           if (order.user && typeof order.user === 'string') {
  //             const userResponse = await axios.get(`/api/users/${order.user}/`);
  //             return {
  //               ...order,
  //               userDetails: userResponse.data // Add user details without overwriting the original user ID
  //             };
  //           }
  //         } catch (err) {
  //           console.error(`Error fetching details for user ${order.user}:`, err);
  //         }
          
  //         return order;
  //       }));
        
  //       return ordersWithUserDetails;
  //     }
      
  //     // For any other structure, return the data as is
  //     return response.data;
  //   } catch (err) {
  //     console.error('Error fetching orders:', err);
  //     throw err;
  //   }
  // },
  
  // Orders
getAllOrders: async (page = 1, pageSize = 10, status = 'all') => {
  try {
    // Construct query params
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('page_size', pageSize);
    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await axios.get(`/api/orders/?${params.toString()}`);
    console.log('Raw orders response:', response.data);

    let data = response.data;

    // If response is directly an array (no pagination)
    if (Array.isArray(data)) {
      return data;
    }

    // If response has pagination (like DRF-style: { count, next, previous, results })
    if (data && data.results) {
      const orders = data.results;

      // Fetch user details if needed
      const ordersWithUserDetails = await Promise.all(
        orders.map(async (order) => {
          // If order.user is already an object with name/email, keep it
          if (order.user && typeof order.user === 'object' && order.user.first_name) {
            return order;
          }

          // If order.user is an ID or string, fetch details
          if (order.user && typeof order.user === 'string') {
            try {
              const userResponse = await axios.get(`/api/users/${order.user}/`);
              return {
                ...order,
                userDetails: userResponse.data,
              };
            } catch (err) {
              console.error(`Error fetching user details for ${order.user}:`, err);
              return order; // Return as-is on failure
            }
          }

          return order;
        })
      );

      // Return pagination info in a consistent structure
      return {
        count: data.count || ordersWithUserDetails.length,
        results: ordersWithUserDetails,
        next: data.next,
        previous: data.previous,
      };
    }

    // Default fallback
    return data;
  } catch (err) {
    console.error('Error fetching orders:', err);
    throw err;
  }
},



  getOrder: async (id) => {
    const response = await axios.get(`/api/orders/${id}/`);
    return response.data;
  },
  
  async updateOrderStatus(orderId, status, shippingDetails = null) {
  console.log('updateOrderStatus called with:', orderId, status, shippingDetails);
  
  const payload = {
    status,
    ...(shippingDetails && {
      delivery_partner: shippingDetails.delivery_partner,
      tracking_number: shippingDetails.tracking_number,
      tracking_url: shippingDetails.tracking_url || '',
      expected_delivery_date: shippingDetails.expected_delivery_date
    }),
  };
  console.log('Sending payload to backend:', payload);

  const response = await axios.post(`/api/orders/${orderId}/update_status/`, payload);
  return response.data;
},
  
  // Users
  getAllUsers: async (params = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add role filter if provided
      if (params.role && params.role !== 'all') {
        queryParams.append('role', params.role);
      }
      
      // Add search query if provided
      if (params.search) {
        queryParams.append('search', params.search);
      }
      
      // Add page number if provided
      if (params.page) {
        queryParams.append('page', params.page);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/api/users/?${queryString}` : '/api/users/';
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  toggleUserStatus: async (id) => {
    try {
      const response = await axios.patch(`/api/users/${id}/toggle_status/`, {});
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },
  
  changeUserRole: async (id, role) => {
    try {
      const response = await axios.patch(`/api/users/${id}/change_role/`, { role });
      return response.data;
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  },
  
  getUser: async (id) => {
    const response = await axios.get(`/api/users/${id}/`);
    return response.data;
  },
  
  updateUserStatus: async (id, isActive) => {
    const response = await axios.patch(`/api/users/${id}/`, { is_active: isActive });
    return response.data;
  },
  
  updateUserRole: async (id, roleData) => {
    const response = await axios.patch(`/api/users/${id}/`, roleData);
    return response.data;
  },
  
  // Products
  getAllProducts: async () => {
    const response = await axios.get('/api/products/');
    return response.data;
  },
  
  getProduct: async (id) => {
    const response = await axios.get(`/api/products/${id}/`);
    return response.data;
  },
  
  createProduct: async (productData) => {
    const response = await axios.post('/api/products/create/', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  updateProduct: async (id, productData) => {
    const response = await axios.put(`/api/products/${id}/update/`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  deleteProduct: async (id) => {
    await axios.delete(`/api/products/${id}/delete/`);
    return true;
  },
  
  // Categories
  getAllCategories: async () => {
    const response = await axios.get('/api/categories/');
    return response.data;
  },
  
createCategory: async (categoryData) => {
  console.log('Creating category with data:', categoryData);
  const response = await axios.post('/api/categories/', categoryData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
},

  
  updateCategory: async (id, categoryData) => {
    const response = await axios.put(`/api/categories/${id}/`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    await axios.delete(`/api/categories/${id}/`);
    return true;
  },
  
// Coupon operations
  getAllCoupons: async () => {
    try {
      const response = await api.get('api/coupons/');
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  },

  getCoupon: async (id) => {
    try {
      const response = await api.get(`api/coupons/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw error;
    }
  },

  createCoupon: async (couponData) => {
    try {
      const response = await api.post('api/coupons/', couponData);
      return response.data;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  updateCoupon: async (id, couponData) => {
    try {
      const response = await api.put(`api/coupons/${id}/`, couponData);
      return response.data;
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  deleteCoupon: async (id) => {
    try {
      const response = await api.delete(`api/coupons/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  },

  validateCoupon: async (code, cartTotal) => {
    try {
      const response = await api.post('api/coupons/validate/', {
        code,
        cart_total: cartTotal
      });
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  }
};

export default adminService;