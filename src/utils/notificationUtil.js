// Utility functions for managing push notifications

// Function to check if Push notification is supported and permission is granted
export const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {

    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Subscribe user to push notifications
export const subscribeUserToPush = async () => {
  try {
    const hasPermission = await checkNotificationPermission();
    
    if (!hasPermission) {
      return null;
    }
    
    const registration = await navigator.serviceWorker.ready;
    
    // Check if there's an existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return subscription;
    }
    
    // Create a new subscription
    // In a real application, you'd get this key from your server
    const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
    
    // In a real application, you would send the subscription to your server

    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPush = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      
      // In a real application, you would inform your server
      // await removeSubscriptionFromServer(subscription);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
};

// Helper function to convert base64 string to Uint8Array
// (Required for applicationServerKey)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Function to display a local notification (for testing)
export const showLocalNotification = async (title, options) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, options);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Function to request background sync
export const requestBackgroundSync = async (tag = 'sync-orders') => {
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await registration.sync.register(tag);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error registering background sync:', error);
    return false;
  }
};
