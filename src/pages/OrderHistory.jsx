import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RingLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingPage from '../components/Loader';
import { 
  FaHistory, 
  FaReceipt, 
  FaCalendarAlt, 
  FaClock, 
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaTimes,
  FaShoppingBag,
  FaUtensils
} from 'react-icons/fa';
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
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

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
    return <LoadingPage />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Fee Requested': return 'text-orange-600 bg-orange-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
            <FaHistory className="text-pepperoni" />
            Order History
          </h1>
          <p className="text-gray-600 font-sans">Track all your delicious orders</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="mb-6">
              <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">No orders found</h2>
              <p className="text-gray-500">You haven't placed any orders yet!</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-pepperoni/10 p-3 rounded-full">
                          <FaReceipt className="text-pepperoni text-lg" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-crust">Order #{order.customId}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <FaCalendarAlt className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-600 font-sans">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FaMoneyBillWave className="text-green-600 text-sm" />
                          <span className="text-sm text-gray-600 font-sans">Total</span>
                        </div>
                        <span className="text-lg font-bold text-crust">₦{order.totalPrice}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <FaClock className="text-blue-600 text-sm" />
                          <span className="text-sm text-gray-600 font-sans">Fee</span>
                        </div>
                        <span className="text-lg font-bold text-crust">₦{order.fee}</span>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FaUtensils className="text-orange-600 text-sm" />
                          <span className="text-sm text-gray-600 font-sans">Items</span>
                        </div>
                        <span className="text-lg font-bold text-crust">{order.meals.length}</span>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExpandClick(order._id)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-crust transition-colors duration-200 border-t border-gray-200"
                    >
                      <span className="font-semibold">
                        {expandedOrders[order._id] ? 'Show Less' : 'Show Details'}
                      </span>
                      {expandedOrders[order._id] ? <FaChevronUp /> : <FaChevronDown />}
                    </motion.button>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedOrders[order._id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 bg-gray-50"
                      >
                        <div className="p-6 space-y-4">
                          <h4 className="font-bold text-crust mb-3 flex items-center gap-2">
                            <FaUtensils className="text-orange-600" />
                            Meal Details
                          </h4>
                          <div className="space-y-3">
                            {order.meals.map((mealDetail, index) => (
                              <div key={mealDetail.meal._id} className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-semibold text-crust">{mealDetail.meal.name}</h5>
                                    <p className="text-sm text-gray-600 mt-1">Quantity: {mealDetail.quantity}</p>
                                  </div>
                                  <span className="font-bold text-pepperoni">₦{mealDetail.meal.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          {order.status === "Fee Requested" && (
                            <div className="flex gap-3 pt-4">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAcceptFee(order.customId)}
                                disabled={processingOrders[order.customId]}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                              >
                                <FaCheck />
                                Accept Fee
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleCancelOrder(order.customId)}
                                disabled={processingOrders[order.customId]}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                              >
                                <FaTimes />
                                Cancel Order
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMoreOrders && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-pepperoni to-red-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Load More Orders
                </motion.button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
