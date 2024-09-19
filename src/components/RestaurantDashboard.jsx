import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Define your custom colors
const colors = {
  cheese: "#FFD700",
  pepperoni: "#FF6347",
  crust: "#8B4513",
  olive: "#000000",
  accentwhite: "#FFFFFF",
};

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setRestaurant(decodedToken.restaurant);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const totalIncome = restaurant?.totalIncome || 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6 pb-20">
      {restaurant && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-20 h-20 object-cover rounded-full border-4 border-crust"
            />
            <div>
              <h1 className="text-4xl font-bold text-crust">{restaurant.name}</h1>
              <p className="text-lg text-gray-700 mt-2">{restaurant.description}</p>
              <p className="text-md text-gray-600 mt-2">Location: {restaurant.location}</p>
              <p className="text-md text-gray-600">Contact: {restaurant.contactNumber}</p>
              <p className="text-md text-gray-600">Email: {restaurant.email}</p>
            </div>
          </div>

          <div className="bg-cheese p-4 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-olive">Total Income</h2>
            <p className="text-xl text-olive mt-2">
              {totalIncome > 0 ? `₦${totalIncome.toFixed(2)}` : "₦0.00"}
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-around border-b border-gray-300 mb-4">
          <button
            className={`px-4 py-2 border-b-4 ${
              activeTab === "Pending"
                ? "border-pepperoni text-crust"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => handleTabClick("Pending")}
          >
            Pending Orders
          </button>
          <button
            className={`px-4 py-2 border-b-4 ${
              activeTab === "Confirmed"
                ? "border-pepperoni text-crust"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => handleTabClick("Confirmed")}
          >
            Confirmed Orders
          </button>
          <button
            className={`px-4 py-2 border-b-4 ${
              activeTab === "Delivered"
                ? "border-pepperoni text-crust"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => handleTabClick("Delivered")}
          >
            Delivered Orders
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === "Pending" && (
            <>
              <OrderCard
                orderId="#O123"
                note="Please add extra sauce"
                totalPrice={25.0}
              />
              <OrderCard
                orderId="#O124"
                note="No onions, please"
                totalPrice={18.5}
              />
            </>
          )}
          {activeTab === "Confirmed" && (
            <>
              <OrderCard
                orderId="#O125"
                note="Extra cheese"
                totalPrice={30.0}
              />
            </>
          )}
          {activeTab === "Delivered" && (
            <>
              <OrderCard
                orderId="#O126"
                note="Gluten-free option"
                totalPrice={22.5}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ orderId, note, totalPrice }) => (
  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
    <p className="text-lg font-bold text-crust">Order ID: {orderId}</p>
    <p className="text-gray-600">Note: {note}</p>
    <p className="text-crust font-semibold">Total: ₦{totalPrice.toFixed(2)}</p>
  </div>
);

export default RestaurantDashboard;
