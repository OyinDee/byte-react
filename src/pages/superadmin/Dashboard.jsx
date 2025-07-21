import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  UsersIcon, 
  BuildingStorefrontIcon, 
  ShoppingBagIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  TruckIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import LoadingPage from "../../components/Loader";
import { toast } from "react-toastify";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalRestaurants: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      pendingWithdrawals: 0,
      activeRestaurants: 0,
      orderGrowth: 0,
      userGrowth: 0,
      revenueGrowth: 0
    },
    recentOrders: [],
    recentUsers: [],
    topRestaurants: [],
    pendingWithdrawals: [],
    chartData: {
      sales: {
        labels: [],
        datasets: []
      },
      orders: {
        labels: [],
        datasets: []
      },
      users: {
        labels: [],
        datasets: []
      },
      restaurantPerformance: {
        labels: [],
        datasets: []
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");
  const [refreshKey, setRefreshKey] = useState(0);
  const [universities, setUniversities] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [editLandmarksId, setEditLandmarksId] = useState(null);
  const [landmarksInput, setLandmarksInput] = useState("");
  const [isUpdatingLandmarks, setIsUpdatingLandmarks] = useState(false);
  const [universitiesList, setUniversitiesList] = useState([]);
  const [editUniLandmarksId, setEditUniLandmarksId] = useState(null);
  const [uniLandmarksInput, setUniLandmarksInput] = useState("");
  const [isUpdatingUniLandmarks, setIsUpdatingUniLandmarks] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/superadmin/dashboard?range=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch top customers
  const fetchTopCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://mongobyte.vercel.app/api/v1/superadmin/top-customers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopCustomers(response.data.customers || []);
    } catch (error) {
      console.error("Error fetching top customers:", error);
    }
  }, []);

  // Fetch all universities for management section
  const fetchUniversitiesList = useCallback(async () => {
    try {
      const response = await axios.get("https://mongobyte.vercel.app/api/v1/universities");
      setUniversitiesList(response.data.data || []);
    } catch (error) {
      setUniversitiesList([]);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchUniversities();
    fetchTopCustomers();
    fetchUniversitiesList();
  }, [dateRange, refreshKey, fetchDashboardData]);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get("https://mongobyte.vercel.app/api/v1/universities");
      setUniversities(response.data.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Update nearest landmarks
  const handleEditLandmarks = (restaurant) => {
    setEditLandmarksId(restaurant._id);
    setLandmarksInput((restaurant.nearestLandmarks || []).join(", "));
  };

  const handleCancelEditLandmarks = () => {
    setEditLandmarksId(null);
    setLandmarksInput("");
  };

  const handleSaveLandmarks = async (restaurantId) => {
    setIsUpdatingLandmarks(true);
    try {
      const token = localStorage.getItem("token");
      const landmarksArr = landmarksInput.split(",").map(l => l.trim()).filter(Boolean);
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/superadmin/restaurants/${restaurantId}/nearest-landmarks`,
        { nearestLandmarks: landmarksArr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Landmarks updated!");
      setEditLandmarksId(null);
      setLandmarksInput("");
      fetchDashboardData();
    } catch (error) {
      toast.error("Failed to update landmarks");
    } finally {
      setIsUpdatingLandmarks(false);
    }
  };

  // University landmark editing
  const handleEditUniLandmarks = async (uni) => {
    setEditUniLandmarksId(uni._id);
    setUniLandmarksInput('');
    try {
      const response = await axios.get(`https://mongobyte.vercel.app/api/v1/universities/${uni._id}/landmarks`);
      const fetchedLandmarks = response.data.landmarks || [];
      setUniLandmarksInput(fetchedLandmarks.join(", "));
    } catch (error) {
      setUniLandmarksInput('');
    }
  };
  const handleSaveUniLandmarks = async (universityId) => {
    setIsUpdatingUniLandmarks(true);
    try {
      const token = localStorage.getItem("token");
      const landmarksArr = uniLandmarksInput.split(",").map(l => l.trim()).filter(Boolean);
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/superadmin/universities/${universityId}/nearest-landmarks`,
        { nearestLandmarks: landmarksArr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Landmarks updated!");
      setEditUniLandmarksId(null);
      setUniLandmarksInput("");
      fetchUniversitiesList();
    } catch (error) {
      toast.error("Failed to update landmarks");
    } finally {
      setIsUpdatingUniLandmarks(false);
    }
  };
  const handleCancelEditUniLandmarks = () => {
    setEditUniLandmarksId(null);
    setUniLandmarksInput("");
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of platform metrics and activity
            </p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setDateRange("week")}
                className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                  dateRange === "week" 
                    ? "bg-cheese text-crust"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setDateRange("month")}
                className={`px-3 py-2 text-sm font-medium ${
                  dateRange === "month" 
                    ? "bg-cheese text-crust"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setDateRange("year")}
                className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                  dateRange === "year" 
                    ? "bg-cheese text-crust"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Year
              </button>
            </div>
            
            <button 
              onClick={handleRefresh} 
              className="flex items-center gap-2 bg-cheese hover:bg-yellow-500 text-crust py-2 px-4 rounded-lg transition-colors shadow-md"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Key Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-blue-100 p-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              {dashboardData.stats.userGrowth >= 0 ? (
                <span className="text-green-600 text-sm flex items-center">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {dashboardData.stats.userGrowth}%
                </span>
              ) : (
                <span className="text-red-600 text-sm flex items-center">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(dashboardData.stats.userGrowth)}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-orange-100 p-3">
                <BuildingStorefrontIcon className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {dashboardData.stats.activeRestaurants}/{dashboardData.stats.totalRestaurants} active
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalRestaurants}</div>
              <div className="text-sm text-gray-500">Restaurants</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-green-100 p-3">
                <ShoppingBagIcon className="h-6 w-6 text-green-600" />
              </div>
              {dashboardData.stats.orderGrowth >= 0 ? (
                <span className="text-green-600 text-sm flex items-center">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {dashboardData.stats.orderGrowth}%
                </span>
              ) : (
                <span className="text-red-600 text-sm flex items-center">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(dashboardData.stats.orderGrowth)}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalOrders}</div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-pepperoni/20 p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-pepperoni" />
              </div>
              {dashboardData.stats.revenueGrowth >= 0 ? (
                <span className="text-green-600 text-sm flex items-center">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  {dashboardData.stats.revenueGrowth}%
                </span>
              ) : (
                <span className="text-red-600 text-sm flex items-center">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(dashboardData.stats.revenueGrowth)}%
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">₦{dashboardData.stats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Revenue</div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Stats (Action Items) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{dashboardData.stats.pendingOrders}</div>
                <div className="text-sm text-gray-500">Pending Orders</div>
              </div>
            </div>
            <Link 
              to="/superadmin/orders" 
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
            >
              View
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{dashboardData.stats.pendingWithdrawals}</div>
                <div className="text-sm text-gray-500">Pending Withdrawals</div>
              </div>
            </div>
            <Link 
              to="/superadmin/withdrawals" 
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              View
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
          >
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <PlusCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">Add Restaurant</div>
                <div className="text-sm text-gray-500">Register new vendor</div>
              </div>
            </div>
            <Link 
              to="/restaurant/signup" 
              className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              Add
            </Link>
          </motion.div>
        </div>


        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <Link 
                to="/superadmin/orders" 
                className="text-sm text-cheese hover:underline font-medium"
              >
                View All
              </Link>
            </div>
            
            {dashboardData.recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent orders found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData.recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">#{order._id.slice(-6)}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{order.user?.username || "Unknown"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{order.restaurant?.name || "Unknown"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₦{order.totalPrice?.toLocaleString()}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {(() => {
                            const status = (order.status || '').toLowerCase();
                            if (status === "delivered") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircleIcon className="mr-1 h-3 w-3" />
                                  Delivered
                                </span>
                              );
                            }
                            if (status === "pending") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <ClockIcon className="mr-1 h-3 w-3" />
                                  Pending
                                </span>
                              );
                            }
                            if (status === "confirmed") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <TruckIcon className="mr-1 h-3 w-3" />
                                  Confirmed
                                </span>
                              );
                            }
                            if (status === "cancelled" || status === "canceled") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <XCircleIcon className="mr-1 h-3 w-3" />
                                  Cancelled
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <ShoppingBagIcon className="mr-1 h-3 w-3" />
                                {order.status}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
          
          {/* Top Restaurants Table (with Landmarks Edit) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="bg-white p-6 rounded-xl shadow-md mt-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Restaurants</h3>
              <Link 
                to="/superadmin/restaurants" 
                className="text-sm text-cheese hover:underline font-medium"
              >
                View All
              </Link>
            </div>
            {dashboardData.topRestaurants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No restaurant data available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dashboardData.topRestaurants.map((restaurant) => (
                      <tr key={restaurant._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                              {restaurant.imageUrl ? (
                                <img src={restaurant.imageUrl} alt="" className="h-8 w-8 object-cover" />
                              ) : (
                                <div className="h-8 w-8 flex items-center justify-center bg-gray-200">
                                  <BuildingStorefrontIcon className="h-4 w-4 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {universities.find(u => u._id === restaurant.university)?.name || "No university"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{restaurant.orderCount || 0}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₦{restaurant.revenue?.toLocaleString() || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Customers Table */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.0 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Customers</h3>
            </div>
            {topCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No top customers found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {topCustomers.map((customer) => (
                      <tr key={customer.userId} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{customer.username}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₦{customer.totalSpent?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* Universities Management Section */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.1 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Universities</h3>
            </div>
            {universitiesList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No universities found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Landmarks</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {universitiesList.map((uni) => (
                      <tr key={uni._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{uni.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{uni.state}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {uni.isActive ? (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium">Inactive</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                          {editUniLandmarksId === uni._id ? (
                            <>
                              <input
                                type="text"
                                value={uniLandmarksInput}
                                onChange={e => setUniLandmarksInput(e.target.value)}
                                className="w-48 px-2 py-1 border border-orange-200 rounded-lg text-sm"
                                placeholder="Comma separated..."
                                disabled={isUpdatingUniLandmarks}
                              />
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleSaveUniLandmarks(uni._id)}
                                  className="px-3 py-1 bg-pepperoni text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                                  disabled={isUpdatingUniLandmarks}
                                >
                                  {isUpdatingUniLandmarks ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={handleCancelEditUniLandmarks}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                  disabled={isUpdatingUniLandmarks}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEditUniLandmarks(uni)}
                              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors"
                            >
                              View Landmarks
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {editUniLandmarksId === uni._id ? (
                            <div className="flex gap-2">
                              <button
                                // onClick={() => handleSaveUniLandmarks(uni._id)}
                                className="px-3 py-1 bg-pepperoni text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                                disabled={isUpdatingUniLandmarks}
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEditUniLandmarks}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                disabled={isUpdatingUniLandmarks}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditUniLandmarks(uni)}
                              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors"
                            >
                              Edit Landmarks
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
        {/* More admin features will be added below */}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
