import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { RingLoader } from "react-spinners";

const CombinedPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantSearchResults, setRestaurantSearchResults] = useState([]);
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
        
        const sortedRestaurants = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        
        setRestaurants(sortedRestaurants);
      } catch {
        setError("Error fetching restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRestaurants();
  }, []);
  

  const handleSearch = () => {
    const searchLower = searchQuery.toLowerCase();
    const restaurantResults = restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(searchLower) ||
        restaurant.meals.some((meal) =>
          meal.name.toLowerCase().includes(searchLower)
        )
    );

    setRestaurantSearchResults(restaurantResults);
  };

  return (
    <div>
      <main className="p-4 lg:p-8 bg-white text-black pt-5 pb-20 min-h-screen lg:pt-5">
        <section className="mb-6">
          <div className="flex justify-center items-center space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants or meals..."
              className="p-2 w-full lg:w-1/2 rounded border border-gray-300 focus:outline-none focus:ring focus:border-black"
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-8">Restaurants</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
              <RingLoader
                color="#000000" // black color for the loader
                size={100}
                speedMultiplier={1.5}
              />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-screen bg-white text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {(searchQuery ? restaurantSearchResults : restaurants).map(
                (restaurant) => (
                  <div
                    key={restaurant.customId}
                    data-aos="fade-up"
                    className="bg-white shadow-md rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center p-4">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-full"
                      />
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-black">
                          {restaurant.name}
                        </h2>
                        <p className="text-gray-600">
                          {restaurant.description}
                        </p>
                      </div>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="p-4">
                      {restaurant.meals.length > 0 ? (
                        <ul className="list-disc pl-5 text-black">
                          {restaurant.meals.slice(0, 3).map((meal) => (
                            <li key={meal.customId}>{meal.name}</li>
                          ))}
                          {restaurant.meals.length > 3 && (
                            <li className="text-gray-500">
                              ...there&apos;s more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <div className="text-gray-500">
                          No meals available for this restaurant.
                        </div>
                      )}
                      {restaurant.meals.length > 0 && (
                        <button
                          className="mt-4 p-2 w-full bg-black text-white rounded hover:bg-gray-800 transition-colors duration-200"
                          onClick={() =>
                            navigate(
                              `/user/checkrestaurant/${restaurant.customId}`
                            )
                          }
                        >
                          Check Restaurant
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CombinedPage;
