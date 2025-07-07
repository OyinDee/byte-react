import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  TruckIcon, 
  ShoppingBagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import LoadingPage from "../../components/Loader";
import { toast } from "react-toastify";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0,
    others: 0,
    revenue: 0
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://mongobyte.vercel.app/api/v1/superadmin/orders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched orders:", response.data);

      // Sort orders by createdAt descending (most recent first)
      const sortedOrders = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Use restaurantName from order or user if available, else fetch by id
      const ordersWithRestaurant = await Promise.all(
        sortedOrders.map(async (order) => {
          // Prefer order.restaurantName, then order.user.restaurantName, then fetch by id
          let restaurantData = null;
          if (order.restaurantName) {
            restaurantData = { name: order.restaurantName };
          } else if (order.user && order.user.restaurantName) {
            restaurantData = { name: order.user.restaurantName };
          } else if (order.restaurant && typeof order.restaurant === 'string') {
            // If restaurantName is not available, do not fetch, just fallback to Unknown
            restaurantData = { name: 'Unknown' };
          } else if (order.restaurant && typeof order.restaurant === 'object' && order.restaurant.name) {
            restaurantData = order.restaurant;
          } else {
            restaurantData = { name: 'Unknown' };
          }
          return { ...order, restaurant: restaurantData };
        })
      );
      setOrders(ordersWithRestaurant);

      // Calculate stats (normalize status to lower case, treat 'canceled' and 'cancelled' as same)
      const stats = {
        total: ordersWithRestaurant.length,
        pending: ordersWithRestaurant.filter(o => (o.status || '').toLowerCase() === "pending").length,
        confirmed: ordersWithRestaurant.filter(o => (o.status || '').toLowerCase() === "confirmed").length,
        delivered: ordersWithRestaurant.filter(o => (o.status || '').toLowerCase() === "delivered").length,
        cancelled: ordersWithRestaurant.filter(o => {
          const s = (o.status || '').toLowerCase();
          return s === "cancelled" || s === "canceled";
        }).length,
        others: ordersWithRestaurant.filter(o => {
          const s = (o.status || '').toLowerCase();
          return !["pending","confirmed","delivered","cancelled","canceled"].includes(s);
        }).length,
        revenue: ordersWithRestaurant.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
      };

      setStats(stats);
      if (isRefreshing) {
        toast.success("Orders refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/superadmin/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, status } : order
      ));

      toast.success(`Order status updated to ${status}`);

      // Recalculate stats
      const updatedStats = {
        total: orders.length,
        pending: orders.filter(o => o._id === orderId ? status === "pending" : o.status === "pending").length,
        processing: orders.filter(o => o._id === orderId ? status === "processing" : o.status === "processing").length,
        delivered: orders.filter(o => o._id === orderId ? status === "delivered" : o.status === "delivered").length,
        cancelled: orders.filter(o => o._id === orderId ? status === "cancelled" : o.status === "cancelled").length,
        revenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      };

      setStats(updatedStats);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const filteredOrders = orders
    .filter(order => {
      if (filter === "all") return true;
      // Normalize status for filtering, treat 'cancelled' and 'canceled' as same
      const status = (order.status || '').toLowerCase();
      if (filter.toLowerCase() === 'cancelled') {
        return status === 'cancelled' || status === 'canceled';
      }
      return status === filter.toLowerCase();
    })
    .filter(order => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.user?.username?.toLowerCase().includes(searchLower) ||
        (order.restaurant?.name?.toLowerCase?.() || '').includes(searchLower) ||
        order.meals?.some(meal => meal.mealId?.toLowerCase().includes(searchLower))
      );
    });

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "confirmed":
        return <TruckIcon className="w-4 h-4" />;
      case "delivered":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "cancelled":
      case "canceled":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ShoppingBagIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor and manage all orders across the platform
            </p>
          </div>
          
          <button 
            onClick={() => {
              setIsRefreshing(true);
              toast.info("Refreshing orders...");
              fetchOrders();
            }}
            disabled={isRefreshing || loading}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-cheese hover:bg-yellow-500 text-crust py-2 px-4 rounded-lg transition-colors shadow-md disabled:opacity-70"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-cheese"
          >
            <div className="font-medium text-gray-500 text-sm">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400"
          >
            <div className="font-medium text-gray-500 text-sm">Pending</div>
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-400"
          >
            <div className="font-medium text-gray-500 text-sm">Confirmed</div>
            <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-400"
          >
            <div className="font-medium text-gray-500 text-sm">Delivered</div>
            <div className="text-2xl font-bold text-gray-900">{stats.delivered}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-400"
          >
            <div className="font-medium text-gray-500 text-sm">Canceled</div>
            <div className="text-2xl font-bold text-gray-900">{stats.cancelled}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-pepperoni"
          >
            <div className="font-medium text-gray-500 text-sm">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900">₦{stats.revenue.toLocaleString()}</div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <span className="text-gray-700 flex items-center">
              <FunnelIcon className="w-5 h-5 mr-1" /> Filter:
            </span>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "all"
                  ? "bg-cheese text-black font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "pending"
                  ? "bg-yellow-400 text-black font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("confirmed")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "confirmed"
                  ? "bg-blue-400 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "delivered"
                  ? "bg-green-400 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              className={`px-3 py-1 text-sm rounded-full ${
                filter === "cancelled"
                  ? "bg-red-400 text-white font-medium"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Cancelled
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cheese focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? "Try different search terms" : "No orders match the selected filter"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                {/* Order Header */}
                <div 
                  className="p-4 border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(order._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex flex-col mb-3 md:mb-0">
                      <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Order #{order.customId || order._id.slice(-6)}</span>
                        <span className={`px-2.5 py-0.5 text-xs rounded-full border flex items-center gap-1 ${getStatusBadgeClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Customer</span>
                        <span className="font-medium">{order.user?.username || "Unknown"}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Restaurant</span>
                        <span className="font-medium">{order.restaurant?.name || "Unknown"}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Amount</span>
                        <span className="font-medium">₦{order.totalPrice?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Details */}
                {expanded === order._id && (
                  <div className="p-4 bg-gray-50">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                      <div className="bg-white rounded-lg shadow-sm p-3">
                        <ul className="divide-y divide-gray-200">
                          {order.meals?.map((meal, index) => (
                            <li key={index} className="py-2 first:pt-0 last:pb-0">
                              <div className="flex justify-between">
                                <div>
                                  <span className="font-medium">{meal.name || (meal.meal && meal.meal.name) || meal.mealId || 'Meal'}</span>
                                  {meal.description && (
                                    <span className="ml-2 text-xs text-gray-500">({meal.description})</span>
                                  )}
                                  <span className="text-gray-500 ml-2">x{meal.quantity}</span>
                                </div>
                                {meal.price && (
                                  <div className="text-gray-700 font-medium">₦{meal.price.toLocaleString()}</div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                        <div className="bg-white rounded-lg shadow-sm p-3">
                          <p><span className="text-gray-500">Address:</span> {order.location || "Not specified"}</p>
                          <p><span className="text-gray-500">Landmark:</span> {order.nearestLandmark || "Not specified"}</p>
                          <p><span className="text-gray-500">Phone:</span> {order.phoneNumber || order.user?.phoneNumber || "Not specified"}</p>
                          <p><span className="text-gray-500">Notes:</span> {order.note || order.requestDescription || "None"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                        <div className="bg-white rounded-lg shadow-sm p-3">
                          <p><span className="text-gray-500">Method:</span> Byte Balance</p>
                          <p><span className="text-gray-500">Subtotal:</span> ₦{order.totalAmount?.toLocaleString() || 0}</p>
                          <p><span className="text-gray-500">Delivery Fee:</span> ₦{order.fee?.toLocaleString() || 0}</p>
                          <p className="font-medium"><span className="text-gray-500">Total:</span> ₦{order.totalAmount?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      {order.status !== "delivered" && order.status !== "cancelled" && (
                        <>
                          {order.status?.toLowerCase() === "pending" && (
                            <button
                              onClick={() => updateOrderStatus(order._id, "confirmed")}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
                            >
                              Mark as Confirmed
                            </button>
                          )}
                          
                          {order.status?.toLowerCase() === "confirmed" && (
                            <button
                              onClick={() => updateOrderStatus(order._id, "delivered")}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors"
                            >
                              Mark as Delivered
                            </button>
                          )}
                          
                          <button
                            onClick={() => updateOrderStatus(order._id, "cancelled")}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors"
                          >
                            Cancel Order
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
