import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const token = localStorage.getItem('token');
      const byteUser = JSON.parse(localStorage.getItem('byteUser'));

      if (token && byteUser?.username) {
        try {
          const response = await axios.get(
            `https://mongobyte.vercel.app/api/v1/users/orders/${byteUser.username}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setOrders(response.data);
        } catch (error) {
          handleAxiosError(error, 'Failed to load order history.');
        } finally {
          setLoading(false);
        }
      } else {
        toast.error('No user token found. Please log in.');
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const handleExpandClick = (orderId) => {
    setExpandedOrders((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
  };

  const handleAcceptFee = async (orderId) => {
    try {
      await axios.post(
        `https://mongobyte.vercel.app/api/v1/orders/${orderId}/status`,
        { action: 'accept' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Fee accepted successfully');
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'Confirmed' } : order
      ));
    } catch (error) {
      handleAxiosError(error, 'Failed to accept fee.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.post(
        `https://mongobyte.vercel.app/api/v1/orders/${orderId}/status`,
        { action: 'cancel' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Order canceled successfully');
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: 'Cancelled' } : order
      ));
    } catch (error) {
      handleAxiosError(error, 'Failed to cancel order.');
    }
  };

  const handleAxiosError = (error, defaultMessage) => {
    if (error.response) {
      console.error('Response error:', error.response);
      toast.error(error.response.data.message || defaultMessage);
    } else if (error.request) {
      console.error('Request error:', error.request);
      toast.error('No response received from the server.');
    } else {
      console.error('Error:', error.message);
      toast.error(defaultMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <RingLoader color="#FFD700" size={100} />
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
                    <p className="text-lg">Total: {order.totalPrice} NGN</p>
                    <p className="text-lg">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-lg">Status: {order.status}</p>
                  </div>
                  <div>
                    <button
                      className="text-blue-500 underline"
                      onClick={() => handleExpandClick(order._id)}
                    >
                      {expandedOrders[order._id] ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                </div>

                {expandedOrders[order._id] && (
                  <div className="mt-4">
                    <p>Phone Number: {order.phoneNumber}</p>
                    <p>Location: {order.location}</p>
                    <p>Note: {order.note || "No note"}</p>

                    {order.status === "Fee Requested" && (
                      <div className="flex space-x-4 mt-4">
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded"
                          onClick={() => handleAcceptFee(order._id)}
                        >
                          Accept Fee
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
