import React, { useState, useEffect } from 'react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const demoNotifications = [
      { id: 1, message: 'New order received', timestamp: '2024-09-11 10:34 AM' },
      { id: 2, message: '400 has been added to wallet', timestamp: '2024-09-11 09:25 AM' },
      { id: 3, message: 'New order received', timestamp: '2024-09-11 08:45 AM' },
    ];
    setNotifications(demoNotifications);
  }, []);

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black">Notifications</h1>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-gray-100 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <p className="text-lg font-semibold text-black">
                {notification.message}
              </p>
              <p className="text-sm text-gray-600">
                {notification.timestamp}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
