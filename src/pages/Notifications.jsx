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

  const handleShowMore = () => {
    setVisibleNotifications((prev) => prev + 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-crust mb-2 flex items-center justify-center gap-3 font-secondary">
            <FaBell className="text-pepperoni" />
            Notifications
          </h1>
          <p className="text-gray-600 font-sans">Stay updated with your latest activities</p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 flex items-center gap-3"
          >
            <FaExclamationTriangle className="text-red-500" />
            <span className="font-sans">{error}</span>
          </motion.div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            <AnimatePresence>
              {notifications.slice(0, visibleNotifications).map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.message)}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-crust mb-2 font-sans leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaClock className="text-xs" />
                        <span className="font-sans">{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="mb-6">
                  <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-600 mb-2">No notifications yet</h2>
                  <p className="text-gray-500 font-sans">You'll see your notifications here when they arrive!</p>
                </div>
              </motion.div>
            )
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-12"
            >
              <div className="flex flex-col items-center">
                <RingLoader color="#DC2626" size={60} speedMultiplier={1.5} />
                <p className="mt-4 text-gray-600 font-sans">Loading notifications...</p>
              </div>
            </motion.div>
          )}

          {/* Load More Button */}
          {visibleNotifications < notifications.length && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowMore}
                className="bg-gradient-to-r from-pepperoni to-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <FaBell />
                Show More Notifications
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
