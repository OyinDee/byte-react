import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaClock, FaCheck, FaShippingFast, FaCoins } from "react-icons/fa";
import { RingLoader } from "react-spinners";

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);

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
        const restaurantResponse = await axios.get(
          `https://bytee-13c6d30f0e92.herokuapp.com/api/v1/restaurants/${restaurantCustomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRestaurant(restaurantResponse.data);
        await fetchOrders(restaurantCustomId, token);
      } catch (error) {
        toast.error(
          error.response && error.response.data.message
            ? error.response.data.message
            : "Error fetching restaurant or orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantAndOrders();
  }, []);

  const handleWithdrawal = async () => {
    toast.info("Wait a minute...");
    if (!restaurant.walletBalance || isNaN(restaurant.walletBalance) || parseFloat(restaurant.walletBalance) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://bytee-13c6d30f0e92.herokuapp.com/api/v1/restaurants/withdraw",
        { restaurantName: restaurant.name, amount: parseFloat(restaurant.walletBalance) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast.error(
        error.response && error.response.data.message
          ? error.response.data.message
          : "Error processing withdrawal."
      );
    }
  };

  const fetchOrders = async (restaurantId, token) => {
    try {
      const response = await axios.get(
        `https://bytee-13c6d30f0e92.herokuapp.com/api/v1/orders/restaurant/${restaurantId}`,
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

  const updateOrderStatus = async (orderId, requestDescription, fee) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.patch(
        `https://bytee-13c6d30f0e92.herokuapp.com/api/v1/orders/${orderId}`,
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
        error.response && error.response.data.message
          ? error.response.data.message
          : "Error updating order status."
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
        `https://bytee-13c6d30f0e92.herokuapp.com/api/v1/restaurants/${restaurant.customId}/toggle-active`,
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
        error.response && error.response.data.message
          ? error.response.data.message
          : "Error toggling status."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center text-center z-10">
          <RingLoader color="#ff860d" size={100} speedMultiplier={1.5} />
        </div>
      </div>
    );
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
              className="w-20 h-20 object-cover rounded-sm border-2 border-black"
            />
            <div>
              <h1 className="text-4xl font-bold text-black">{restaurant.name}</h1>
              <p className="text-lg text-gray-700 mt-2">{restaurant.description}</p>
              <p className="text-md text-gray-600 mt-2">Location: {restaurant.location}</p>
              <p className="text-md text-gray-600">Contact: {restaurant.contactNumber}</p>
              <p className="text-md text-gray-600">Email: {restaurant.email}</p>
              <div className="flex-col items-center mt-4">
                <span className="mr-2">{restaurant.isActive ? "Your restaurant is currently open" : "The restaurant is closed"}</span>
                <div className="p-4">
  <button
    onClick={toggleActiveStatus}
    className={`px-4 py-2 w-full rounded-lg ${restaurant.isActive ? "bg-red-500": "bg-cheese"} text-white`}
  >
    {restaurant.isActive ? "Close" : "Open"}
  </button>
</div>
           </div>
            </div>
          </div>

          <div className="bg-gray-200 p-4 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-black">Total Income</h2>
            <p className="text-xl text-black mt-2">
              {restaurant?.walletBalance
                ? `₦${restaurant.walletBalance.toFixed(2)}`
                : "₦0.00"}
            </p>
            <button
              className="bg-cheese w-full py-2 mt-3 rounded-lg"
              onClick={handleWithdrawal}
            >
              Place Withdrawal
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-around border-b border-gray-300 mb-4">
          <TabButton
            icon={<FaClock />}
            label="Pending"
            isActive={activeTab === "Pending"}
            onClick={() => setActiveTab("Pending")}
          />
          <TabButton
            icon={<FaCheck />}
            label="Confirmed"
            isActive={activeTab === "Confirmed"}
            onClick={() => setActiveTab("Confirmed")}
          />
          <TabButton
            icon={<FaShippingFast />}
            label="Delivered"
            isActive={activeTab === "Delivered"}
            onClick={() => setActiveTab("Delivered")}
          />
          <TabButton
            icon={<FaCoins />}
            label="Fee Requested"
            isActive={activeTab === "Fee Requested"}
            onClick={() => setActiveTab("Fee Requested")}
          />
        </div>

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

          {orders.filter((order) => order.status === activeTab).length >
            visibleOrdersCount && (
            <button
              className="bg-gray-300 text-black p-2 rounded-lg mt-4 w-full"
              onClick={handleShowMore}
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    className={`flex items-center space-x-2 px-4 py-2 border-b-4 ${
      isActive ? "border-black text-black" : "border-transparent text-gray-500"
    }`}
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
          `https://bytee-13c6d30f0e92.herokuapp.com/api/v1/orders/deliver/${order.customId}`,
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
          error.response && error.response.data.message
            ? error.response.data.message
            : "Error marking order as delivered."
        );
        setIsDelivering(false);
      }
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold">Order: {order.customId}</h3>
          <p className="text-sm text-gray-600">Status: {order.status}</p>
        </div>
        <button
          className="text-sm text-gray-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4">
          <p>Location: {order.location}</p>
          <p>Phone Number: {order.phoneNumber}</p>
<p>Nearest Landmark: {order.nearestLandmark}</p>
          <div className="mt-2">
            <h3 className="text-black font-semibold">Meals:</h3>
            {order.meals.map(({ meal, quantity }, index) => (
              <p key={index} className="text-gray-700">
                {meal.name} - {quantity}x - ₦{meal.price}
              </p>
            ))}
          </div>

          <p className="text-gray-600">Note: {order.note}</p>
          <p className="text-gray-600">
            Ordered At: {new Date(order.createdAt).toLocaleString()}
          </p>

          {isPending && (
            <>
              <span className="text-black font-semibold">
                Total: ₦{((order.totalPrice) - (order.fee) || 0).toFixed(2)}
              </span>
              <div className="mt-4">
                <input
                  type="number"
                  placeholder="Enter fee"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="p-2 rounded-lg border border-gray-400 w-full mb-2"
                />
                <textarea
                  placeholder="Request description"
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  className="p-2 rounded-lg border border-gray-400 w-full mb-2"
                />
                <button
                  className="bg-cheese text-white p-2 rounded-lg w-full"
                  onClick={onRequest}
                  disabled={isRequesting}
                >
                  {isRequesting ? "Requesting..." : "Request Fee"}
                </button>
              </div>
            </>
          )}

          {isConfirmed && (
            <>
              <p className="text-black font-semibold">
                Total: ₦{order.totalPrice.toFixed(2)}
              </p>
              <button
                className="bg-black text-white p-2 rounded-lg w-full mt-4"
                onClick={markAsDelivered}
                disabled={isDelivering}
              >
                {isDelivering ? "Delivering..." : "Mark as Delivered"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
