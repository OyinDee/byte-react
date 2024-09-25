import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [page, setPage] = useState(1);  
  const [hasMoreOrders, setHasMoreOrders] = useState(true);

  const ordersPerPage = 10;

  const fetchOrderHistory = async (isLoadMore = false) => {
    const token = localStorage.getItem('token');
    const byteUser = JSON.parse(localStorage.getItem('byteUser'));

    if (token && byteUser?.username) {
      try {
        const response = await axios.get(
          `https://mongobyte.vercel.app/api/v1/users/orders/${byteUser.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );


        const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const paginatedOrders = sortedOrders.slice(0, page * ordersPerPage);

        if (isLoadMore) {
          setOrders((prevOrders) => [...prevOrders, ...paginatedOrders.slice(prevOrders.length)]);
        } else {
          setOrders(paginatedOrders);
        }

        setHasMoreOrders(paginatedOrders.length < sortedOrders.length);
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

  useEffect(() => {
    fetchOrderHistory();
  }, [page]);

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
      fetchOrderHistory();

    } catch (error) {
      handleAxiosError(error, 'Failed to accept fee.');
      fetchOrderHistory();
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
      fetchOrderHistory();
    } catch (error) {
      handleAxiosError(error, 'Failed to cancel order.');
      fetchOrderHistory();
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

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
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
                    <p className="text-lg">Total: B{order.totalPrice}</p>
                    <p className="text-lg">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-lg">Status: {order.status}</p>
                  </div>
                  <div>
                    <button
                      className="text-black underline"
                      onClick={() => handleExpandClick(order._id)}
                    >
                      {expandedOrders[order._id] ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                </div>

                {expandedOrders[order._id] && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Meal Details</h3>
                    <ul className="list-disc pl-5">
                      {order.meals.map((mealDetail) => (
                        <li key={mealDetail.meal._id}>
                          <p>Meal: {mealDetail.meals.name}</p>
                          <p>Quantity: {mealDetail.quantity}</p>
                        </li>
                      ))}
                    </ul>

                    {order.status === "Fee Requested" && (
                      <div className="mt-4">
                        <button
                          className="bg-black w-full text-white px-4 py-2 rounded"
                          onClick={() => handleAcceptFee(order.customId)}
                        >
                          Accept Fee
                        </button>
                        <button
                          className="bg-yellow-500 w-full mt-2 text-white px-4 py-2 rounded"
                          onClick={() => handleCancelOrder(order.customId)}
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
        {hasMoreOrders && (
          <div className="flex justify-center mt-6">
            <button
              className="bg-black text-white px-6 py-2 rounded"
              onClick={handleLoadMore}
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
