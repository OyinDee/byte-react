import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/cartContext";
import LoadingPage from '../components/Loader';
import { 
  FaStar, 
  FaClock, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart, 
  FaUtensils,
  FaFire,
  FaLeaf,
  FaHeart,
  FaCrown,
  FaChevronDown,
  FaTag
} from "react-icons/fa";

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState({
    regular: false,
    combo: true,
    "add-on": true,
  });

  useEffect(() => {
    if (id) {
      const fetchRestaurant = async () => {
        try {
          const response = await axios.get(
            `https://mongobyte.vercel.app/api/v1/users/restdetails/${id}`
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

  const getSectionIcon = (section) => {
    switch (section) {
      case 'regular':
        return <FaUtensils className="text-orange-500" />;
      case 'combo':
        return <FaCrown className="text-yellow-500" />;
      case 'add-on':
        return <FaPlus className="text-green-500" />;
      default:
        return <FaUtensils className="text-gray-500" />;
    }
  };

  const getSectionTitle = (section) => {
    switch (section) {
      case 'regular':
        return 'Main Dishes';
      case 'combo':
        return 'Combo Meals';
      case 'add-on':
        return 'Add-ons & Extras';
      default:
        return section.charAt(0).toUpperCase() + section.slice(1);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 pt-16 md:pt-24 pb-24 md:pb-6">
      <ToastContainer position="top-right" />
      
      {restaurant && (
        <>
          {/* Restaurant Hero Section */}
          <div className="relative h-80 md:h-96 overflow-hidden">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Restaurant Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                      restaurant.isActive 
                        ? "bg-green-500 text-white" 
                        : "bg-red-500 text-white"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${restaurant.isActive ? "bg-white" : "bg-white"}`}></div>
                      {restaurant.isActive ? "Open Now" : "Closed"}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-bold mb-4 font-secondary">
                    {restaurant.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-white/90 mb-4">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt />
                      <span>{restaurant.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaPhone />
                      <span>{restaurant.contactNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock />
                      <span>15-30 min delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar />
                      <span>4.{Math.floor(Math.random() * 4) + 5} rating</span>
                    </div>
                  </div>
                  
                  <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
                    {restaurant.description || "Delicious meals crafted with love, delivered fresh to your doorstep."}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-4 font-secondary">
                Our <span className="text-orange-600">Delicious</span> Menu
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore our carefully crafted selection of meals, combos, and add-ons
              </p>
            </motion.div>

            <div className="space-y-8">
              {["regular", "combo", "add-on"].map((section, sectionIndex) => (
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + sectionIndex * 0.1 }}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                >
                  {/* Section Header */}
                  <button
                    className="w-full p-6 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between hover:from-orange-50 hover:to-red-50 transition-all duration-300"
                    onClick={() => toggleSection(section)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-full shadow-lg">
                        {getSectionIcon(section)}
                      </div>
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-gray-800">
                          {getSectionTitle(section)}
                        </h3>
                        <p className="text-gray-600">
                          {filteredMeals(section).length} item{filteredMeals(section).length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: collapsedSections[section] ? 0 : 180 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-600 text-xl"
                    >
                      <FaChevronDown />
                    </motion.div>
                  </button>

                  {/* Section Content */}
                  <AnimatePresence>
                    {!collapsedSections[section] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0">
                          {filteredMeals(section).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredMeals(section).map((meal, index) => (
                                <MealCard
                                  key={meal.customId}
                                  meal={meal}
                                  restaurantId={restaurant.customId}
                                  hideImage={section === "add-on"}
                                  index={index}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <div className="text-6xl mb-4">🍽️</div>
                              <h4 className="text-xl font-semibold text-gray-600 mb-2">
                                No items in this category
                              </h4>
                              <p className="text-gray-500">
                                Check other categories for delicious options!
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MealCard = ({ meal, restaurantId, hideImage, index }) => {
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

  const getRandomBadge = () => {
    const badges = [
      { icon: FaFire, text: "Popular", color: "bg-red-500" },
      { icon: FaHeart, text: "Favorite", color: "bg-pink-500" },
      { icon: FaLeaf, text: "Fresh", color: "bg-green-500" },
      { icon: FaCrown, text: "Premium", color: "bg-yellow-500" }
    ];
    return badges[Math.floor(Math.random() * badges.length)];
  };

  const badge = index < 2 ? getRandomBadge() : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`bg-white rounded-2xl shadow-xl overflow-hidden border transition-all duration-300 hover:shadow-2xl ${
        !meal.availability 
          ? "opacity-60 border-gray-200" 
          : "border-orange-100 hover:border-orange-200"
      }`}
    >
      {/* Meal Image */}
      {!hideImage && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={meal.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} 
            alt={meal.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Badge */}
          {badge && (
            <div className={`absolute top-3 left-3 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
              <badge.icon className="text-xs" />
              {badge.text}
            </div>
          )}

          {/* Availability Overlay */}
          {!meal.availability && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>
      )}

      {/* Meal Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 font-secondary">
            {meal.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {meal.description || "Deliciously prepared with fresh ingredients"}
          </p>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-orange-600">
              ₦{meal.price.toFixed(2)}
            </span>
            {meal.per && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                per {meal.per}
              </span>
            )}
          </div>
          
          {!meal.availability && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
              <FaTag />
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          {/* Quantity Selector */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-gray-100 rounded-2xl overflow-hidden">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrease}
                className="p-3 hover:bg-gray-200 transition-colors duration-200"
                disabled={!meal.availability}
              >
                <FaMinus className="text-gray-600" />
              </motion.button>
              
              <div className="px-6 py-3 min-w-[60px] text-center">
                <span className="text-lg font-bold text-gray-800">{quantity}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrease}
                className="p-3 hover:bg-gray-200 transition-colors duration-200"
                disabled={!meal.availability}
              >
                <FaPlus className="text-gray-600" />
              </motion.button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: meal.availability ? 1.02 : 1 }}
            whileTap={{ scale: meal.availability ? 0.98 : 1 }}
            onClick={handleAddToCart}
            disabled={!meal.availability}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              meal.availability
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FaShoppingCart />
            {meal.availability ? "Add to Cart" : "Unavailable"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantPage;
