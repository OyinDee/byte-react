import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../context/cartContext"; 
import Loader from '../components/Loader';

const RestaurantPage = () => {
  const { id } = useParams(); 
  const [restaurant, setRestaurant] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState({
    regular: false,
    combo: false,
    "add-on": false,
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
          console.error("Error fetching restaurant details:", error);
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

  if (loading)
    return (
     <Loader/>
    );

  return (
    <div className="p-4 bg-white min-h-screen">
      <ToastContainer />
      <div className="max-w-4xl mx-auto text-black">
        {restaurant && (
          <>
            <div className="flex justify-between items-center mb-4">
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
                    className="rounded w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {["regular", "combo", "add-on"].map((section) => (
              <div key={section}>
                <button
                  className="w-full text-left py-2 bg-black text-white px-4 rounded-md mb-2"
                  onClick={() => toggleSection(section)}
                >
                  {section.toUpperCase()} MEALS
                </button>
                {!collapsedSections[section] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMeals(section).map((meal) => (
                      <MealCard
                        key={meal.customId}
                        meal={meal}
                        restaurantId={restaurant.customId}
                      />
                    ))}
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

const MealCard = ({ meal, restaurantId }) => {
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
    <div className="border rounded-lg p-4 shadow-md">
      <img src={meal.imageUrl} alt="" className="w-full h-40 object-cover" />
      <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
      <p className="text-lg font-bold mb-2">B{meal.price.toFixed(2)}</p>
      <div className="flex items-center mb-4">
        <button
          onClick={handleDecrease}
          className="bg-black text-white py-1 px-2 rounded-l hover:bg-gray-800"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={quantity}
          readOnly
          className="w-16 p-2 border-t border-b border-gray-300 text-center"
        />
        <button
          onClick={handleIncrease}
          className="bg-black text-white py-1 px-2 rounded-r hover:bg-gray-800"
        >
          +
        </button>
        <button
          onClick={handleAddToCart}
          className="bg-black w-full ml-4 text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default RestaurantPage;
