import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RingLoader } from 'react-spinners';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const token = localStorage.getItem("token");
      const byteUser = JSON.parse(localStorage.getItem("byteUser"));
      
      if (token && byteUser?.username) {
        try {
          const response = await axios.get(
            `https://mongobyte.onrender.com/api/v1/users/orders/${byteUser.username}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setOrders(response.data);
          console.log(response.data)
          setLoading(false);
        } catch (error) {
          console.error("Error fetching order history:", error);
          setError("Failed to load order history. Please try again later.");
          setLoading(false);
        }
      } else {
        setError("No user token found. Please log in.");
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <RingLoader color="#FFD700" size={100} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-black pt-5 pb-20">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-center text-black">Order History</h1>
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id} className="border p-4 rounded-lg bg-gray-100 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Order #{order.customId}</h2>
                    <p className="text-lg">Total: {order.totalAmount} {order.currency}</p>
                    <p className="text-lg">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`px-4 py-2 rounded-md text-white ${
                      order.status === "Completed" ? "bg-green-500" : "bg-yellow-500"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
