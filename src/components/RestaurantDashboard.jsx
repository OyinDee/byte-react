import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { format, subDays, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { 
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TruckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/outline";
import LoadingPage from "./Loader";

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

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    topMeals: [],
    recentOrders: [],
    monthlyData: {
      labels: [],
      revenue: [],
      orders: []
    },
    dailyData: {
      labels: [],
      revenue: [],
      orders: []
    }
  });

  useEffect(() => {
    const fetchRestaurantAndOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token not found.");
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const restaurantCustomId = decodedToken.restaurant.customId;
        
        // Fetch restaurant data
        const restaurantResponse = await axios.get(
          `https://mongobyte.onrender.com/api/v1/restaurants/${restaurantCustomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRestaurant(restaurantResponse.data);
        
        // Fetch orders and stats
        await Promise.all([
          fetchOrders(restaurantCustomId, token),
          fetchDashboardStats(restaurantCustomId, token)
        ]);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error fetching restaurant data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndOrders();
  }, [dateRange]);

  const fetchDashboardStats = async (restaurantId, token) => {
    try {
      const response = await axios.get(
        `https://mongobyte.onrender.com/api/v1/restaurants/${restaurantId}/stats?range=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Generate mock data for demonstration
      generateMockStats();
    }
  };

  const generateMockStats = () => {
    const mockOrders = orders || [];
    const totalOrders = mockOrders.length;
    const totalRevenue = mockOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Generate mock monthly data
    const monthlyLabels = [];
    const monthlyRevenue = [];
    const monthlyOrders = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      monthlyLabels.push(format(date, 'MMM yyyy'));
      monthlyRevenue.push(Math.random() * 100000 + 50000);
      monthlyOrders.push(Math.floor(Math.random() * 100) + 20);
    }

    // Generate mock daily data for current month
    const dailyLabels = [];
    const dailyRevenue = [];
    const dailyOrders = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      dailyLabels.push(format(date, 'MMM dd'));
      dailyRevenue.push(Math.random() * 5000 + 1000);
      dailyOrders.push(Math.floor(Math.random() * 20) + 5);
    }

    setDashboardStats({
      totalOrders,
      totalRevenue,
      avgOrderValue,
      totalCustomers: Math.floor(totalOrders * 0.8),
      pendingOrders: mockOrders.filter(o => o.status === 'Pending').length,
      completedOrders: mockOrders.filter(o => o.status === 'Delivered').length,
      cancelledOrders: mockOrders.filter(o => o.status === 'Cancelled').length,
      orderGrowth: Math.random() * 20 - 10,
      revenueGrowth: Math.random() * 25 - 5,
      topMeals: [
        { name: "Jollof Rice", orders: 45, revenue: 67500 },
        { name: "Fried Rice", orders: 32, revenue: 48000 },
        { name: "Chicken & Chips", orders: 28, revenue: 42000 }
      ],
      recentOrders: mockOrders.slice(0, 5),
      monthlyData: {
        labels: monthlyLabels,
        revenue: monthlyRevenue,
        orders: monthlyOrders
      },
      dailyData: {
        labels: dailyLabels,
        revenue: dailyRevenue,
        orders: dailyOrders
      }
    });
  };

  const handleWithdrawal = async () => {
    toast.info("Processing withdrawal request...");
    if (!restaurant.walletBalance || parseFloat(restaurant.walletBalance) <= 0) {
      toast.error("Insufficient balance for withdrawal.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://mongobyte.onrender.com/api/v1/restaurants/withdraw",
        { 
          restaurantName: restaurant.name, 
          amount: parseFloat(restaurant.walletBalance) 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error processing withdrawal."
      );
    }
  };

  const fetchOrders = async (restaurantId, token) => {
    try {
      const response = await axios.get(
        `https://mongobyte.onrender.com/api/v1/orders/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (error) {
      toast.error("Error fetching orders.");
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const csvData = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} downloaded successfully!`);
  };

  const exportOrders = () => {
    const exportData = orders.map(order => ({
      'Order ID': order.customId,
      'Customer': order.user?.name || 'Unknown',
      'Phone': order.phoneNumber,
      'Location': order.location,
      'Status': order.status,
      'Total Amount': order.totalPrice,
      'Order Date': format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm'),
      'Meals': order.meals?.map(m => `${m.meal.name} (${m.quantity})`).join('; ') || ''
    }));
    
    exportToCSV(exportData, `orders_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportMonthlyReport = () => {
    const monthlyReport = dashboardStats.monthlyData.labels.map((label, index) => ({
      'Month': label,
      'Revenue': dashboardStats.monthlyData.revenue[index],
      'Orders': dashboardStats.monthlyData.orders[index],
      'Avg Order Value': dashboardStats.monthlyData.revenue[index] / dashboardStats.monthlyData.orders[index]
    }));
    
    exportToCSV(monthlyReport, `monthly_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportDailyReport = () => {
    const dailyReport = dashboardStats.dailyData.labels.map((label, index) => ({
      'Date': label,
      'Revenue': dashboardStats.dailyData.revenue[index],
      'Orders': dashboardStats.dailyData.orders[index],
      'Avg Order Value': dashboardStats.dailyData.revenue[index] / dashboardStats.dailyData.orders[index]
    }));
    
    exportToCSV(dailyReport, `daily_report_${format(selectedMonth, 'yyyy-MM')}.csv`);
  };

  const updateOrderStatus = async (orderId, requestDescription, fee) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.patch(
        `https://mongobyte.onrender.com/api/v1/orders/${orderId}`,
        { additionalFee: fee, requestDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      fetchOrders(restaurant.customId, token);
    } catch (error) {
      fetchOrders(restaurant.customId, token);
      toast.error(
        error.response?.data?.message || "Error updating order status."
      );
    }
  };

  const handleShowMore = () => {
    setVisibleOrdersCount((prevCount) => prevCount + 10);
  };

  const toggleActiveStatus = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `https://mongobyte.onrender.com/api/v1/restaurants/${restaurant.customId}/toggle-active`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRestaurant((prev) => ({ ...prev, isActive: !prev.isActive }));
      toast.success(`Restaurant is now ${!restaurant.isActive ? "active" : "inactive"}.`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error toggling status."
      );
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: "'Inter', sans-serif" }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: "'Inter', sans-serif", size: 14, weight: 600 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { family: "'Inter', sans-serif" } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Inter', sans-serif" } }
      }
    }
  };

  const revenueChartData = {
    labels: dateRange === 'month' ? dashboardStats.dailyData.labels : dashboardStats.monthlyData.labels,
    datasets: [
      {
        label: 'Revenue (₦)',
        data: dateRange === 'month' ? dashboardStats.dailyData.revenue : dashboardStats.monthlyData.revenue,
        borderColor: 'rgb(255, 204, 0)',
        backgroundColor: 'rgba(255, 204, 0, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const ordersChartData = {
    labels: dateRange === 'month' ? dashboardStats.dailyData.labels : dashboardStats.monthlyData.labels,
    datasets: [
      {
        label: 'Orders',
        data: dateRange === 'month' ? dashboardStats.dailyData.orders : dashboardStats.monthlyData.orders,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2
      }
    ]
  };

  const orderStatusData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [dashboardStats.completedOrders, dashboardStats.pendingOrders, dashboardStats.cancelledOrders],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }
    ]
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-12">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section with Restaurant Info */}
        {restaurant && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg mb-8"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="relative">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-20 h-20 object-cover rounded-xl border-3 border-cheese shadow-lg"
                  />
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white ${restaurant.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
                  <p className="text-gray-600 mt-1">{restaurant.description}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span>📍 {restaurant.location}</span>
                    <span>📞 {restaurant.contactNumber}</span>
                    <span>✉️ {restaurant.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <div className="text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${restaurant.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    {restaurant.isActive ? "Open" : "Closed"}
                  </span>
                </div>
                <button
                  onClick={toggleActiveStatus}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    restaurant.isActive 
                      ? "bg-red-500 hover:bg-red-600 text-white" 
                      : "bg-cheese hover:bg-yellow-500 text-crust"
                  }`}
                >
                  {restaurant.isActive ? "Close Restaurant" : "Open Restaurant"}
                </button>
              </div>
            </div>

            {/* Wallet Section */}
            <div className="bg-gradient-to-r from-cheese via-yellow-400 to-orange-400 p-6 rounded-xl text-crust">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Available Balance</h3>
                  <p className="text-3xl font-bold mt-2">
                    ₦{restaurant?.walletBalance?.toLocaleString() || "0.00"}
                  </p>
                </div>
                <div>
                  <BanknotesIcon className="h-12 w-12 opacity-80" />
                </div>
              </div>
              <button
                onClick={handleWithdrawal}
                className="bg-crust text-cheese px-6 py-2 rounded-lg font-medium mt-4 hover:bg-gray-800 transition-colors"
                disabled={!restaurant?.walletBalance || restaurant.walletBalance <= 0}
              >
                Request Withdrawal
              </button>
            </div>
          </motion.div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { id: 'orders', label: 'Orders', icon: ShoppingBagIcon },
            { id: 'reports', label: 'Reports', icon: PresentationChartLineIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-cheese text-crust shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-blue-100 p-3">
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  {dashboardStats.orderGrowth >= 0 ? (
                    <span className="text-green-600 text-sm flex items-center">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      {dashboardStats.orderGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm flex items-center">
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                      {Math.abs(dashboardStats.orderGrowth).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-green-100 p-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  {dashboardStats.revenueGrowth >= 0 ? (
                    <span className="text-green-600 text-sm flex items-center">
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                      {dashboardStats.revenueGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm flex items-center">
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                      {Math.abs(dashboardStats.revenueGrowth).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">₦{dashboardStats.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-purple-100 p-3">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">{dashboardStats.totalCustomers}</div>
                  <div className="text-sm text-gray-500">Total Customers</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-orange-100 p-3">
                    <ChartBarIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">₦{dashboardStats.avgOrderValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Avg Order Value</div>
                </div>
              </motion.div>
            </div>

            {/* Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-yellow-100 p-3 mr-4">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{dashboardStats.pendingOrders}</div>
                    <div className="text-sm text-gray-500">Pending Orders</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                >
                  View
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{dashboardStats.completedOrders}</div>
                    <div className="text-sm text-gray-500">Completed Orders</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  View
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">Export Data</div>
                    <div className="text-sm text-gray-500">Download reports</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Export
                </button>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                    <p className="text-sm text-gray-500">Revenue over time</p>
                  </div>
                  <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                    <button
                      onClick={() => setDateRange("week")}
                      className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                        dateRange === "week" 
                          ? "bg-cheese text-crust"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setDateRange("month")}
                      className={`px-3 py-1 text-sm font-medium rounded-r-lg ${
                        dateRange === "month" 
                          ? "bg-cheese text-crust"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </motion.div>

              {/* Orders Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Order Volume</h3>
                    <p className="text-sm text-gray-500">Number of orders</p>
                  </div>
                </div>
                <div className="h-64">
                  <Bar data={ordersChartData} options={chartOptions} />
                </div>
              </motion.div>
            </div>

            {/* Order Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status Distribution</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <Doughnut data={orderStatusData} options={{ ...chartOptions, cutout: '60%' }} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-medium">Completed</span>
                    </div>
                    <span className="text-lg font-bold">{dashboardStats.completedOrders}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="font-medium">Pending</span>
                    </div>
                    <span className="text-lg font-bold">{dashboardStats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="font-medium">Cancelled</span>
                    </div>
                    <span className="text-lg font-bold">{dashboardStats.cancelledOrders}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top Performing Meals */}
            {dashboardStats.topMeals && dashboardStats.topMeals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Meals</h3>
                <div className="space-y-4">
                  {dashboardStats.topMeals.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{meal.name}</h4>
                        <p className="text-sm text-gray-500">{meal.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₦{meal.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Order Status Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex flex-wrap gap-2">
                {['Pending', 'Confirmed', 'Delivered', 'Fee Requested'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveTab(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === status
                        ? 'bg-cheese text-crust'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status} ({orders.filter(order => order.status === status).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders
                .filter((order) => order.status === activeTab)
                .slice(0, visibleOrdersCount)
                .map((order) => (
                  <OrderCard
                    key={order.customId}
                    order={order}
                    isPending={order.status === "Pending"}
                    isConfirmed={order.status === "Confirmed"}
                    updateOrderStatus={updateOrderStatus}
                  />
                ))}

              {orders.filter((order) => order.status === activeTab).length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                  <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No {activeTab.toLowerCase()} orders found</p>
                </div>
              )}

              {orders.filter((order) => order.status === activeTab).length > visibleOrdersCount && (
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors"
                  onClick={handleShowMore}
                >
                  Show More Orders
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Export Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={exportOrders}
                  className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>Export All Orders</span>
                </button>
                
                <button
                  onClick={exportMonthlyReport}
                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>Monthly Report</span>
                </button>
                
                <button
                  onClick={exportDailyReport}
                  className="flex items-center justify-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>Daily Report</span>
                </button>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <Line data={revenueChartData} options={chartOptions} />
                  </div>
                  <div className="h-64">
                    <Bar data={ordersChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{dashboardStats.totalOrders}</div>
                    <div className="text-sm text-blue-500">Total Orders</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">₦{dashboardStats.totalRevenue.toLocaleString()}</div>
                    <div className="text-sm text-green-500">Total Revenue</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{dashboardStats.totalCustomers}</div>
                    <div className="text-sm text-purple-500">Unique Customers</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">₦{dashboardStats.avgOrderValue.toLocaleString()}</div>
                    <div className="text-sm text-orange-500">Avg Order Value</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Order Card Component
const OrderCard = ({ order, isPending, isConfirmed, updateOrderStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fees, setFees] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);

  const onRequest = async () => {
    if (isPending && fees) {
      setIsRequesting(true);
      await updateOrderStatus(order.customId, requestDescription, fees);
      setIsRequesting(false);
    }
  };

  const markAsDelivered = async () => {
    if (isConfirmed) {
      setIsDelivering(true);
      const token = localStorage.getItem("token");
      try {
        const response = await axios.patch(
          `https://mongobyte.onrender.com/api/v1/orders/deliver/${order.customId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(response.data.message);
        setIsDelivering(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error marking order as delivered."
        );
        setIsDelivering(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Fee Requested': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Order #{order.customId?.slice(-6)}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>📅 {format(new Date(order.createdAt), 'PPp')}</p>
              <p>📞 {order.phoneNumber}</p>
              <p>📍 {order.location}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">₦{order.totalPrice?.toFixed(2)}</div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-cheese hover:text-yellow-600 text-sm font-medium flex items-center space-x-1 mt-2"
            >
              <span>{isOpen ? 'Hide Details' : 'View Details'}</span>
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t pt-4 space-y-4"
          >
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Order Items:</h4>
              <div className="space-y-2">
                {order.meals?.map(({ meal, quantity }, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{meal.name}</span>
                      <span className="text-gray-500 ml-2">x{quantity}</span>
                    </div>
                    <span className="font-medium">₦{(meal.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.note && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Special Instructions:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{order.note}</p>
              </div>
            )}

            {order.nearestLandmark && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Nearest Landmark:</h4>
                <p className="text-gray-700">{order.nearestLandmark}</p>
              </div>
            )}

            {isPending && (
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Additional fee (optional)"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
                <textarea
                  placeholder="Request description (optional)"
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                  rows="3"
                />
                <button
                  onClick={onRequest}
                  disabled={isRequesting}
                  className="w-full bg-cheese hover:bg-yellow-500 text-crust py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isRequesting ? "Processing..." : "Confirm Order"}
                </button>
              </div>
            )}

            {isConfirmed && (
              <button
                onClick={markAsDelivered}
                disabled={isDelivering}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <TruckIcon className="h-5 w-5" />
                <span>{isDelivering ? "Processing..." : "Mark as Delivered"}</span>
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RestaurantDashboard;
