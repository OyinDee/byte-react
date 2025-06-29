import { useState, useEffect } from "react";
import axios from "axios";
import { RingLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBell, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaClock,
  FaEnvelope
} from "react-icons/fa";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [visibleNotifications, setVisibleNotifications] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`https://mongobyte.onrender.com/api/v1/users/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const newNotifications = response.data.notifications;
      setNotifications(newNotifications.reverse()); 
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (message) => {
    if (message.toLowerCase().includes('order')) return <FaCheckCircle className="text-green-500" />;
    if (message.toLowerCase().includes('payment')) return <FaExclamationTriangle className="text-yellow-500" />;
    if (message.toLowerCase().includes('delivery')) return <FaInfoCircle className="text-blue-500" />;
    return <FaEnvelope className="text-gray-500" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-8 bg-white min-h-screen mb-20">
      <h1 className="text-3xl font-bold mb-8 text-black">Notifications</h1>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            {error}
          </div>
        )}

        {notifications.length > 0 ? (
          notifications.slice(0, visibleNotifications).map((notification) => (
            <div
              key={notification._id}
              className="bg-white border border-gray-200 p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <p className="text-lg font-semibold text-black">
                {notification.message}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          !loading && (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">No notifications available.</p>
            </div>
          )
        )}

        {loading && (
          <div className="flex justify-center mt-8">
            <RingLoader color="#ff860d" size={60} speedMultiplier={1.5} />
          </div>
        )}

        {visibleNotifications < notifications.length && !loading && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleShowMore}
              className="bg-black w-full text-white py-2 px-4 rounded-lg"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
