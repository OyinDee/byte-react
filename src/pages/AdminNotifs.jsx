import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'https://mongobyte.vercel.app/api/v1/restaurants/notifications',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications(response.data);
      } catch (error) {
        setNotifications([]);
      }
    };
    fetchNotifications();
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
