import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingPage from '../components/Loader';
import UserFeeApproval from '../components/UserFeeApproval';
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
  FaUtensils,
  FaSyncAlt
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

// Add custom animation class for slow spin
import './order-history.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [processingOrders, setProcessingOrders] = useState({});
  const [page, setPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFeeApprovalModal, setShowFeeApprovalModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ordersPerPage = 10;

  const fetchOrderHistory = async (isLoadMore = false) => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const currentPage = isLoadMore ? page : 1;
        const response = await axios.get(
          `https://mongobyte.vercel.app/api/v1/users/my-orders?page=${currentPage}&limit=${ordersPerPage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Handle the API response structure: { success: true, data: { orders: [...], pagination: {...} } }
        let newOrders = [];
        let paginationInfo = { currentPage: 1, totalPages: 1, totalItems: 0 };

        if (response.data && response.data.success && response.data.data) {
          // Expected structure: { success: true, data: { orders: [...], pagination: {...} } }
          const responseData = response.data.data;
          newOrders = responseData.orders || [];
          paginationInfo = responseData.pagination || paginationInfo;
        } 
        // Fallback for direct structure: { orders: [...], pagination: {...} }
        else if (response.data && response.data.orders) {
          newOrders = response.data.orders || [];
          paginationInfo = response.data.pagination || paginationInfo;
        }
        // Fallback: if response.data is directly an array of orders
        else if (Array.isArray(response.data)) {
          newOrders = response.data;
          paginationInfo = { 
            currentPage: 1, 
            totalPages: 1, 
            totalItems: response.data.length 
          };
        }
        
        if (isLoadMore) {
          setOrders((prevOrders) => [...prevOrders, ...newOrders]);
        } else {
          setOrders(newOrders);
        }

        // Safe pagination handling
        const hasMore = paginationInfo && 
                       paginationInfo.currentPage && 
                       paginationInfo.totalPages && 
                       paginationInfo.currentPage < paginationInfo.totalPages;
        setHasMoreOrders(hasMore);
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

  const handleAcceptFee = (order) => {
    setSelectedOrder(order);
    setShowFeeApprovalModal(true);
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.customId === updatedOrder.customId ? updatedOrder : order
      )
    );
    setSelectedOrder(null);
    setShowFeeApprovalModal(false);
  };

  const closeFeeApprovalModal = () => {
    setSelectedOrder(null);
    setShowFeeApprovalModal(false);
  };

  const handleCancelOrder = async (orderId) => {
    setProcessingOrders((prevState) => ({
      ...prevState,
      [orderId]: true,
    }));
    toast.info('Please wait while the order is being canceled...');

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 pt-16 md:pt-24 pb-24 md:pb-6">
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
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsRefreshing(true);
              const refreshToast = toast.loading("Refreshing orders...");
              fetchOrderHistory(false)
                .then(() => {
                  toast.dismiss(refreshToast);
                  toast.success("Orders refreshed successfully!");
                })
                .catch((error) => {
                  toast.dismiss(refreshToast);
                  toast.error("Failed to refresh orders. Please try again.");
                })
                .finally(() => {
                  setIsRefreshing(false);
                });
            }}
            disabled={isRefreshing}
            className="mt-4 flex items-center gap-2 bg-pepperoni text-white px-4 py-2 rounded-full mx-auto shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70"
          >
            <FaSyncAlt className={isRefreshing ? "refresh-spin" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Orders"}</span>
          </motion.button>
        </motion.div>

        {orders && orders.length === 0 ? (
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
              {orders && orders.map((order, index) => (
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
                      {order.status === "Fee Requested" ? (
                        <>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FaUtensils className="text-green-600 text-sm" />
                              <span className="text-sm text-gray-600 font-sans">Meal Total</span>
                            </div>
                            <span className="text-lg font-bold text-crust">₦{order.foodAmount || (order.totalPrice - order.fee)}</span>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FaClock className="text-blue-600 text-sm" />
                              <span className="text-sm text-gray-600 font-sans">Your Allocated Fee</span>
                            </div>
                            <span className="text-lg font-bold text-crust">₦{order.fee}</span>
                          </div>
                          <div className="bg-orange-50 rounded-xl p-3 col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FaMoneyBillWave className="text-orange-600 text-sm" />
                              <span className="text-sm text-gray-600 font-sans">Restaurant Requested</span>
                            </div>
                            <span className="text-lg font-bold text-crust">₦{order.requestedFee || 0}</span>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FaUtensils className="text-orange-600 text-sm" />
                              <span className="text-sm text-gray-600 font-sans">Items</span>
                            </div>
                            <span className="text-lg font-bold text-crust">{order.meals ? order.meals.length : 0}</span>
                          </div>
                        </>
                      ) : (
                        <>
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
                            <span className="text-lg font-bold text-crust">{order.meals ? order.meals.length : 0}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Fee Request Description */}
                    {order.status === "Fee Requested" && order.requestDescription && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <FaMoneyBillWave className="text-yellow-600 text-sm mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 mb-1">Why this fee was requested:</h4>
                            <p className="text-sm text-yellow-700">{order.requestDescription}</p>
                          </div>
                        </div>
                      </div>
                    )}

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
                            {order.meals && order.meals.map((mealDetail, index) => (
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
                                onClick={() => handleAcceptFee(order)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <FaCheck />
                                Review Fee Request
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

      {/* Fee Approval Modal */}
      {showFeeApprovalModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <UserFeeApproval
              order={selectedOrder}
              onOrderUpdate={handleOrderUpdate}
              onClose={closeFeeApprovalModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
