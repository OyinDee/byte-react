import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/cartContext";
import Loader from '../components/Loader';

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState({
    regular: true,
    combo: true,
    "add-on": true,
  });

  useEffect(() => {
    if (id) {
      const fetchRestaurant = async () => {
        try {
          const response = await axios.get(
            `https://mongobyte.onrender.com/api/v1/users/restdetails/${id}`
          );
          setRestaurant(response.data);
        } catch (error) {
          toast.error("Error fetching restaurant details.");
        } finally {
          setLoading(false);
        }
      };
      fetchRestaurant();
    }
  }, [id]);

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filteredMeals = (tag) => {
    return restaurant?.meals.filter((meal) => meal.tag === tag) || [];
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen p-4 mb-20 bg-white">
      <ToastContainer />
      <div className="max-w-4xl mx-auto text-black">
        {restaurant && (
          <>
            <div className="flex items-center justify-between mb-20">
              <div>
                <h1 className="text-3xl font-bold text-black">
                  {restaurant.name}
                </h1>
                <p className="text-gray-700">{restaurant.location}</p>
                <p className="text-gray-500">{restaurant.contactNumber}</p>
              </div>
              {restaurant.imageUrl && (
                <div className="relative w-20 h-20">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="object-cover w-full h-full rounded"
                  />
                </div>
              )}
            </div>

            {["regular", "combo", "add-on"].map((section) => (
              <div key={section}>
                <button
                  className="flex justify-between w-full px-4 py-2 mb-2 text-white bg-black rounded-md"
                  onClick={() => toggleSection(section)}
                >
                  <span>{section.toUpperCase()}</span>
                  <span>{collapsedSections[section] ? "▼" : "▲"}</span>
                </button>

                {!collapsedSections[section] && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMeals(section).length > 0 ? (
                      filteredMeals(section).map((meal) => (
                        <MealCard
                          key={meal.customId}
                          meal={meal}
                          restaurantId={restaurant.customId}
                          hideImage={section === "add-on"}
                        />
                      ))
                    ) : (
                      <p className="col-span-full text-center text-gray-500">
                        No meals in this category, check other categories.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const MealCard = ({ meal, restaurantId, hideImage }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    addToCart({ ...meal, restaurantId }, quantity);
    toast.success(`${meal.name} (x${quantity}) added to cart!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className={`border rounded-lg p-4 shadow-md ${!meal.availability ? "opacity-50" : ""}`}>
      {!hideImage && (
        <img src={meal.imageUrl} alt="" className="object-cover w-full h-40" />
      )}
      <h3 className="mb-2 text-xl font-semibold">{meal.name}</h3>
      <span>{meal.description}</span>
      {!meal.availability && (
        <p className="text-red-500 font-semibold">Unavailable</p>
      )}
      <p className="mb-2 text-lg font-bold">
        &#8358;{meal.price.toFixed(2)}
        {meal.per && (
          <span className="text-sm font-normal"> per {meal.per}</span>
        )}
      </p>
      <div className="flex items-center mb-4">
        <button
          onClick={handleDecrease}
          className="px-2 py-1 text-white bg-black rounded-l hover:bg-gray-800"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={quantity}
          readOnly
          className="w-16 p-2 text-center border-t border-b border-gray-300"
        />
        <button
          onClick={handleIncrease}
          className="px-2 py-1 text-white bg-black rounded-r hover:bg-gray-800"
        >
          +
        </button>
        <button
          onClick={handleAddToCart}
          className="w-full px-4 py-2 ml-4 text-white bg-black rounded hover:bg-gray-800"
          disabled={!meal.availability}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default RestaurantPage;
