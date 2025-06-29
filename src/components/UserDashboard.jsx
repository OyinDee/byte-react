import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { RingLoader } from "react-spinners";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { FaSearch, FaStar, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { BRAND_NAME } from "../utils/brandAssets";

const CombinedPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    AOS.refresh();

    const fetchRestaurants = async () => {
      try {
        const response = await axios.get(
          "https://mongobyte.onrender.com/api/v1/restaurants"
        );
        const sortedRestaurants = response.data.slice();
        for (let i = sortedRestaurants.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sortedRestaurants[i], sortedRestaurants[j]] = [sortedRestaurants[j], sortedRestaurants[i]];
        }
        setRestaurants(sortedRestaurants);
      } catch {
        setError("Error fetching restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchLower) ||
      restaurant.meals.some(
        (meal) =>
          meal.tag !== "add-on" &&
          meal.name.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleRestaurantClick = (restaurant) => {
    if (!restaurant.isActive) {
      toast.warn("This restaurant is unavailable, you won't be able to place an order.");
    }
    navigate(`/user/checkrestaurant/${restaurant.customId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <main className="container mx-auto px-4 py-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-crust mb-4">
              Welcome to <span className="text-pepperoni">{BRAND_NAME}</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing restaurants and delicious meals delivered right to your door
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for restaurants or meals..."
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-pepperoni focus:border-transparent text-lg shadow-lg transition-all duration-300 font-sans"
              />
            </div>
          </div>
        </section>

        {/* Restaurants Section */}
        <section>
          <h2 className="text-3xl font-bold text-crust mb-8 font-secondary">
            Available <span className="text-pepperoni">Restaurants</span>
          </h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-96 text-pepperoni">
              <RingLoader color="#990000" size={100} speedMultiplier={1.5} />
              <p className="mt-4 text-lg text-gray-600 font-sans">Finding delicious restaurants...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-96 text-center">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
                <p className="text-red-600 text-lg">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-6 py-3 bg-pepperoni text-white rounded-full hover:bg-opacity-90 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map((restaurant, index) => {
                const filteredMeals = restaurant.meals.filter(
                  (meal) => meal.tag !== "add-on"
                );

                for (let i = filteredMeals.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [filteredMeals[i], filteredMeals[j]] = [filteredMeals[j], filteredMeals[i]];
                }

                return (
                  <motion.div
                    key={restaurant.customId}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    whileHover={{ y: -8 }}
                    className={`bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      !restaurant.isActive ? "opacity-60" : ""
                    }`}
                  >
                    {/* Restaurant Header */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          restaurant.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {restaurant.isActive ? "Open" : "Closed"}
                        </span>
                      </div>
                      
                      {/* Restaurant Title Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{restaurant.name}</h3>
                        <div className="flex items-center text-white/90 text-sm">
                          <FaMapMarkerAlt className="mr-1" />
                          <span>Campus Delivery</span>
                          <FaClock className="ml-3 mr-1" />
                          <span>15-30 min</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Restaurant Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <FaStar className="text-cheese mr-1" />
                          <span className="text-gray-700 font-medium">4.{Math.floor(Math.random() * 4) + 5}</span>
                          <span className="text-gray-500 ml-1">({Math.floor(Math.random() * 900) + 100}+)</span>
                        </div>
                        <span className="text-gray-600 text-sm">Fast delivery</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{restaurant.description}</p>
                      
                      {/* Popular Items */}
                      {filteredMeals.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Popular items:</h4>
                          <div className="flex flex-wrap gap-2">
                            {filteredMeals.slice(0, 3).map((meal) => (
                              <span
                                key={meal.customId}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              >
                                {meal.name}
                              </span>
                            ))}
                            {filteredMeals.length > 3 && (
                              <span className="px-3 py-1 bg-pepperoni/10 text-pepperoni rounded-full text-sm cursor-pointer hover:bg-pepperoni/20 transition-colors">
                                +{filteredMeals.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                          restaurant.isActive 
                            ? "bg-pepperoni text-white hover:bg-opacity-90 shadow-lg hover:shadow-xl" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleRestaurantClick(restaurant)}
                      >
                        {restaurant.isActive ? "View Menu" : "Currently Closed"}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* No Results */}
          {!loading && !error && filteredRestaurants.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants found</h3>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CombinedPage;
