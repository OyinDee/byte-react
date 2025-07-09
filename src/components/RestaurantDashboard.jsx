import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import LoadingPage from "./Loader";

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RestaurantDashboard = () => {
  // Core Restaurant Data
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingsBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    categoryAverages: {
      foodQuality: 0,
      deliverySpeed: 0,
      customerService: 0,
      valueForMoney: 0,
      packaging: 0
    }
  });

  // Orders and Ratings Management
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI State Management
  const [dateRangeLabel, setDateRangeLabel] = useState('This Week');
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  
  // Financial Data
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  
  // Date Range Management
  // Financial Management
  const [dateRange, setDateRange] = useState("week");
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
  
  // Date range options for reports and dashboard
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' }
  ];

  // Update the fetchDashboardStats with date range support
  const calculateDateRange = useCallback(() => {
    const today = new Date();
    let startDate, endDate;
    
    switch(dateRange) {
      case 'today':
        startDate = format(today, 'yyyy-MM-dd');
        endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        startDate = format(yesterday, 'yyyy-MM-dd');
        endDate = format(yesterday, 'yyyy-MM-dd');
        break;
      case 'week':
        // Get the start of current week (Sunday) and end of week (Saturday)
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
        startDate = format(weekStart, 'yyyy-MM-dd');
        endDate = format(weekEnd, 'yyyy-MM-dd');
        break;
      case 'month':
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        startDate = format(monthStart, 'yyyy-MM-dd');
        endDate = format(monthEnd, 'yyyy-MM-dd');
        break;
      case 'all':
        // Set a past date that predates the restaurant's creation
        startDate = '2020-01-01';
        endDate = format(today, 'yyyy-MM-dd');
        break;
      default:
        const defaultWeekStart = startOfWeek(today, { weekStartsOn: 0 });
        const defaultWeekEnd = endOfWeek(today, { weekStartsOn: 0 });
        startDate = format(defaultWeekStart, 'yyyy-MM-dd');
        endDate = format(defaultWeekEnd, 'yyyy-MM-dd');
    }
    
    return { startDate, endDate };
  }, [dateRange]);


  const fetchDashboardStats = useCallback(async (customId, token) => {
    setIsLoadingRevenue(true);
    try {
      const { startDate, endDate } = calculateDateRange();
      
      // Check cache for "All Time" view
      if (dateRange === 'all') {
        const cachedStats = localStorage.getItem('dashboardStats');
        if (cachedStats) {
          const stats = JSON.parse(cachedStats);
          // Use cache if it's less than 1 hour old
          if (Date.now() - stats.timestamp < 3600000) {
            setDashboardStats(prev => ({
              ...prev,
              totalRevenue: stats.totalRevenue,
              totalOrders: stats.totalOrders,
              avgOrderValue: stats.avgOrderValue
            }));
            setIsLoadingRevenue(false);
            return;
          }
        }
      }
      
      // Add pagination and sorting for large datasets
      const response = await axios.get(
`https://mongobyte.vercel.app/api/v1/restaurants/${customId}/revenue`,
        {
          params: { 
            startDate, 
            endDate,
            type: 'day',
            cursor: startDate,
            limit: 20,
            sortOrder: 'desc'
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Transform the revenue data into dashboard stats format
      const revenueData = response.data;
      
      // Process revenue data from API response
      const totalRevenue = revenueData.totalRevenue || 0;
      
      // Calculate total orders from breakdown data
      const processedData = revenueData.breakdown?.byDay || [];
      const totalOrders = processedData.reduce((total, dayData) => {
        return total + (dayData.orders?.length || 0);
      }, 0);
      
      console.log('Revenue Data:', {
        totalRevenue,
        totalOrders,
        processedDataLength: processedData.length,
        processedData: processedData.map(day => ({
          date: day.date,
          ordersCount: day.orders?.length || 0
        }))
      });
      
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Cache the results for better performance and store additional metadata
      if (dateRange === 'all') {
        localStorage.setItem('dashboardStats', JSON.stringify({
          totalOrders,
          totalRevenue,
          avgOrderValue,
          timestamp: Date.now(),
          lastUpdated: new Date().toISOString()
        }));
      }
      
      setDashboardStats(prev => ({
        ...prev,
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        avgOrderValue: avgOrderValue,
        monthlyData: {
          labels: processedData.map(item => format(new Date(item.date), 'MMMM yyyy')),
          revenue: processedData.map(item => item.revenue || 0),
          orders: processedData.map(item => item.orders?.length || 0)
        },
        dailyData: {
          labels: processedData.map(item => format(new Date(item.date), 'MMM dd')),
          revenue: processedData.map(item => item.revenue || 0),
          orders: processedData.map(item => item.orders?.length || 0)
        }
      }));
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to fetch dashboard statistics");
    } finally {
      setIsLoadingRevenue(false);
    }
  }, [calculateDateRange, dateRange]);

  const fetchOrders = useCallback(async (restaurantId, token) => {
    try {
      await axios.get(
        `https://mongobyte.vercel.app/api/v1/orders/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 8000 // Add timeout to the axios request to prevent hanging
        }
      );
      
      if (isRefreshing) {
        toast.success("Orders refreshed successfully!");
        setIsRefreshing(false);
      }
    } catch (error) {
      toast.error(error.message || "Error fetching orders.");
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const fetchRatings = useCallback(async (restaurantId, token) => {
    try {
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/ratings/restaurant/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const ratingsData = response.data.ratings || [];
      
      // Update rating stats
      if (ratingsData.length > 0) {
        const avgRating = ratingsData.reduce((sum, rating) => sum + rating.overall, 0) / ratingsData.length;
        setRatingStats(prev => ({
          ...prev,
          averageRating: avgRating,
          totalRatings: ratingsData.length
        }));
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  }, []);

  useEffect(() => {
    const fetchRestaurantAndData = async () => {
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
          `https://mongobyte.vercel.app/api/v1/restaurants/${restaurantCustomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRestaurant(restaurantResponse.data);
        
        // Update date range label
        switch(dateRange) {
          case 'today': setDateRangeLabel('Today'); break;
          case 'yesterday': setDateRangeLabel('Yesterday'); break;
          case 'week': setDateRangeLabel('This Week'); break;
          case 'month': setDateRangeLabel('This Month'); break;
          case 'all': setDateRangeLabel('All Time'); break;
          default: setDateRangeLabel('This Week');
        }
        
        // Fetch all data in parallel
        await Promise.all([
          fetchOrders(restaurantCustomId, token),
          fetchDashboardStats(restaurantCustomId, token),
          fetchRatings(restaurantCustomId, token)
        ]);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error fetching restaurant data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndData();
  }, [dateRange, fetchDashboardStats, fetchOrders, fetchRatings]);

  const handleWithdrawal = async () => {
    toast.info("Processing withdrawal request...");
    if (!restaurant.walletBalance || parseFloat(restaurant.walletBalance) <= 0) {
      toast.error("Insufficient balance for withdrawal.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://mongobyte.vercel.app/api/v1/withdrawals",
        { 
          restaurantName: restaurant.name, 
          amount: parseFloat(restaurant.walletBalance) 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(response.data.message || "Withdrawal request submitted successfully");
      
      // Update local restaurant state to reflect new balance
      setRestaurant(prev => ({
        ...prev,
        walletBalance: 0
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error processing withdrawal."
      );
    }
  };

  // Handle changing date range
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const toggleActiveStatus = async () => {
    const token = localStorage.getItem("token");
    setIsTogglingStatus(true);
    try {
      await axios.patch(
        `https://mongobyte.vercel.app/api/v1/restaurants/${restaurant.customId}/toggle-active`,
        { isActive: !restaurant.isActive },
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
    } finally {
      setIsTogglingStatus(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-20">
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
                  {/* Rating Display */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(ratingStats.averageRating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {ratingStats.averageRating.toFixed(1)} ({ratingStats.totalRatings} reviews)
                    </span>
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
                <div className="flex gap-2">
                  <button
                    onClick={toggleActiveStatus}
                    disabled={isTogglingStatus}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      restaurant.isActive 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-cheese hover:bg-yellow-500 text-crust"
                    } ${isTogglingStatus ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    {isTogglingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{restaurant.isActive ? "Close Restaurant" : "Open Restaurant"}</span>
                    )}
                  </button>

                    
                    </div></div></div>
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

        {/* Date Range Selector */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
          <div className="flex flex-wrap gap-4">
            {dateRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === option.value
                    ? "bg-cheese text-crust"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            {isLoadingRevenue ? (
              <div className="flex items-center justify-center h-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cheese"></div>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₦{dashboardStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">{dateRangeLabel}</p>
              </div>
            )}
          </div>

          {/* Total Orders Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
            {isLoadingRevenue ? (
              <div className="flex items-center justify-center h-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cheese"></div>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardStats.totalOrders}
                </p>
                <p className="text-sm text-gray-500 mt-1">{dateRangeLabel}</p>
              </div>
            )}
          </div>

          {/* Average Order Value Card */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700">Average Order Value</h3>
            {isLoadingRevenue ? (
              <div className="flex items-center justify-center h-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cheese"></div>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₦{dashboardStats.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-gray-500 mt-1">{dateRangeLabel}</p>
              </div>
            )}
          </div>
        </div>
        </div>
        </div>
  )
};

export default RestaurantDashboard;