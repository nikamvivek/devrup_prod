import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { AuthContext } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, AlertCircle, Clock, Loader } from 'lucide-react';
import siteConfig from '../../config/siteConfig';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingIds, setProcessingIds] = useState([]);
  const [markingAll, setMarkingAll] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const t = siteConfig.theme;
  const tc = siteConfig.tailwindClasses;

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationService.getNotifications();

        let notificationsArray = [];
        if (Array.isArray(response)) {
          notificationsArray = response;
        } else if (response && typeof response === 'object') {
          if (response.results && Array.isArray(response.results)) {
            notificationsArray = response.results;
          } else {
            notificationsArray = [];
          }
        }

        setNotifications(notificationsArray);
        setError(null);
      } catch (err) {
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate]);

  const handleMarkAsRead = async (id) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      setNotifications(
        notifications.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      try {
        await notificationService.markAsRead([id]);
      } catch {
        // Skip revert for UX continuity
      }
    } catch (err) {
      
    } finally {
      setProcessingIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setNotifications(
        notifications.map(notification => ({ ...notification, is_read: true }))
      );
      try {
        await notificationService.markAllAsRead();
      } catch {
        // Skip revert for UX continuity
      }
    } catch (err) {
      
    } finally {
      setMarkingAll(false);
    }
  };

  const getTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  if (!user) {
    return null;
  }

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className={`min-h-screen bg-gradient-to-r ${t.background.gradient} py-10`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <Bell className={`${tc.primary.main} h-7 w-7`} />
              <h1 className={`text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${tc.primary.gradient}`}>
                Notifications
              </h1>
              {hasUnread && (
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-xs font-medium text-red-800">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </div>

            {notifications.length > 0 && hasUnread && (
              <button
                onClick={handleMarkAllAsRead}
                className={`${tc.button.primary} px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium flex items-center disabled:opacity-70`}
                disabled={markingAll}
              >
                {markingAll ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Mark all as read
                  </>
                )}
              </button>
            )}
          </div>

          {loading ? (
            <div className={`flex flex-col justify-center items-center h-64`}>
              <div className={`animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 ${tc.primary.main} mb-4`}></div>
              <p className={`${tc.primary.text} font-medium`}>Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">There was an error</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <Bell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                When you receive notifications about your orders, account, or other activities, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
                    notification.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {!notification.is_read && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
                        )}
                        <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      </div>
                      <p className="text-gray-600 mt-2">{notification.message}</p>
                      <div className="flex items-center mt-3 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {getTimeAgo(notification.created_at)}
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-2 px-3 py-1.5 text-xs bg-white border border-gray-300 hover:bg-gray-50 rounded-full text-gray-700 font-medium shadow-sm transition-all duration-200 flex items-center"
                        disabled={processingIds.includes(notification.id)}
                      >
                        {processingIds.includes(notification.id) ? (
                          <Loader className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
