import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  checkNotificationPermission, 
  subscribeUserToPush, 
  unsubscribeFromPush 
} from '../utils/notificationUtil';
import { showNotification, NOTIFICATION_TYPES } from '../utils/notificationService';

// Create the context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkNotificationPermission();
      setIsPermissionGranted(hasPermission);
      
      if (hasPermission) {
        const sub = await subscribeUserToPush();
        setSubscription(sub);
      }
    };
    
    checkPermission();
  }, []);

  // Request permission from the user
  const requestPermission = async () => {
    const hasPermission = await checkNotificationPermission();
    setIsPermissionGranted(hasPermission);
    
    if (hasPermission) {
      const sub = await subscribeUserToPush();
      setSubscription(sub);
      return true;
    }
    
    return false;
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    const success = await unsubscribeFromPush();
    if (success) {
      setSubscription(null);
    }
    return success;
  };

  // Add a notification to the list
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };
    
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    setUnreadCount(prev => prev + 1);
    
    return newNotification.id;
  };

  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prevCount => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? prevCount - 1 : prevCount;
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Remove a notification
  const removeNotification = (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
    
    // Update unread count if needed
    if (notification && !notification.read) {
      setUnreadCount(prevCount => prevCount - 1);
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Show a notification with optional push notification
  const notify = async (title, message, type = NOTIFICATION_TYPES.ORDER_PLACED, options = {}) => {
    // Add to internal notifications list
    const notificationId = addNotification({
      title,
      message,
      type,
      ...options,
    });
    
    // Show visual notification
    await showNotification(title, message, type, options);
    
    return notificationId;
  };

  return (
    <NotificationContext.Provider
      value={{
        isPermissionGranted,
        subscription,
        notifications,
        unreadCount,
        requestPermission,
        unsubscribe,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        notify,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
