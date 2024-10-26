import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { RingLoader } from "react-spinners";

const CombinedPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mealSearchResults, setMealSearchResults] = useState([]);
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
    const results = restaurants
      .filter(restaurant => restaurant.isActive) // Only active restaurants
      .flatMap(restaurant =>
        restaurant.meals
          .filter(meal => meal.name.toLowerCase().includes(searchLower)
          )
          .map(meal => ({
            restaurant,
            meal
          }))
      );

    setMealSearchResults(results);
  };

  return (
    <div>
      <main className="min-h-screen p-4 pt-5 pb-20 text-black bg-white lg:p-8 lg:pt-5">
        <section className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for meals..."
              className="w-full p-2 border border-gray-300 rounded lg:w-1/2 focus:outline-none focus:ring focus:border-black"
            />
            <button
              onClick={handleSearch}
              className="p-2 text-white transition-colors duration-200 bg-black rounded hover:bg-gray-800"
            >
              Search
            </button>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-8 text-2xl font-semibold">Meals</h2>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-screen text-black bg-white">
              <RingLoader color="#ff860d" size={100} speedMultiplier={1.5} />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-screen text-red-500 bg-white">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {mealSearchResults.length > 0 ? (
                mealSearchResults.map(({ restaurant, meal }) => (
                  <div
                    key={meal.customId}
                    data-aos="fade-up"
                    className="bg-white border border-gray-200 rounded-lg shadow-md"
                  >
                    <div className="flex items-center p-4">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        width={80}
                        height={80}
                        className="object-cover w-20 h-20 rounded-full"
                      />
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-black">
                          {meal.name} at {restaurant.name}
                        </h2>
                        <p className="text-gray-600">{restaurant.description}</p>
                      </div>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="p-4">
                      <button
                        className="w-full p-2 mt-4 text-white transition-colors duration-200 bg-black rounded hover:bg-gray-800"
                        onClick={() =>
                          navigate(`/user/checkrestaurant/${restaurant.customId}`)
                        }
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  No meals found for the current search or all restaurants are unavailable.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CombinedPage;
