import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { RingLoader } from "react-spinners";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true); 

  const fetchNotifications = useCallback(async (isInitialLoad = false) => {
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`https://mongobyte.onrender.com/api/v1/users/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { page } 
      });


      const newNotifications = response.data.notifications;
      if (newNotifications.length < 10) setHasMore(false);

      setNotifications((prev) => 
        isInitialLoad ? [...newNotifications] : [...prev, ...newNotifications]
      ); 
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]); 

  useEffect(() => {
    if (page > 1) {

      fetchNotifications();
    }
  }, [page, fetchNotifications]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1 &&
      hasMore
    ) {
      setPage((prevPage) => prevPage + 1); 
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

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
          notifications.map((notification) => (
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
      </div>
    </div>
  );
};

export default Notifications;
