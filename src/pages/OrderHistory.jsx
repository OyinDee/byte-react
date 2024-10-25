import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [processingOrders, setProcessingOrders] = useState({});
  const [page, setPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);

  const ordersPerPage = 10;

  const fetchOrderHistory = async (isLoadMore = false) => {
    const token = localStorage.getItem('token');
    const byteUser = JSON.parse(localStorage.getItem('byteUser'));

    if (token && byteUser?.username) {
      try {
        const response = await axios.get(
          `https://mongobyte.onrender.com/api/v1/users/orders/${byteUser.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const paginatedOrders = sortedOrders.slice(0, page * ordersPerPage);
        console.log(sortedOrders);
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
    setProcessingOrders((prevState) => ({
      ...prevState,
      [orderId]: true,
    }));
    toast.info('Please wait while the fee is being accepted...');

    try {
      await axios.post(
        `https://mongobyte.onrender.com/api/v1/orders/${orderId}/status`,
        { action: 'accept' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Fee accepted successfully');
      fetchOrderHistory();
    } catch (error) {
      handleAxiosError(error, 'Failed to accept fee.');
    } finally {
      setProcessingOrders((prevState) => ({
        ...prevState,
        [orderId]: false,
      }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    setProcessingOrders((prevState) => ({
      ...prevState,
      [orderId]: true,
    }));
    toast.info('Please wait while the order is being canceled...');

    try {
      await axios.post(
        `https://mongobyte.onrender.com/api/v1/orders/${orderId}/status`,
        { action: 'cancel' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Order canceled successfully');
      fetchOrderHistory();
    } catch (error) {
      handleAxiosError(error, 'Failed to cancel order.');
    } finally {
      setProcessingOrders((prevState) => ({
        ...prevState,
        [orderId]: false,
      }));
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
    <div className="relative min-h-screen pt-5 pb-20 text-black bg-white">
      <div className="w-full max-w-4xl p-8 mx-auto bg-white border border-gray-200 rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-center text-black">Order History</h1>
        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id} className="p-4 bg-gray-100 border rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="mb-2 text-xl font-semibold">Order #{order.customId}</h2>
                    <p className="text-lg">Fee: ₦{(order.fee)}</p>
                    <p className="text-lg">Total: ₦{order.totalPrice}</p>
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
                    <h3 className="mb-2 text-lg font-semibold">Meal Details</h3>
                    <ul className="pl-5 list-disc">
                      {order.meals.map((mealDetail) => (
                        <li key={mealDetail.meal._id}>
                          <p>Meal: {mealDetail.meal.name}</p>
                          <p>Price: ₦{mealDetail.meal.price}</p>
                          <p>Quantity: {mealDetail.quantity}</p>
                        </li>
                      ))}
                    </ul>

                    {order.status === "Fee Requested" && (
                      <div className="mt-4">
                        <button
                          className="w-full px-4 py-2 text-white bg-black rounded"
                          onClick={() => handleAcceptFee(order.customId)}
                          disabled={processingOrders[order.customId]} 
                        >
                          Accept Fee
                        </button>
                        <button
                          className="w-full px-4 py-2 mt-2 text-white bg-cheese rounded"
                          onClick={() => handleCancelOrder(order.customId)}
                          disabled={processingOrders[order.customId]}
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
              className="px-6 py-2 text-white bg-black rounded"
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
