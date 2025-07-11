import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";
import LoadingPage from "./Loader";

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [additionalFee, setAdditionalFee] = useState('');
  const [feeDescription, setFeeDescription] = useState('');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');

  // Fetch orders from API
  const fetchOrders = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const decodedToken = jwtDecode(token);
      const restaurantCustomId = decodedToken.restaurant.customId;

      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/orders/restaurant/${restaurantCustomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      setOrders(response.data || []);
      
      if (showToast) {
        toast.success("Orders refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Confirm order with optional additional fee
  const confirmOrder = async (orderId, additionalFeeAmount = null, description = null) => {
    setIsConfirming(true);
    
    try {
      const token = localStorage.getItem("token");
      const requestBody = {};
      
      if (additionalFeeAmount && additionalFeeAmount > 0) {
        requestBody.additionalFee = parseFloat(additionalFeeAmount);
        if (description) {
          requestBody.requestDescription = description;
        }
      }

      const response = await axios.post(
        `https://mongobyte.vercel.app/api/v1/orders/${orderId}/confirm`,
        requestBody,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.customId === orderId 
            ? { ...order, status: response.data.order.status, totalPrice: response.data.order.totalPrice, fee: response.data.order.fee }
            : order
        )
      );

      if (response.data.order.status === 'Fee Requested') {
        toast.info("Fee request sent to customer for approval");
      } else {
        toast.success("Order confirmed successfully!");
      }

      setShowFeeModal(false);
      setAdditionalFee('');
      setFeeDescription('');
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error confirming order:", error);
      toast.error(error.response?.data?.message || "Failed to confirm order");
    } finally {
      setIsConfirming(false);
    }
  };

  // Mark order as delivered
  const markAsDelivered = async (orderId) => {
    setIsDelivering(true);
    
    try {
      await axios.patch(
        `https://mongobyte.vercel.app/api/v1/orders/deliver/${orderId}`
      );

      // Update order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.customId === orderId 
            ? { ...order, status: 'Delivered' }
            : order
        )
      );

      toast.success("Order marked as delivered!");
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toast.error(error.response?.data?.message || "Failed to mark order as delivered");
    } finally {
      setIsDelivering(false);
    }
  };

  // Handle confirm with fee
  const handleConfirmWithFee = (order) => {
    setSelectedOrder(order);
    setShowFeeModal(true);
  };

  // Format date display
  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd at HH:mm');
    }
  };

  // Get status color and icon
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <ClockIcon className="w-4 h-4" />,
          text: 'Pending'
        };
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <CheckCircleIcon className="w-4 h-4" />,
          text: 'Confirmed'
        };
      case 'fee requested':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <CurrencyDollarIcon className="w-4 h-4" />,
          text: 'Fee Requested'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <TruckIcon className="w-4 h-4" />,
          text: 'Delivered'
        };
      case 'canceled':
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircleIcon className="w-4 h-4" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <ClockIcon className="w-4 h-4" />,
          text: status || 'Unknown'
        };
    }
  };

  // Filter and sort orders based on status
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending') return order.status?.toLowerCase() === 'pending';
    if (orderFilter === 'confirmed') return order.status?.toLowerCase() === 'confirmed';
    if (orderFilter === 'fee-requested') return order.status?.toLowerCase() === 'fee requested';
    if (orderFilter === 'delivered') return order.status?.toLowerCase() === 'delivered';
    if (orderFilter === 'cancelled') return ['canceled', 'cancelled'].includes(order.status?.toLowerCase());
    return true;
  }).sort((a, b) => {
    // For pending orders, show oldest first (FIFO)
    // For all other statuses, show latest first
    if (orderFilter === 'pending') {
      return new Date(a.createdAt || a.orderDate) - new Date(b.createdAt || b.orderDate);
    }
    return new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate);
  });

  // Get filter counts
  const getFilterCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
      confirmed: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length,
      'fee-requested': orders.filter(o => o.status?.toLowerCase() === 'fee requested').length,
      delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
      cancelled: orders.filter(o => ['canceled', 'cancelled'].includes(o.status?.toLowerCase())).length
    };
  };

  useEffect(() => {
    fetchOrders();
    
    // Set up auto-refresh every 30 seconds for new orders
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) {
    return <LoadingPage />;
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage and track all your restaurant orders</p>
        </div>
        
        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-cheese hover:bg-yellow-500 text-crust px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Orders', count: filterCounts.all },
            { key: 'pending', label: 'Pending', count: filterCounts.pending },
            { key: 'confirmed', label: 'Confirmed', count: filterCounts.confirmed },
            { key: 'fee-requested', label: 'Fee Requested', count: filterCounts['fee-requested'] },
            { key: 'delivered', label: 'Delivered', count: filterCounts.delivered },
            { key: 'cancelled', label: 'Cancelled', count: filterCounts.cancelled }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setOrderFilter(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                orderFilter === filter.key
                  ? 'bg-cheese text-crust'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className="bg-white bg-opacity-30 px-2 py-0.5 rounded-full text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-md text-center">
          <SpeakerWaveIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter} orders`}
          </h3>
          <p className="text-gray-500">
            {orderFilter === 'all' 
              ? 'Orders will appear here when customers place them'
              : `Orders with ${orderFilter} status will appear here`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status);
              const foodAmount = order.foodAmount || (order.totalPrice - order.fee);
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div className="flex items-center gap-3 mb-2 md:mb-0">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order.customId}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatOrderDate(order.orderDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${statusDisplay.color}`}>
                          {statusDisplay.icon}
                          {statusDisplay.text}
                        </span>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Customer Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">
                            {order.recipient ? `@${order.recipient.username} (Gift from @${order.user?.username})` : `@${order.user?.username}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-gray-500" />
                          <span>{order.phoneNumber}</span>
                        </div>
                        <div className="flex items-start gap-2 md:col-span-2">
                          <MapPinIcon className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <span>{order.location}</span>
                            {order.nearestLandmark && (
                              <div className="text-gray-600 text-xs">
                                Landmark: {order.nearestLandmark}
                              </div>
                            )}
                          </div>
                        </div>
                        {order.note && (
                          <div className="md:col-span-2 mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                            <p className="text-sm text-yellow-800">
                              <strong>Note:</strong> {order.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.meals?.map((mealItem, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <span className="font-medium">{mealItem.meal?.name || 'Unknown Item'}</span>
                              <span className="text-gray-500 ml-2">x{mealItem.quantity}</span>
                            </div>
                            <span className="font-medium">
                              ₦{((mealItem.meal?.price || 0) * mealItem.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Value */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <BanknotesIcon className="w-4 h-4" />
                        Order Value
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Food Amount:</span>
                          <span className="font-bold text-green-600">₦{foodAmount.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          * Set your delivery fee and any other fee(takeaways and all that) when confirming the order
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {order.status?.toLowerCase() === 'pending' && (
                        <button
                          onClick={() => handleConfirmWithFee(order)}
                          disabled={isConfirming}
                          className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CurrencyDollarIcon className="w-4 h-4" />
                          {isConfirming ? 'Processing...' : 'Confirm with Delivery Fee'}
                        </button>
                      )}
                      
                      {order.status?.toLowerCase() === 'confirmed' && (
                        <button
                          onClick={() => markAsDelivered(order.customId)}
                          disabled={isDelivering}
                          className="flex-1 md:flex-none bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <TruckIcon className="w-4 h-4" />
                          {isDelivering ? 'Processing...' : 'Mark as Delivered'}
                        </button>
                      )}

                      {order.status?.toLowerCase() === 'fee requested' && (
                        <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-orange-800">
                            <ExclamationTriangleIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Waiting for customer to approve delivery fee request
                            </span>
                          </div>
                        </div>
                      )}

                      {order.status?.toLowerCase() === 'delivered' && (
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-800">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Order completed successfully!</span>
                          </div>
                        </div>
                      )}

                      {['canceled', 'cancelled'].includes(order.status?.toLowerCase()) && (
                        <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-red-800">
                            <XCircleIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Order was cancelled</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Fee Modal */}
      <AnimatePresence>
        {showFeeModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Request Delivery Fee
                </h3>
                <p className="text-gray-600 mb-4">
                  Set your delivery fee for this order
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Fee Amount (₦)
                    </label>
                    <input
                      type="number"
                      value={additionalFee}
                      onChange={(e) => setAdditionalFee(e.target.value)}
                      placeholder="Enter delivery fee amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={feeDescription}
                      onChange={(e) => setFeeDescription(e.target.value)}
                      placeholder="e.g., Long distance delivery, special handling required..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowFeeModal(false);
                      setAdditionalFee('');
                      setFeeDescription('');
                      setSelectedOrder(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmOrder(selectedOrder.customId, additionalFee, feeDescription)}
                    disabled={isConfirming || !additionalFee || parseFloat(additionalFee) <= 0}
                    className="flex-1 bg-cheese hover:bg-yellow-500 text-crust px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isConfirming ? 'Processing...' : 'Set Delivery Fee'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantOrders;
