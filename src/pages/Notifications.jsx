import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../components/Loader"; 

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [page, setPage] = useState(1); 
  const [hasMore, setHasMore] = useState(true); 

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token"); 

      try {
        setLoading(true);
        const response = await axios.get(`https://mongobyte.onrender.com/api/v1/users/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log(response)
        
        if (response.data.notifications.length < 10) {
          setHasMore(false); 
        }

        setNotifications((prev) => [...prev, ...response.data.notifications]); 
        setLoading(false)
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page]); 
  const loadMoreNotifications = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black">Notifications</h1>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className="bg-white border border-black p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
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
          <p className="text-gray-500">No notifications available.</p>
        )}

        {loading && <Loader />} 

        {hasMore && !loading && (
          <button
            onClick={loadMoreNotifications}
            className="mt-4 px-4 py-2 bg-black text-white rounded w-full"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

export default Notifications;
