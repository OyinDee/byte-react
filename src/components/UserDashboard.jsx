import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import LoadingPage from "./Loader";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { 
  FaSearch, 
  FaStar, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUtensils, 
  FaFire, 
  FaBolt,
  FaCrown
} from "react-icons/fa";

const CombinedPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const byteUser = localStorage.getItem('byteUser');
    if (byteUser) {
      setUser(JSON.parse(byteUser));
    }

    AOS.init({ duration: 1000, once: true });
    AOS.refresh();

    const fetchRestaurants = async () => {
      try {
        const userObj = byteUser ? JSON.parse(byteUser) : null;
        const universityId = userObj?.university;
        
        // If user has a university, filter restaurants by it
        const url = universityId 
          ? `https://mongobyte.onrender.com/api/v1/restaurants?university=${universityId}`
          : "https://mongobyte.onrender.com/api/v1/restaurants";
          
        const response = await axios.get(url);
        const restaurantsData = response.data.data || response.data;
        
        // Randomize order for variety
        const sortedRestaurants = [...restaurantsData];
        for (let i = sortedRestaurants.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sortedRestaurants[i], sortedRestaurants[j]] = [sortedRestaurants[j], sortedRestaurants[i]];
        }
        
        setRestaurants(sortedRestaurants);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <main className="container mx-auto px-4 py-6 pt-16 md:pt-24 pb-24 md:pb-8 lg:px-8 lg:py-8">
        
        {/* Hero Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            {/* Main Hero */}
            <div className="relative bg-gradient-to-r from-pepperoni via-red-600 to-orange-600 rounded-3xl p-8 md:p-12 mb-8 overflow-hidden shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 text-6xl">🍕</div>
                <div className="absolute top-8 right-8 text-4xl">🍔</div>
                <div className="absolute bottom-4 left-8 text-5xl">🍟</div>
                <div className="absolute bottom-8 right-4 text-3xl">🥤</div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">🍽️</div>
              </div>
              
              <div className="relative z-10">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl md:text-6xl font-bold text-white mb-4 font-secondary"
                >
                  Welcome back, <span className="text-cheese">{user?.username || 'Foodie'}</span>! 👋
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-sans leading-relaxed"
                >
                  Ready to satisfy those cravings? Let's discover something absolutely delicious! 🤤
                </motion.p>
                
                {/* Quick Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex flex-wrap justify-center gap-4 mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/user/cart')}
                    className="bg-white text-pepperoni px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <FaUtensils />
                    View Cart
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/user/orders')}
                    className="bg-cheese text-crust px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <FaClock />
                    Order History
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>


          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants or meals... 🔍"
                className="block w-full pl-12 pr-4 py-5 border-2 border-orange-200 rounded-3xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-4 focus:ring-pepperoni/20 focus:border-pepperoni text-lg shadow-xl transition-all duration-300 font-sans"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {/* Find Food button removed as per user request */}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Restaurants Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-crust mb-4 font-secondary">
              Discover <span className="text-pepperoni">Amazing</span> Restaurants 🌟
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
              Hand-picked restaurants serving the most delicious meals on campus
            </p>
          </motion.div>
          
          {loading ? (
            <LoadingPage />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-96 text-center"
            >
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl p-12 max-w-lg shadow-xl">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h3>
                <p className="text-red-500 text-lg mb-6">{error}</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()} 
                  className="px-8 py-4 bg-gradient-to-r from-pepperoni to-red-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300"
                >
                  Try Again 🔄
                </motion.button>
              </div>
            </motion.div>
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 + index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -12, scale: 1.02 }}
                    className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-3xl border-2 ${
                      restaurant.isActive ? "border-orange-100 hover:border-orange-200" : "border-gray-200 opacity-60"
                    }`}
                  >
                    {/* Restaurant Header */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                          restaurant.isActive 
                            ? "bg-green-500 text-white" 
                            : "bg-red-500 text-white"
                        }`}>
                          {restaurant.isActive ? "🟢 Open Now" : "🔴 Closed"}
                        </span>
                      </div>

                      {/* Popular Badge */}
                      {index < 3 && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                            <FaCrown className="text-xs" />
                            Popular
                          </span>
                        </div>
                      )}
                      
                      {/* Restaurant Title Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 font-secondary">{restaurant.name}</h3>
                        <div className="flex items-center text-white/90 text-sm gap-4">
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            <span>Campus Delivery</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaClock />
                            <span>15-30 min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Restaurant Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span className="text-gray-800 font-bold">4.{Math.floor(Math.random() * 4) + 5}</span>
                          </div>
                          <span className="text-gray-500 text-sm">({Math.floor(Math.random() * 900) + 100}+ reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                          <FaBolt />
                          Fast
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 line-clamp-2 font-sans leading-relaxed">{restaurant.description}</p>
                      
                      {/* Popular Items */}
                      {filteredMeals.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FaFire className="text-orange-500" />
                            Popular items:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {filteredMeals.slice(0, 3).map((meal) => (
                              <span
                                key={meal.customId}
                                className="px-3 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200"
                              >
                                {meal.name}
                              </span>
                            ))}
                            {filteredMeals.length > 3 && (
                              <span className="px-3 py-2 bg-gradient-to-r from-pepperoni/10 to-red-100 text-pepperoni rounded-full text-sm font-bold cursor-pointer hover:bg-pepperoni/20 transition-colors border border-pepperoni/20">
                                +{filteredMeals.length - 3} more dishes
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${
                          restaurant.isActive 
                            ? "bg-gradient-to-r from-pepperoni via-red-500 to-orange-500 text-white hover:shadow-2xl hover:from-red-600 hover:to-orange-600" 
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleRestaurantClick(restaurant)}
                      >
                        {restaurant.isActive ? (
                          <div className="flex items-center justify-center gap-2">
                            <FaUtensils />
                            View Delicious Menu
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <FaClock />
                            Currently Closed
                          </div>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {/* No Results */}
          {!loading && !error && filteredRestaurants.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-3xl p-12 max-w-lg mx-auto shadow-xl border-2 border-gray-200">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No restaurants found</h3>
                <p className="text-gray-500 text-lg mb-6">Try adjusting your search terms or check back later</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("")}
                  className="bg-gradient-to-r from-pepperoni to-orange-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Clear Search
                </motion.button>
              </div>
            </motion.div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CombinedPage;
