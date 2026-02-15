import api from './api';

const bannerService = {
  /**
   * Get all banners
   * @param {Object} params - Query parameters (position, etc.)
   * @returns {Promise} List of banners
   */
  getBanners: async (params = {}) => {
    try {
      const response = await api.get('api/banners/', { params });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Get a specific banner by ID
   * @param {string} bannerId - Banner UUID
   * @returns {Promise} Banner details
   */
  getBanner: async (bannerId) => {
    try {
      const response = await api.get(`api/banners/${bannerId}/`);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Create a new banner
   * @param {FormData} formData - Banner data including image
   * @returns {Promise} Created banner
   */
  createBanner: async (formData) => {
    try {
      const response = await api.post('api/banners/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Update an existing banner
   * @param {string} bannerId - Banner UUID
   * @param {FormData} formData - Banner data including optional image
   * @returns {Promise} Updated banner
   */
  updateBanner: async (bannerId, formData) => {
    try {
      const response = await api.put(`api/banners/${bannerId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Delete a banner
   * @param {string} bannerId - Banner UUID
   * @returns {Promise} Deletion confirmation
   */
  deleteBanner: async (bannerId) => {
    try {
      const response = await api.delete(`api/banners/${bannerId}/`);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },

  /**
   * Toggle banner active status
   * @param {string} bannerId - Banner UUID
   * @returns {Promise} Updated banner
   */
  toggleBannerStatus: async (bannerId) => {
    try {
      const response = await api.patch(`api/banners/${bannerId}/toggle_status/`);
      return response.data;
    } catch (error) {
      
      throw error;
    }
  },
};

export default bannerService;