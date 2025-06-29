import { toast } from 'react-toastify';
import { showLocalNotification } from './notificationUtil';

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED', 
  ORDER_READY: 'ORDER_READY',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  SPECIAL_OFFER: 'SPECIAL_OFFER',
  DELIVERY_UPDATE: 'DELIVERY_UPDATE',
};

// Notification icons mapping
const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.ORDER_PLACED]: '/icons/pizza.png',
  [NOTIFICATION_TYPES.ORDER_CONFIRMED]: '/icons/pizza.png',
  [NOTIFICATION_TYPES.ORDER_READY]: '/icons/pizza.png',
  [NOTIFICATION_TYPES.ORDER_DELIVERED]: '/icons/pizza.png',
  [NOTIFICATION_TYPES.PAYMENT_RECEIVED]: '/icons/pizza.png',
  [NOTIFICATION_TYPES.SPECIAL_OFFER]: '/icons/pizza.png',
  [NOTIFICATION_TYPES.DELIVERY_UPDATE]: '/icons/pizza.png',
};

/**
 * Show a notification both as toast and push notification if possible
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type from NOTIFICATION_TYPES
 * @param {object} options - Additional options for the notification
 */
export const showNotification = async (title, message, type, options = {}) => {
  // Show toast notification in-app
  toast[options.toastType || 'info'](`${title}: ${message}`, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  // If the user has granted notification permission, show a push notification
  if (Notification.permission === 'granted') {
    try {
      // Try to use the service worker to show a notification
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(title, {
        body: message,
        icon: NOTIFICATION_ICONS[type] || '/pizza.png',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          url: options.url || '/',
          type: type,
          ...options.data
        },
        actions: options.actions || [
          {
            action: 'view',
            title: 'View Details',
          },
          {
            action: 'close',
            title: 'Close',
          },
        ]
      });
    } catch (error) {
      // Fallback to local notification if service worker is not available
      showLocalNotification(title, {
        body: message,
        icon: NOTIFICATION_ICONS[type] || '/pizza.png'
      });
      
      console.error('Error showing push notification:', error);
    }
  }
};

/**
 * Show an order status notification
 * @param {object} order - Order object with id, status, and other details
 */
export const showOrderStatusNotification = (order) => {
  let title, message, type, options;
  
  switch (order.status) {
    case 'placed':
      title = 'Order Placed';
      message = `Your order #${order.id} has been successfully placed!`;
      type = NOTIFICATION_TYPES.ORDER_PLACED;
      options = {
        toastType: 'success',
        url: `/user/order/${order.id}`,
        data: { orderId: order.id }
      };
      break;
      
    case 'confirmed':
      title = 'Order Confirmed';
      message = `Restaurant has confirmed your order #${order.id}. It's being prepared now!`;
      type = NOTIFICATION_TYPES.ORDER_CONFIRMED;
      options = {
        toastType: 'success',
        url: `/user/order/${order.id}`,
        data: { orderId: order.id }
      };
      break;
      
    case 'ready':
      title = 'Order Ready';
      message = `Your order #${order.id} is ready! It will be on its way soon.`;
      type = NOTIFICATION_TYPES.ORDER_READY;
      options = {
        toastType: 'info',
        url: `/user/order/${order.id}`,
        data: { orderId: order.id }
      };
      break;
      
    case 'delivering':
      title = 'Order Out for Delivery';
      message = `Your order #${order.id} is on its way to you!`;
      type = NOTIFICATION_TYPES.DELIVERY_UPDATE;
      options = {
        toastType: 'info',
        url: `/user/order/${order.id}`,
        data: { orderId: order.id }
      };
      break;
      
    case 'delivered':
      title = 'Order Delivered';
      message = `Your order #${order.id} has been delivered. Enjoy your meal!`;
      type = NOTIFICATION_TYPES.ORDER_DELIVERED;
      options = {
        toastType: 'success',
        url: `/user/order/${order.id}`,
        data: { orderId: order.id }
      };
      break;
      
    default:
      title = 'Order Update';
      message = `Your order #${order.id} status has been updated to ${order.status}.`;
      type = NOTIFICATION_TYPES.DELIVERY_UPDATE;
      options = {
        toastType: 'info',
        url: `/user/order/${order.id}`,
        data: { orderId: order.id }
      };
  }
  
  showNotification(title, message, type, options);
};

/**
 * Show a special offer notification
 * @param {object} offer - Offer details
 */
export const showSpecialOfferNotification = (offer) => {
  const title = 'Special Offer';
  const message = offer.description || 'Check out this special offer just for you!';
  
  showNotification(title, message, NOTIFICATION_TYPES.SPECIAL_OFFER, {
    toastType: 'success',
    url: offer.url || '/user',
    data: { offerId: offer.id },
    actions: [
      {
        action: 'view',
        title: 'See Offer',
      },
      {
        action: 'close',
        title: 'Not Now',
      },
    ]
  });
};
