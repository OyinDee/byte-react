import React, { useEffect, useState, useCallback } from "react";
import { FaTrashAlt, FaShoppingBag, FaMapMarkerAlt, FaStickyNote } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from "../context/cartContext";

const CartPage = () => {
  const { cart, removeItem, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [note, setNote] = useState('');
  const [fee, setFee] = useState(1000);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const storedUser = jwtDecode(storedToken);
        setUser(storedUser.user);
      } catch (error) {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

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

  const handleCheckout = useCallback(async (restaurantId) => {
    if (!user) {
      toast.error("You need to log in first.");
      return;
    }
    if (user.location === "" || user.nearestLandmark === "") {
      toast.error("Complete profile setup to proceed with the order.");
      return;
    }

    setIsCheckoutLoading(true);
    const itemsForRestaurant = cart.get(restaurantId) || [];

    if (itemsForRestaurant.length === 0) {
      toast.error("No items to checkout.");
      setIsCheckoutLoading(false);
      return;
    }

    const totalAmount = totalAmountPerRestaurant(itemsForRestaurant, fee);
    const byteUser = JSON.parse(localStorage.getItem("byteUser"));
    const userBalance = byteUser?.byteBalance || 0;

    if (userBalance < (totalAmount - parseFloat(fee))) {
      toast.error("Insufficient balance. Fund your account and try again!");
      setIsCheckoutLoading(false);
      return;
    }

    const loadingToast = toast.loading("Processing your order...");
    
    const orderDetails = {
      restaurantCustomId: restaurantId,
      meals: itemsForRestaurant.map(({ meal, quantity }) => ({
        mealId: meal.customId,
        quantity,
      })),
      totalPrice: totalAmount,
      location: user.location,
      phoneNumber: user.phoneNumber,
      user: user._id,
      note,
      nearestLandmark: user.nearestLandmark || "",
      fee: parseFloat(fee) || 1000,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("https://mongobyte.onrender.com/api/v1/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderDetails),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to place the order.");
      }

      clearCart();
      setNote('');
      
      toast.dismiss(loadingToast);
      toast.success("Order placed successfully!");

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [cart, clearCart, fee, note, totalAmountPerRestaurant, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 pt-16 md:pt-24 pb-24 md:pb-6">
      <ToastContainer />
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
                              <h3 className="text-lg font-bold text-crust">{meal.name}</h3>
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
                      Add a note for your order
                    </label>
                    <textarea
                      className="w-full p-3 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none font-sans"
                      rows="3"
                      placeholder="Special requests, allergies, or preferences..."
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
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCheckout(restaurantId)}
                    disabled={isCheckoutLoading}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 ${
                      isCheckoutLoading
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-pepperoni to-red-600 hover:from-red-600 hover:to-pepperoni text-white shadow-xl hover:shadow-2xl"
                    }`}
                  >
                    {isCheckoutLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        Processing Order...
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
    </div>
  );
};

export default CartPage;
