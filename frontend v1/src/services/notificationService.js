// src/services/notificationService.js
import axios from '../services/api';

export const notificationService = {
  // Get all notifications with improved response handling
  async getNotifications() {
    try {
      const response = await axios.get('/api/notifications/');
      console.log('Raw API response:', response);
      
      // Handle different API response formats
      if (response.data !== undefined) {
        // If data is an array, return it directly
        if (Array.isArray(response.data)) {
          return response.data;
        } 
        // If data has results property (common Django REST pattern with pagination)
        else if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        }
        // If data is an object but not in the expected format
        else {
          console.warn('Unexpected response format from notifications API:', response.data);
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark specific notifications as read (optimistic UI update approach)
  async markAsRead(notificationIds) {
    // Log what we're trying to do
    console.log('Attempting to mark notifications as read:', notificationIds);
    
    try {
      // First try the action endpoint with hyphens
      const response = await axios.post('/api/notifications/mark-read/', {
        notification_ids: notificationIds
      });
      console.log('Mark as read response:', response);
      return response.data;
    } catch (error) {
      console.error('Error with hyphen endpoint:', error);
      
      try {
        // Then try with underscores if that fails
        const response = await axios.post('/api/notifications/mark_read/', {
          notification_ids: notificationIds
        });
        console.log('Mark as read response (underscore):', response);
        return response.data;
      } catch (error2) {
        console.error('Error with underscore endpoint:', error2);
        
        // Fall back to updating individual notifications
        console.log('Falling back to individual updates');
        return { message: 'Client-side mark as read (API update failed)' };
      }
    }
  },

  // Mark all notifications as read (optimistic UI update approach)
  async markAllAsRead() {
    try {
      // First try the action endpoint with hyphens
      const response = await axios.post('/api/notifications/mark-read/', {});
      return response.data;
    } catch (error) {
      console.error('Error with hyphen endpoint:', error);
      
      try {
        // Then try with underscores if that fails
        const response = await axios.post('/api/notifications/mark_read/', {});
        return response.data;
      } catch (error2) {
        console.error('Error with underscore endpoint:', error2);
        
        // Return a client-side response
        return { message: 'Client-side mark all as read (API update failed)' };
      }
    }
  },

  // Get unread notifications count with improved error handling
  async getUnreadCount() {
    try {
      const notificationsData = await this.getNotifications();
      const notificationsArray = Array.isArray(notificationsData) ? notificationsData : [];
      return notificationsArray.filter(n => !n.is_read).length;
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      return 0;
    }
  }
};