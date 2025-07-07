import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { format, subDays, subMonths } from "date-fns";
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  ChartBarIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  XCircleIcon,
  TruckIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import LoadingPage from "./Loader";
import RestaurantFeeRequest from "./RestaurantFeeRequest";

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("week");
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);
  const [testimonials, setTestimonials] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [testimonialStats, setTestimonialStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    featured: 0
  });
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
  const [orderStatusFilter, setOrderStatusFilter] = useState('pending');

  // Move fetchDashboardStats definition above useEffect
  const fetchDashboardStats = useCallback(async (restaurantId, token) => {
    try {
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/restaurants/${restaurantId}/stats?range=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDashboardStats(response.data);
    } catch (error) {
      // Generate mock data for demonstration
      // generateMockStats();
    }
  }, [dateRange]);

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
          `https://mongobyte.vercel.app/api/v1/restaurants/${restaurantCustomId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRestaurant(restaurantResponse.data);
        
        // Fetch orders and stats
        await Promise.all([
          fetchOrders(restaurantCustomId, token),
          fetchDashboardStats(restaurantCustomId, token),
          fetchTestimonials(restaurantCustomId, token),
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

    fetchRestaurantAndOrders();
  }, [dateRange, fetchDashboardStats]);

  const handleWithdrawal = async () => {
    toast.info("Processing withdrawal request...");
    if (!restaurant.walletBalance || parseFloat(restaurant.walletBalance) <= 0) {
      toast.error("Insufficient balance for withdrawal.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://mongobyte.vercel.app/api/v1/restaurants/withdraw",
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
        `https://mongobyte.vercel.app/api/v1/orders/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 8000 // Add timeout to the axios request to prevent hanging
        }
      );
      const sortedOrders = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
      
      if (isRefreshing) {
        toast.success("Orders refreshed successfully!");
        setIsRefreshing(false);
      }
    } catch (error) {
      toast.error(error.message || "Error fetching orders.");
      setIsRefreshing(false);
    }
  };

  const fetchTestimonials = async (restaurantId, token) => {
    try {
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/testimonials?restaurant=${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTestimonials(response.data.testimonials || []);
      
      // Calculate testimonial stats
      const total = response.data.testimonials?.length || 0;
      const pending = response.data.testimonials?.filter(t => !t.isApproved).length || 0;
      const approved = response.data.testimonials?.filter(t => t.isApproved).length || 0;
      const featured = response.data.testimonials?.filter(t => t.isFeatured).length || 0;
      
      setTestimonialStats({ total, pending, approved, featured });
    } catch (error) {
      setTestimonials([]);
    }
  };

  const fetchRatings = async (restaurantId, token) => {
    try {
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/ratings/restaurant/${restaurantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRatings(response.data.ratings || []);
      
      // Calculate rating stats
      const ratings = response.data.ratings || [];
      const totalRatings = ratings.length;
      
      if (totalRatings > 0) {
        const averageRating = ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings;
        
        // Calculate ratings breakdown
        const ratingsBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(r => {
          ratingsBreakdown[r.overallRating] = (ratingsBreakdown[r.overallRating] || 0) + 1;
        });
        
        // Calculate category averages
        const categoryAverages = {
          foodQuality: ratings.reduce((sum, r) => sum + (r.foodQuality || 0), 0) / totalRatings,
          deliverySpeed: ratings.reduce((sum, r) => sum + (r.deliverySpeed || 0), 0) / totalRatings,
          customerService: ratings.reduce((sum, r) => sum + (r.customerService || 0), 0) / totalRatings,
          valueForMoney: ratings.reduce((sum, r) => sum + (r.valueForMoney || 0), 0) / totalRatings,
          packaging: ratings.reduce((sum, r) => sum + (r.packaging || 0), 0) / totalRatings
        };
        
        setRatingStats({
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings,
          ratingsBreakdown,
          categoryAverages
        });
      }
    } catch (error) {
      setRatings([]);
    }
  };

  const approveTestimonial = async (testimonialId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/testimonials/${testimonialId}/approve`,
        { isApproved: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Testimonial approved successfully!");
      fetchTestimonials(restaurant.customId, token);
    } catch (error) {
      toast.error("Error approving testimonial");
    }
  };

  const setFeaturedTestimonial = async (testimonialId, isFeatured) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/testimonials/${testimonialId}/featured`,
        { isFeatured },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Testimonial ${isFeatured ? 'featured' : 'unfeatured'} successfully!`);
      fetchTestimonials(restaurant.customId, token);
    } catch (error) {
      toast.error("Error updating testimonial");
    }
  };

  const deleteTestimonial = async (testimonialId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    
    try {
      await axios.delete(
        `https://mongobyte.vercel.app/api/v1/testimonials/${testimonialId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Testimonial deleted successfully!");
      fetchTestimonials(restaurant.customId, token);
    } catch (error) {
      toast.error("Error deleting testimonial");
    }
  };

  const moderateRating = async (ratingId, isHidden) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/ratings/${ratingId}/moderate`,
        { isHidden, adminNotes: `${isHidden ? 'Hidden' : 'Shown'} by restaurant admin` },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Rating ${isHidden ? 'hidden' : 'shown'} successfully!`);
      fetchRatings(restaurant.customId, token);
    } catch (error) {
      toast.error("Error moderating rating");
    }
  };

  const handleShowMore = () => {
    setVisibleOrdersCount((prevCount) => prevCount + 10);
  };

  const toggleActiveStatus = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `https://mongobyte.vercel.app/api/v1/restaurants/${restaurant.customId}/toggle-active`,
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

  const updateOrderStatus = async (orderCustomId, newStatus, additionalData = {}) => {
    const token = localStorage.getItem("token");
    try {
      // For confirming order with or without additional fee
      if (newStatus.toLowerCase() === 'confirmed' || newStatus.toLowerCase() === 'fee requested') {
        // Format request body to match exactly what the backend expects
        // Let the backend determine if this becomes a fee request or direct confirmation
        const requestBody = {
          additionalFee: additionalData.additionalFee || 0, 
          requestDescription: additionalData.requestDescription || "Order confirmed by restaurant"
        };
          
        console.log('PAYMENT CONFIRMATION - Request Body:', requestBody);
        console.log('PAYMENT CONFIRMATION - Order ID:', orderCustomId);
        console.log('PAYMENT CONFIRMATION - Headers:', { 
          Authorization: `Bearer ${token.substring(0, 10)}...`, 
          'Content-Type': 'application/json' 
        });
        
        await axios.post(
          `http://localhost:8080/api/v1/orders/${orderCustomId}/confirm`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json' // Explicitly set content type
            },
          }
        );
      }
      // For other status updates (delivered, canceled, etc.)
      else {
        await axios.post(
          `https://mongobyte.vercel.app/api/v1/orders/${orderCustomId}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
      }
      
      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.customId === orderCustomId
            ? { ...order, status: newStatus, ...additionalData }
            : order
        )
      );
      
      toast.success(`Order ${newStatus === 'fee requested' ? 'fee request sent' : `status updated to ${newStatus}`}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('exceeds allowed limit')) {
        toast.info('Fee request sent to customer for approval!');
        setOrders(prev =>
          prev.map(order =>
            order.customId === orderCustomId
              ? { ...order, status: 'Fee Requested' }
              : order
          )
        );
      } else if (error.response?.status === 400 && error.response.data.message.includes('Insufficient balance')) {
        toast.error('Order cancelled due to insufficient customer balance.');
        setOrders(prev =>
          prev.map(order =>
            order.customId === orderCustomId
              ? { ...order, status: 'Canceled' }
              : order
          )
        );
      } else {
        toast.error(
          error.response?.data?.message || "Error updating order status."
        );
      }
    }
  };

  const exportOrders = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/orders/restaurant/${restaurant.customId}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Create CSV content
      const csvContent = [
        ['Order ID', 'Customer', 'Date', 'Status', 'Food Amount', 'Items'].join(','),
        ...response.data.map(order => [
          order._id,
          order.customerName || 'Unknown',
          format(new Date(order.createdAt), 'yyyy-MM-dd'),
          order.status,
          `₦${(order.totalAmount - (order.fee || 0)).toFixed(2)}`,
          order.items.map(item => `${item.name} (${item.quantity})`).join('; ')
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error('Error exporting orders');
    }
  };

  const exportMonthlyReport = async () => {
    const token = localStorage.getItem("token");
    try {
      const startDate = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/orders/restaurant/${restaurant.customId}/report`,
        {
          params: { startDate, endDate },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Create CSV content for monthly report
      const csvContent = [
        ['Date', 'Total Orders', 'Revenue', 'Completed Orders', 'Cancelled Orders'].join(','),
        ...response.data.map(day => [
          day.date,
          day.totalOrders,
          `₦${day.revenue}`,
          day.completedOrders,
          day.cancelledOrders
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-report-${format(new Date(), 'yyyy-MM')}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Monthly report exported successfully');
    } catch (error) {
      toast.error('Error exporting monthly report');
    }
  };

  const exportDailyReport = async () => {
    const token = localStorage.getItem("token");
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/orders/restaurant/${restaurant.customId}/daily-report`,
        {
          params: { date: today },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Create CSV content for daily report
      const csvContent = [
        ['Hour', 'Orders', 'Revenue', 'Popular Items'].join(','),
        ...response.data.map(hour => [
          `${hour.hour}:00`,
          hour.orders,
          `₦${hour.revenue}`,
          hour.popularItems.join('; ')
        ].join(','))
      ].join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-report-${today}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Daily report exported successfully');
    } catch (error) {
      toast.error('Error exporting daily report');
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-20">
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
            { id: 'testimonials', label: 'Testimonials', icon: ChatBubbleLeftRightIcon },
            { id: 'ratings', label: 'Ratings', icon: StarIcon },
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-yellow-100 p-3">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">{ratingStats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">Average Rating</div>
                  <div className="text-xs text-gray-400">({ratingStats.totalRatings} reviews)</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-pink-100 p-3">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">{testimonialStats.total}</div>
                  <div className="text-sm text-gray-500">Testimonials</div>
                  <div className="text-xs text-gray-400">{testimonialStats.pending} pending</div>
                </div>
              </motion.div>
            </div>

            {/* Action Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <div className="rounded-full bg-pink-100 p-3 mr-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{testimonialStats.pending}</div>
                    <div className="text-sm text-gray-500">Pending Testimonials</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('testimonials')}
                  className="px-3 py-1 bg-pink-100 text-pink-800 rounded-lg text-sm font-medium hover:bg-pink-200 transition-colors"
                >
                  Review
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="rounded-full bg-yellow-100 p-3 mr-4">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{ratingStats.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Average Rating</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('ratings')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
                >
                  View
                </button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
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
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Order Status Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'delivered', 'fee requested'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        orderStatusFilter === status
                          ? 'bg-cheese text-crust'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({orders.filter(order => (order.status || '').toLowerCase() === status).length})
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setIsRefreshing(true);
                    toast.info("Refreshing orders...");
                    const token = localStorage.getItem("token");
                    const decodedToken = jwtDecode(token);
                    const restaurantCustomId = decodedToken.restaurant.customId;
                    
                    // Set a timeout to ensure the spinner stops even if the request hangs
                    const timeoutId = setTimeout(() => {
                      if (isRefreshing) {
                        setIsRefreshing(false);
                        toast.warn("Refresh timeout - please try again later");
                      }
                    }, 10000); // 10 second timeout
                    
                    fetchOrders(restaurantCustomId, token)
                      .finally(() => clearTimeout(timeoutId)); // Clear timeout if request completes
                  }}
                  disabled={isRefreshing}
                  className="px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh Orders"}
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders
                .filter((order) => (order.status || '').toLowerCase() === orderStatusFilter)
                .slice(0, visibleOrdersCount)
                .map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    isPending={(order.status || '').toLowerCase() === 'pending'}
                    isConfirmed={(order.status || '').toLowerCase() === 'confirmed'}
                    updateOrderStatus={updateOrderStatus}
                  />
                ))}

              {orders.filter((order) => (order.status || '').toLowerCase() === orderStatusFilter).length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                  <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No {orderStatusFilter.toLowerCase()} orders found</p>
                </div>
              )}

              {orders.filter((order) => (order.status || '').toLowerCase() === orderStatusFilter).length > visibleOrdersCount && (
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
                  {/* Monthly Performance content removed as per instructions */}
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

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            {/* Testimonial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-3 mr-4">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{testimonialStats.total}</div>
                    <div className="text-sm text-gray-500">Total Testimonials</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full bg-yellow-100 p-3 mr-4">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{testimonialStats.pending}</div>
                    <div className="text-sm text-gray-500">Pending Approval</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{testimonialStats.approved}</div>
                    <div className="text-sm text-gray-500">Approved</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 p-3 mr-4">
                    <StarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{testimonialStats.featured}</div>
                    <div className="text-sm text-gray-500">Featured</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials List */}
            <div className="space-y-4">
              {testimonials.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No testimonials found</p>
                </div>
              ) : (
                testimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial._id}
                    testimonial={testimonial}
                    onApprove={approveTestimonial}
                    onFeature={setFeaturedTestimonial}
                    onDelete={deleteTestimonial}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            {/* Rating Overview */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Rating Overview</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Overall Rating */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-yellow-500 mb-2">
                    {ratingStats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIconSolid
                        key={i}
                        className={`h-8 w-8 ${
                          i < Math.floor(ratingStats.averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">Based on {ratingStats.totalRatings} reviews</p>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <span className="text-sm w-4">{star}</span>
                      <StarIconSolid className="h-4 w-4 text-yellow-400 ml-1 mr-3" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              ratingStats.totalRatings > 0
                                ? (ratingStats.ratingsBreakdown[star] / ratingStats.totalRatings) * 100
                                : 0
                            }%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 ml-3 w-8">
                        {ratingStats.ratingsBreakdown[star] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Averages */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Ratings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(ratingStats.categoryAverages).map(([category, average]) => (
                    <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{average.toFixed(1)}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="flex justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(average) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ratings List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
              {ratings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl">
                  <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No ratings found</p>
                </div>
              ) : (
                ratings.map((rating) => (
                  <RatingCard
                    key={rating._id}
                    rating={rating}
                    onModerate={moderateRating}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial, onApprove, onFeature, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-600">
              {testimonial.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {testimonial.user?.name || 'Anonymous User'}
            </h4>
            <p className="text-sm text-gray-500">
              {format(new Date(testimonial.createdAt), 'PPp')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-4 w-4 ${
                  i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-1">
            {testimonial.isFeatured && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
            {testimonial.isApproved ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Approved
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                Pending
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{testimonial.review}</p>

      {testimonial.tags && testimonial.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {testimonial.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
            <HeartIcon className="h-4 w-4" />
            <span className="text-sm">{testimonial.likes?.length || 0}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
            <FlagIcon className="h-4 w-4" />
            <span className="text-sm">Report</span>
          </button>
        </div>

        <div className="flex space-x-2">
          {!testimonial.isApproved && (
            <button
              onClick={() => onApprove(testimonial._id)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => onFeature(testimonial._id, !testimonial.isFeatured)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              testimonial.isFeatured
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {testimonial.isFeatured ? 'Unfeature' : 'Feature'}
          </button>
          <button
            onClick={() => onDelete(testimonial._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Rating Card Component
const RatingCard = ({ rating, onModerate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-md p-6 ${rating.isHidden ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-600">
              {rating.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {rating.isAnonymous ? 'Anonymous User' : (rating.user?.name || 'User')}
            </h4>
            <p className="text-sm text-gray-500">
              {format(new Date(rating.createdAt), 'PPp')}
            </p>
            {rating.isVerifiedPurchase && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center">
            <StarIconSolid className="h-5 w-5 text-yellow-400 mr-1" />
            <span className="font-semibold">{rating.overallRating}</span>
          </div>
          {rating.isHidden && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium mt-1">
              Hidden
            </span>
          )}
        </div>
      </div>

      {/* Category Ratings */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="text-center">
          <div className="text-sm text-gray-600">Food Quality</div>
          <div className="flex justify-center">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-3 w-3 ${
                  i < rating.foodQuality ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Delivery</div>
          <div className="flex justify-center">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-3 w-3 ${
                  i < rating.deliverySpeed ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Service</div>
          <div className="flex justify-center">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-3 w-3 ${
                  i < rating.customerService ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Value</div>
          <div className="flex justify-center">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-3 w-3 ${
                  i < rating.valueForMoney ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Packaging</div>
          <div className="flex justify-center">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`h-3 w-3 ${
                  i < rating.packaging ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {rating.reviewText && (
        <p className="text-gray-700 mb-4">{rating.reviewText}</p>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
            <span className="text-sm">👍 {rating.helpfulVotes?.length || 0} helpful</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm">Report</span>
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onModerate(rating._id, !rating.isHidden)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              rating.isHidden
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {rating.isHidden ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Order Card Component
const OrderCard = ({ order, isPending, isConfirmed, updateOrderStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'fee requested': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfirmOrder = () => {
    setShowFeeModal(true);
  };

  const handleCloseModal = () => {
    setShowFeeModal(false);
  };

  const getOrderActions = () => {
    const status = (order.status || '').toLowerCase();
    
    if (status === 'pending') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <button
            onClick={handleConfirmOrder}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Confirm Order
          </button>
          <button
            onClick={() => updateOrderStatus(order.customId, 'canceled')}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <XCircleIcon className="h-5 w-5" />
            Cancel Order
          </button>
        </div>
      );
    } else if (status === 'confirmed') {
      return (
        <button
          onClick={() => updateOrderStatus(order.customId, 'delivered')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
        >
          <TruckIcon className="h-5 w-5" />
          Mark as Delivered
        </button>
      );
    } else if (status === 'fee requested') {
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Waiting for Customer Approval</span>
          </div>
          <p className="text-purple-700 text-sm">
            You've requested additional fees for this order. The customer has been notified and needs to approve the fee.
          </p>
        </div>
      );
    }
    
    return null;
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
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>📅 {format(new Date(order.createdAt), 'PPp')}</p>
              <p>📞 {order.phoneNumber}</p>
              <p>📍 {order.location}</p>
              {order.recipient && (
                <p className="text-purple-600 font-medium">🎁 Gift order for: {order.recipient.name}</p>
              )}
              {order.requestDescription && (
                <p className="text-blue-600 italic">💬 "{order.requestDescription}"</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">₦{(order.totalPrice - (order.fee || 0)).toFixed(2)}</div>
            <div className="text-xs text-gray-500">Food Amount</div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-cheese hover:text-yellow-600 text-sm font-medium flex items-center justify-end space-x-1 mt-2"
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
                
                {/* Food Total Summary */}
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t-2 border-blue-200">
                  <div>
                    <span className="font-bold text-blue-900">Food Total</span>
                    <span className="text-blue-600 text-sm ml-2">(Your earnings from food)</span>
                  </div>
                  <span className="font-bold text-blue-900 text-lg">₦{(order.totalPrice - (order.fee || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 mb-2">📦 Delivery Information</h5>
              <p className="text-yellow-700 text-sm">
                The customer has allocated a transport budget separately. You can request your delivery fee independently 
                based on the distance and your delivery costs. The food amount shown above is what you earn from the meal sales.
              </p>
            </div>

            {/* Order Actions */}
            {getOrderActions()}
            
          </motion.div>
        )}
      </div>

      {/* Fee Request Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <RestaurantFeeRequest 
              order={order} 
              onOrderUpdate={(updatedOrder) => {
                // Pass along the fee and description from the fee request form
                updateOrderStatus(updatedOrder.customId, updatedOrder.status, {
                  additionalFee: updatedOrder.additionalFee,
                  requestDescription: updatedOrder.requestDescription
                });
              }}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RestaurantDashboard;