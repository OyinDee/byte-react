import React, { useEffect, useState, useCallback } from "react";
import { FaTrashAlt, FaShoppingBag, FaMapMarkerAlt, FaStickyNote, FaWallet, FaCreditCard, FaGift, FaUserFriends } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from "../context/cartContext";
import UserLookup from "../components/UserLookup";
import axios from "axios";

const CartPage = () => {
  const { cart, removeItem, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [note, setNote] = useState('');
  const [fee, setFee] = useState(1000);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentCheckoutData, setCurrentCheckoutData] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  
  // Order for another user states
  const [isOrderingForOther, setIsOrderingForOther] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [orderForUsername, setOrderForUsername] = useState('');
  const [overrideDeliveryInfo, setOverrideDeliveryInfo] = useState({
    location: '',
    phoneNumber: '',
    nearestLandmark: ''
  });
  
  // Add new state for external recipient
  const [isOrderingForExternal, setIsOrderingForExternal] = useState(false);
  const [externalRecipient, setExternalRecipient] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    nearestLandmark: '',
  });
  
  const navigate = useNavigate();

  // Fetch fresh user profile data from the server
  const refreshUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const response = await axios.get(
        "https://mongobyte.vercel.app/api/v1/users/getProfile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update user state with fresh data
      const freshUserData = response.data.user;
      setUser(freshUserData);
      
      // Update localStorage with latest user data
      localStorage.setItem("byteUser", JSON.stringify(freshUserData));
      
      // Also update user balance with fresh data
      setUserBalance(freshUserData.byteBalance || 0);
      
      console.log("Profile refreshed with latest data");
      
      return freshUserData;
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      return null;
    }
  }, []);

  // Fetch user's current balance
  const fetchUserBalance = useCallback(async (username) => {
    if (!username) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://mongobyte.vercel.app/api/v1/users/balance/${username}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  }, []);

  // Listen for profile updates from the Profile component
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedUser = event.detail;
      console.log("Profile updated, refreshing user data:", updatedUser);
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // First, decode the token to get basic user data
        const storedUser = jwtDecode(storedToken);
        setUser(storedUser);
        
        // Then, refresh the profile data from the server
        (async () => {
          // Show loading toast for better user experience
          const loadingToast = toast.loading("Refreshing profile data...");
          
          // Refresh profile from server
          const freshUserData = await refreshUserProfile();
          
          if (freshUserData) {
            // If we got fresh data, fetch the balance too
            await fetchUserBalance(freshUserData.username);
            toast.update(loadingToast, {
              render: "Profile data updated!",
              type: "success",
              isLoading: false,
              autoClose: 2000,
              closeButton: true
            });
          } else {
            // If server refresh failed, fall back to localStorage
            const byteUser = localStorage.getItem("byteUser");
            if (byteUser) {
              try {
                const parsedUser = JSON.parse(byteUser);
                // Merge JWT user with localStorage user
                setUser(prevUser => ({
                  ...prevUser,
                  ...parsedUser
                }));
                
                // Also fetch balance for this user
                await fetchUserBalance(parsedUser.username || storedUser.user.username);
              } catch (error) {
                console.error("Error parsing byteUser from localStorage:", error);
              }
            }
            
            toast.update(loadingToast, {
              render: "Using cached profile data",
              type: "info",
              isLoading: false,
              autoClose: 2000,
              closeButton: true
            });
          }
        })();
      } catch (error) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate, fetchUserBalance, refreshUserProfile]);

  const handleRemoveItem = useCallback((restaurantId, mealId) => {
    removeItem(mealId);
    toast.success("Item removed from cart!");
  }, [removeItem]);

  const handleClearCart = useCallback((restaurantId) => {
    clearCart();
    toast.success("Cart cleared successfully!");
  }, [clearCart]);

  const totalAmountPerRestaurant = useCallback((items = [], fee = 0) => {
    if (!Array.isArray(items)) return parseFloat(fee || 0);
    
    return items
      .filter(item => item && item.meal && typeof item.quantity === 'number' && typeof item.meal.price === 'number')
      .reduce(
        (sum, item) => sum + (item.meal.price * item.quantity),
        0
      ) + parseFloat(fee || 0);
  }, []);

  // Utility to check if all items are add-ons
  const isOnlyAddOns = (items) => {
    return Array.isArray(items) && 
           items.length > 0 && 
           items.every(item => 
             item.meal && 
             item.meal.tag === 'add-on'
           );
  };

  // Handle user lookup for ordering for others
  const handleUserFound = (userInfo) => {
    setRecipientInfo(userInfo);
    setOrderForUsername(userInfo.username);
    
    // Pre-fill delivery info if available
    if (userInfo.hasDeliveryInfo) {
      setOverrideDeliveryInfo({
        location: userInfo.location || '',
        phoneNumber: userInfo.phoneNumber || '',
        nearestLandmark: userInfo.nearestLandmark || ''
      });
    } else {
      // Clear override fields if user doesn't have complete info
      setOverrideDeliveryInfo({
        location: '',
        phoneNumber: '',
        nearestLandmark: ''
      });
    }
  };

  const handleUserNotFound = (error) => {
    setRecipientInfo(null);
    setOrderForUsername('');
    setOverrideDeliveryInfo({
      location: '',
      phoneNumber: '',
      nearestLandmark: ''
    });
  };

  const handleClearUserSelection = () => {
    setRecipientInfo(null);
    setOrderForUsername('');
    setOverrideDeliveryInfo({
      location: '',
      phoneNumber: '',
      nearestLandmark: ''
    });
  };

  // Update toggleOrderType to handle external
  const toggleOrderType = (type) => {
    setIsOrderingForOther(type === 'other');
    setIsOrderingForExternal(type === 'external');
    if (type !== 'other') handleClearUserSelection();
    if (type !== 'external') setExternalRecipient({ name: '', phone: '', email: '', location: '', nearestLandmark: '' });
  };

  const handleCheckout = useCallback(async (restaurantId) => {
    if (!user) {
      toast.error("You need to log in first.");
      return;
    }

    // First, refresh user profile to get the most current data
    const freshUserData = await refreshUserProfile();
    let finalUserData = freshUserData || user;

    const itemsForRestaurant = cart.get(restaurantId) || [];
    if (itemsForRestaurant.length === 0) {
      toast.error("No items to checkout.");
      return;
    }
    if (isOnlyAddOns(itemsForRestaurant)) {
      toast.error("You cannot place an order with only add-ons in your cart. Please add a main meal.");
      return;
    }

    const totalAmount = totalAmountPerRestaurant(itemsForRestaurant, fee);

    // External recipient flow
    if (isOrderingForExternal) {
      // Validate required fields
      if (!externalRecipient.name.trim() || !externalRecipient.phone.trim() || !externalRecipient.location.trim()) {
        toast.error("Please provide recipient's name, phone, and delivery location.");
        return;
      }
      setCurrentCheckoutData({
        restaurantId,
        itemsForRestaurant,
        totalAmount,
        orderDetails: {
          meals: itemsForRestaurant.map(({ meal, quantity }) => ({
            mealId: meal.customId,
            quantity,
          })),
          note,
          totalPrice: totalAmount,
          fee: parseFloat(fee) || 1000,
          location: externalRecipient.location,
          phoneNumber: externalRecipient.phone,
          nearestLandmark: externalRecipient.nearestLandmark,
          recipientName: externalRecipient.name,
          recipientPhone: externalRecipient.phone,
          recipientEmail: externalRecipient.email,
          restaurantCustomId: restaurantId,
        },
        isExternal: true,
      });
      setShowPaymentModal(true);
      return;
    }

    // Check if ordering for another user and validate recipient
    if (isOrderingForOther) {
      if (!recipientInfo || !orderForUsername) {
        toast.error("Please select a recipient for this gift order.");
        return;
      }
      
      // Check if we have required delivery information
      const finalLocation = overrideDeliveryInfo.location || recipientInfo.location;
      const finalPhone = overrideDeliveryInfo.phoneNumber || recipientInfo.phoneNumber;
      
      if (!finalLocation || !finalPhone) {
        toast.error("Please provide delivery location and phone number for the recipient.");
        return;
      }
    } else {
      // Regular order validation with the most recent user data      
      if (!finalUserData.location || finalUserData.location === "" || 
          !finalUserData.nearestLandmark || finalUserData.nearestLandmark === "") {
        toast.error("Complete profile setup to proceed with the order.");
        // Redirect to profile page to complete setup
        navigate('/user/profile');
        return;
      }
    }
    
    // Build order details with conditional recipient info
    const orderDetails = {
      restaurantCustomId: restaurantId,
      meals: itemsForRestaurant.map(({ meal, quantity }) => ({
        mealId: meal.customId,
        quantity,
      })),
      totalPrice: totalAmount,
      note: isOrderingForOther 
        ? `Gift order for @${orderForUsername}. ${note}`.trim()
        : note,
      fee: parseFloat(fee) || 1000,
      location: "",
      phoneNumber: "",
      nearestLandmark: ""
    };

    // Add delivery information based on order type
    if (isOrderingForOther) {
      orderDetails.orderForUsername = orderForUsername;
      orderDetails.location = overrideDeliveryInfo.location || recipientInfo.location;
      orderDetails.phoneNumber = overrideDeliveryInfo.phoneNumber || recipientInfo.phoneNumber;
      orderDetails.nearestLandmark = overrideDeliveryInfo.nearestLandmark || recipientInfo.nearestLandmark || "";
    } else {
      orderDetails.location = finalUserData.location;
      orderDetails.phoneNumber = finalUserData.phoneNumber;
      orderDetails.nearestLandmark = finalUserData.nearestLandmark || "";
    }
    
    // Fetch latest user balance before showing payment modal
    await fetchUserBalance(finalUserData.username);
    
    setCurrentCheckoutData({
      restaurantId,
      itemsForRestaurant,
      totalAmount,
      orderDetails
    });
    setShowPaymentModal(true);
  }, [cart, fee, note, totalAmountPerRestaurant, user, isOrderingForOther, recipientInfo, orderForUsername, overrideDeliveryInfo, fetchUserBalance, navigate, refreshUserProfile, isOrderingForExternal, externalRecipient]);

  const processWalletPayment = useCallback(async () => {
    if (!currentCheckoutData) return;

    const { totalAmount, orderDetails, isExternal } = currentCheckoutData;
    
    // Use the fetched real-time balance instead of localStorage
    if (userBalance < totalAmount) {
      toast.error("Insufficient balance. Please add funds to your wallet or pay with card!");
      return;
    }

    setIsCheckoutLoading(true);
    
    // Use a unique ID for the toast to avoid conflicts
    const toastId = "order-processing-" + Date.now();
    
    toast.info("Processing your order...", {
      autoClose: false,
      isLoading: true,
      toastId: toastId
    });

    try {
      const token = localStorage.getItem('token');
      let response, responseData;
      if (isExternal) {
        response = await fetch("https://mongobyte.vercel.app/api/v1/orders/gift-external", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientName: orderDetails.recipientName,
            recipientPhone: orderDetails.recipientPhone,
            recipientEmail: orderDetails.recipientEmail,
            location: orderDetails.location,
            nearestLandmark: orderDetails.nearestLandmark,
            meals: orderDetails.meals,
            note: orderDetails.note,
            totalPrice: orderDetails.totalPrice,
            fee: orderDetails.fee,
            restaurantCustomId: orderDetails.restaurantCustomId,
            paymentMethod: 'wallet',
          }),
        });
      } else {
        response = await fetch("https://mongobyte.vercel.app/api/v1/orders/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            meals: orderDetails.meals,
            note: orderDetails.note,
            totalPrice: orderDetails.totalPrice,
            location: orderDetails.location,
            phoneNumber: orderDetails.phoneNumber,
            restaurantCustomId: orderDetails.restaurantCustomId,
            nearestLandmark: orderDetails.nearestLandmark,
            fee: orderDetails.fee,
            ...(orderDetails.orderForUsername && { orderForUsername: orderDetails.orderForUsername }),
            paymentMethod: 'wallet'
          }),
        });
      }

      responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to place the order.");
      }

      clearCart();
      setNote('');
      setShowPaymentModal(false);
      setCurrentCheckoutData(null);
      
      // Only dismiss the toast if it exists
      if (toast.isActive(toastId)) {
        toast.dismiss(toastId);
      }
      
      toast.success("Order placed successfully!");

    } catch (error) {
      console.error("Wallet payment error:", error);
      
      // Only dismiss the toast if it exists
      if (toast.isActive(toastId)) {
        toast.dismiss(toastId);
      }
      
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [currentCheckoutData, clearCart, setNote, userBalance]);

  // Render a toast container at the component level to manage toasts
  // This ensures toasts are properly mounted and unmounted with the component
  const renderToastContainer = () => (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );

  if (!user) return renderToastContainer();

  // Check if profile is incomplete for rendering warning if needed
  const isProfileIncomplete = !user.location || user.location === "" || 
                              !user.nearestLandmark || user.nearestLandmark === "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 pt-16 md:pt-24 pb-24 md:pb-6">
      {renderToastContainer()}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-crust mb-2 flex items-center justify-center gap-3">
            <FaShoppingBag className="text-pepperoni" />
            Your Cart
          </h1>
          <p className="text-gray-600 font-sans">Review your delicious selections</p>
        </motion.div>

        {/* Profile Incomplete Warning */}
        {!isOrderingForOther && isProfileIncomplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg shadow-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your profile is incomplete. Please 
                  <button 
                    onClick={() => navigate('/user/profile')} 
                    className="font-medium underline text-yellow-800 hover:text-yellow-900 ml-1"
                  >
                    complete your profile
                  </button> 
                  to place an order.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {cart.size === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="mb-6">
              <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
              <p className="text-gray-500">Add some delicious meals to get started!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/user')}
              className="bg-pepperoni text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Browse Restaurants
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Order Type Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <h3 className="text-xl font-bold text-crust mb-4 flex items-center gap-2">
                <FaUserFriends className="text-blue-600" />
                Who are you ordering for?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleOrderType('self')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    !isOrderingForOther && !isOrderingForExternal
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${!isOrderingForOther && !isOrderingForExternal ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <FaShoppingBag className={!isOrderingForOther && !isOrderingForExternal ? 'text-blue-600' : 'text-gray-500'} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold">Order for Myself</h4>
                      <p className="text-sm opacity-75">Standard personal order</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleOrderType('other')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    isOrderingForOther
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isOrderingForOther ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <FaGift className={isOrderingForOther ? 'text-purple-600' : 'text-gray-500'} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold">Order for Another User</h4>
                      <p className="text-sm opacity-75">Send food to a Byte! user</p>
                    </div>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleOrderType('external')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    isOrderingForExternal
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isOrderingForExternal ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <FaUserFriends className={isOrderingForExternal ? 'text-green-600' : 'text-gray-500'} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold">Order for Someone Not on Byte</h4>
                      <p className="text-sm opacity-75">Send food to anyone, even if they’re not a user</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* User Lookup Component */}
              {isOrderingForOther && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserLookup
                    onUserFound={handleUserFound}
                    onUserNotFound={handleUserNotFound}
                    onClear={handleClearUserSelection}
                  />
                </motion.div>
              )}

              {/* Delivery Information Override for Gift Orders */}
              {isOrderingForOther && recipientInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200 mt-6"
                >
                  <h4 className="text-lg font-bold text-crust mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-orange-600" />
                    Delivery Information for @{recipientInfo.username}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {recipientInfo.hasDeliveryInfo 
                      ? "You can use their saved information or provide custom delivery details below:"
                      : "Please provide the delivery information for this order:"
                    }
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Location *
                      </label>
                      <input
                        type="text"
                        value={overrideDeliveryInfo.location}
                        onChange={(e) => setOverrideDeliveryInfo(prev => ({...prev, location: e.target.value}))}
                        placeholder={recipientInfo.location ? `Default: ${recipientInfo.location}` : "Enter delivery location"}
                        className="w-full p-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={overrideDeliveryInfo.phoneNumber}
                        onChange={(e) => setOverrideDeliveryInfo(prev => ({...prev, phoneNumber: e.target.value}))}
                        placeholder={recipientInfo.phoneNumber ? `Default: ${recipientInfo.phoneNumber}` : "Enter phone number"}
                        className="w-full p-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent font-sans"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nearest Landmark
                    </label>
                    <input
                      type="text"
                      value={overrideDeliveryInfo.nearestLandmark}
                      onChange={(e) => setOverrideDeliveryInfo(prev => ({...prev, nearestLandmark: e.target.value}))}
                      placeholder={recipientInfo.nearestLandmark ? `Default: ${recipientInfo.nearestLandmark}` : "Enter nearest landmark (optional)"}
                      className="w-full p-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent font-sans"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
            {/* External Recipient Form */}
            {isOrderingForExternal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200 mt-6"
              >
                <h4 className="text-lg font-bold text-crust mb-4 flex items-center gap-2">
                  <FaUserFriends className="text-green-600" />
                  Recipient Information (Not a Byte! user)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      value={externalRecipient.name}
                      onChange={e => setExternalRecipient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter recipient's full name"
                      className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Phone *
                    </label>
                    <input
                      type="tel"
                      value={externalRecipient.phone}
                      onChange={e => setExternalRecipient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter recipient's phone number"
                      className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Email (optional)
                    </label>
                    <input
                      type="email"
                      value={externalRecipient.email}
                      onChange={e => setExternalRecipient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter recipient's email (optional)"
                      className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Location *
                    </label>
                    <input
                      type="text"
                      value={externalRecipient.location}
                      onChange={e => setExternalRecipient(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter delivery location"
                      className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent font-sans"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nearest Landmark
                    </label>
                    <input
                      type="text"
                      value={externalRecipient.nearestLandmark}
                      onChange={e => setExternalRecipient(prev => ({ ...prev, nearestLandmark: e.target.value }))}
                      placeholder="Enter nearest landmark (optional)"
                      className="w-full p-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-transparent font-sans"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">The recipient does not need a Byte! account. They will be contacted for delivery.</p>
              </motion.div>
            )}
            {Array.from(cart.entries()).map(([restaurantId, items], index) => (
              <motion.div
                key={restaurantId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Restaurant Header */}
                <div className="bg-gradient-to-r from-crust to-crust/90 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-secondary">
                        {items.length > 0 ? items[0].meal.restaurantId : "Unknown Restaurant"}
                      </h2>
                      <p className="text-cheese/80 text-sm mt-1">
                        {items.length} item{items.length !== 1 ? 's' : ''} in cart
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleClearCart(restaurantId)}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl shadow-lg transition-all duration-300"
                    >
                      <FaTrashAlt />
                    </motion.button>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="p-6 space-y-4">
                  <AnimatePresence>
                    {Array.isArray(items) && items
                      .filter(item => item && item.meal && item.quantity)
                      .map(({ meal, quantity }) => (
                        meal && meal.customId ? (
                          <motion.div
                            key={meal.customId}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                          >
                            {/* Meal Image */}
                            {meal.imageUrl && (
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md">
                                <img 
                                  src={meal.imageUrl} 
                                  alt={meal.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            )}

                            {/* Meal Details */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-crust">
                                {meal.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                Quantity: {quantity} {meal.per || "meal"}(s)
                              </p>
                              <p className="text-xl font-bold text-pepperoni">₦{(meal.price * quantity).toFixed(2)}</p>
                            </div>

                            {/* Remove Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveItem(restaurantId, meal.customId)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-xl transition-all duration-300"
                            >
                              <FaTrashAlt />
                            </motion.button>
                          </motion.div>
                        ) : null
                      ))}
                  </AnimatePresence>
                </div>

                {/* Order Details */}
                <div className="px-6 pb-6 space-y-4">
                  {/* Note Section */}
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <label className="flex items-center gap-2 text-sm font-semibold text-crust mb-3">
                      <FaStickyNote className="text-yellow-600" />
                      {isOrderingForOther ? `Add a note for ${recipientInfo?.username || 'recipient'}'s order` : 'Add a note for your order'}
                    </label>
                    <textarea
                      className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none font-sans"
                      rows="3"
                      placeholder={
                        isOrderingForOther 
                          ? `Special message or delivery instructions for ${recipientInfo?.username || 'recipient'}...`
                          : "Special requests, allergies, or preferences..."
                      }
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  {/* Delivery Fee Section */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <label className="flex items-center gap-2 text-sm font-semibold text-crust mb-3">
                      <FaMapMarkerAlt className="text-blue-600" />
                      Delivery & Service Fee (₦)
                    </label>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      This represents the maximum you authorize for packaging, delivery, and miscellaneous expenses. 
                      Only the exact amount will be deducted as specified by the restaurant.
                    </p>
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full p-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent font-sans"
                      placeholder="Enter maximum delivery fee..."
                    />
                  </div>

                  {/* Total Section */}
                  <div className="bg-gradient-to-r from-pepperoni/10 to-cheese/10 rounded-xl p-4 border border-pepperoni/20">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-crust">Subtotal:</span>
                      <span className="text-lg font-bold text-crust">
                        ₦{items.reduce((sum, item) => sum + (item.meal?.price ?? 0) * (item.quantity ?? 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-crust">Delivery Fee:</span>
                      <span className="text-lg font-bold text-crust">₦{parseFloat(fee || 0).toFixed(2)}</span>
                    </div>
                    <hr className="border-pepperoni/20 mb-4" />
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-crust">Total:</span>
                      <span className="text-2xl font-bold text-pepperoni">
                        ₦{totalAmountPerRestaurant(items, fee).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Gift Order Summary */}
                    {isOrderingForOther && recipientInfo && (
                      <div className="mt-4 pt-4 border-t border-pepperoni/20">
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3">
                          <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                            <FaGift />
                            Gift Order Summary
                          </h4>
                          <div className="text-sm space-y-1">
                            <p><span className="font-semibold">Recipient:</span> @{recipientInfo.username}</p>
                            <p><span className="font-semibold">Delivery to:</span> {overrideDeliveryInfo.location || recipientInfo.location}</p>
                            <p><span className="font-semibold">Contact:</span> {overrideDeliveryInfo.phoneNumber || recipientInfo.phoneNumber}</p>
                            {(overrideDeliveryInfo.nearestLandmark || recipientInfo.nearestLandmark) && (
                              <p><span className="font-semibold">Landmark:</span> {overrideDeliveryInfo.nearestLandmark || recipientInfo.nearestLandmark}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCheckout(restaurantId)}
                    disabled={isCheckoutLoading || isOnlyAddOns(items)}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                      isCheckoutLoading || isOnlyAddOns(items)
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-pepperoni to-red-600 hover:from-red-600 hover:to-pepperoni text-white shadow-xl hover:shadow-2xl"
                    }`}
                  >
                    {isCheckoutLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        Processing Order...
                      </div>
                    ) : isOnlyAddOns(items) ? (
                      <div className="flex items-center justify-center gap-2">
                        <FaShoppingBag />
                        Cannot order only add-ons
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <FaShoppingBag />
                        Place Order
                      </div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      <AnimatePresence>
        {showPaymentModal && currentCheckoutData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <h2 className="text-2xl font-bold">Choose Payment Method</h2>
                <p className="text-white/90 text-sm">
                  Total: ₦{currentCheckoutData.totalAmount.toFixed(2)}
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Wallet Payment Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processWalletPayment}
                  disabled={isCheckoutLoading}
                  className="w-full p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center gap-4"
                >
                  <div className="bg-orange-100 p-3 rounded-full">
                    <FaWallet className="text-orange-600 text-xl" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-gray-800">Pay from Wallet</h3>
                    <p className="text-sm text-gray-600">
                      Balance: ₦{userBalance.toFixed(2)}
                    </p>
                  </div>
                  {userBalance >= currentCheckoutData.totalAmount ? (
                    <div className="text-green-500 font-semibold">✓ Available</div>
                  ) : (
                    <div className="text-red-500 font-semibold text-xs">Insufficient</div>
                  )}
                </motion.button>

                {/* Card Payment Option - Coming Soon */}
                <motion.div
                  className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 opacity-60 cursor-not-allowed flex items-center gap-4"
                >
                  <div className="bg-gray-200 p-3 rounded-full">
                    <FaCreditCard className="text-gray-500 text-xl" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-gray-600">Pay with Card</h3>
                    <p className="text-sm text-gray-500">Coming Soon - We're working on it!</p>
                  </div>
                  <div className="text-gray-400 font-semibold">🚧</div>
                </motion.div>

                {/* Cancel Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPaymentModal(false);
                    setCurrentCheckoutData(null);
                  }}
                  disabled={isCheckoutLoading}
                  className="w-full p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-semibold transition-all rounded-xl"
                >
                  Cancel
                </motion.button>
              </div>

              {isCheckoutLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Processing...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;
