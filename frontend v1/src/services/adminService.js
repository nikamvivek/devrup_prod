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
      
      throw error;
    }
  },
  
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
    
    throw err;
  }
},



  getOrder: async (id) => {
    const response = await axios.get(`/api/orders/${id}/`);
    return response.data;
  },
  
  async updateOrderStatus(orderId, status, shippingDetails = null) {
  
  
  const payload = {
    status,
    ...(shippingDetails && {
      delivery_partner: shippingDetails.delivery_partner,
      tracking_number: shippingDetails.tracking_number,
      tracking_url: shippingDetails.tracking_url || '',
      expected_delivery_date: shippingDetails.expected_delivery_date
    }),
  };
  

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
      
      throw error;
    }
  },
  
  toggleUserStatus: async (id) => {
    try {
      const response = await axios.patch(`/api/users/${id}/toggle_status/`, {});
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
  
  changeUserRole: async (id, role) => {
    try {
      const response = await axios.patch(`/api/users/${id}/change_role/`, { role });
      return response.data;
    } catch (error) {
      
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
      
      throw error;
    }
  },

  getCoupon: async (id) => {
    try {
      const response = await api.get(`api/coupons/${id}/`);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  createCoupon: async (couponData) => {
    try {
      const response = await api.post('api/coupons/', couponData);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  updateCoupon: async (id, couponData) => {
    try {
      const response = await api.put(`api/coupons/${id}/`, couponData);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  deleteCoupon: async (id) => {
    try {
      const response = await api.delete(`api/coupons/${id}/`);
      return response.data;
    } catch (error) {
      
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
      
      throw error;
    }
  }
};

export default adminService;