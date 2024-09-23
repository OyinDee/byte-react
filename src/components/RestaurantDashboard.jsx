import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Loader from "./Loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaCheck, FaShippingFast, FaCoins } from "react-icons/fa"; 

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setRestaurant(decodedToken.restaurant);
        fetchOrders(decodedToken.restaurant.customId, token);
      } catch (error) {
        setLoading(false);
        toast.error("Failed to decode token.");
      }
    } else {
      setLoading(false);
      toast.error("Token not found.");
    }
  }, []);

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
      const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      setOrders([]);
      toast.error("Error fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
      fetchOrders(restaurant.customId, token);
      toast.success(response.data.message);
    } catch (error) {
      fetchOrders(restaurant.customId, token);
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Error updating order status."
      );
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-white p-6 pb-20">
      <ToastContainer />
      {restaurant && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-20 h-20 object-cover rounded-full border-2 border-black"
            />
            <div>
              <h1 className="text-4xl font-bold text-black">{restaurant.name}</h1>
              <p className="text-lg text-gray-700 mt-2">{restaurant.description}</p>
              <p className="text-md text-gray-600 mt-2">Location: {restaurant.location}</p>
              <p className="text-md text-gray-600">Contact: {restaurant.contactNumber}</p>
              <p className="text-md text-gray-600">Email: {restaurant.email}</p>
            </div>
          </div>

          <div className="bg-gray-200 p-4 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-black">Total Income</h2>
            <p className="text-xl text-black mt-2">
              {restaurant?.totalIncome ? `₦${restaurant.totalIncome.toFixed(2)}` : "₦0.00"}
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-around border-b border-gray-300 mb-4">
          <TabButton
            icon={<FaClock />}
            label="Pending"
            isActive={activeTab === "Pending"}
            onClick={() => handleTabClick("Pending")}
          />
          <TabButton
            icon={<FaCheck />}
            label="Confirmed"
            isActive={activeTab === "Confirmed"}
            onClick={() => handleTabClick("Confirmed")}
          />
          <TabButton
            icon={<FaShippingFast />}
            label="Delivered"
            isActive={activeTab === "Delivered"}
            onClick={() => handleTabClick("Delivered")}
          />
          <TabButton
            icon={<FaCoins />}
            label="Fee Requested"
            isActive={activeTab === "Fee Requested"}
            onClick={() => handleTabClick("Fee Requested")}
          />
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            orders
              .filter((order) => order.status === activeTab)
              .map((order) => (
                <OrderCard
                  key={order.customId}
                  order={order}
                  isPending={order.status === "Pending"}
                  isConfirmed={order.status === "Confirmed"}
                  updateOrderStatus={updateOrderStatus}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-2 border-b-4 ${isActive ? "border-black text-black" : "border-transparent text-gray-500"}`}
    onClick={onClick}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

const OrderCard = ({ order, isPending, isConfirmed, updateOrderStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fees, setFees] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const onRequest = async () => {
    if (isPending && fees) {
      setIsRequesting(true);
      await updateOrderStatus(order.customId, requestDescription, fees);
      setIsRequesting(false);
    }
  };

  const markAsDelivered = async () => {
    if (isConfirmed) {
      await updateOrderStatus(order.customId);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md border border-gray-300">
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold text-black">Order ID: {order.customId}</p>
        <button
          className="text-sm font-semibold text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Hide Details" : "View Details"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4">
          <p className="text-black font-semibold">Total: ₦{(order.totalPrice * 10).toFixed(2)}</p>
          <div className="text-gray-600">
            <p>Location: {order.location}</p>
            <p>Phone Number: {order.phoneNumber}</p>
            <p>Status: {order.status}</p>

            <div className="mt-2">
              <h3 className="text-black font-semibold">Meals:</h3>
              {order.meals.map(({ meal, quantity }, index) => (
                <p key={index} className="text-gray-700">
                  {meal.name} - {quantity}x
                </p>
              ))}
            </div>

            <p className="text-gray-600">Note: {order.note || "No special requests"}</p>
          </div>

          {isPending && (
            <div className="mt-4 space-y-4">
              <input
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                placeholder="Transport and other fees in naira"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder="Request description (e.g., Just for transport)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                className="w-full bg-black text-white px-4 py-2 rounded-lg"
                onClick={onRequest}
                disabled={isRequesting}
              >
                {isRequesting ? "Requesting..." : "Request"}
              </button>
            </div>
          )}

          {isConfirmed && (
            <button
              className="w-full bg-black text-white px-4 py-2 mt-4 rounded-lg"
              onClick={markAsDelivered}
            >
              Mark as Delivered
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
