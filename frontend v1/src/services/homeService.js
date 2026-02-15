// services/homeService.js
import api from './api';

export const homeService = {
  getHomePageData: async () => {
    try {
      const response = await api.get('/api/homepage/');
      return response.data;
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      throw error;
    }
  },
};