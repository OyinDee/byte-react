import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaImage, FaToggleOn, FaTimes, FaUtensils } from "react-icons/fa";
import { getBrandAssets } from "../utils/brandAssets";

const InlineLoader = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-4 border-pepperoni border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const MealsPage = () => {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    tag: "regular",
    price: "",
    per: "", 
    imageUrl: "",
    availability: true,
    required: false,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = async (mealId) => {
    if (window.confirm("Delete meal?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://mongobyte.vercel.app/api/v1/meals/${mealId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeals(meals.filter((meal) => meal._id !== mealId));
        toast.success("Meal deleted successfully!");
      } catch (error) {
        toast.error("Error deleting meal!");
      }
    }
  };

  const handleEdit = (meal) => {
    setForm({
      name: meal.name,
      description: meal.description || "",
      tag: meal.tag || "regular",
      price: meal.price.toString(),
      per: meal.per.toLowerCase() || "",  
      imageUrl: meal.imageUrl || "",  
      availability: meal.availability,
      required: meal.required || false,
    });
    setSelectedImage(null);  
    setEditingMealId(meal.customId);
    setIsEditing(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchMeals = async () => {
        setLoadingMeals(true);
        try {
          const response = await axios.get(
            'https://mongobyte.vercel.app/api/v1/meals/me',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setMeals(response.data);
        } catch (error) {
          toast.error("Error fetching meals!");
        }
        setLoadingMeals(false);
      };
      fetchMeals();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (base64Image) => {
    try {
      const response = await axios.post("https://mongobyte.vercel.app/api/v1/users/upload", {
        image: base64Image,
      });
      return response.data.url;
    } catch (error) {
      toast.error("Error uploading image!");
      throw error;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = form.imageUrl;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const restaurantId = decodedToken.restaurant._id;
      if (isEditing && editingMealId) {
        await axios.put(
          `https://mongobyte.vercel.app/api/v1/meals/${editingMealId}`,
          {
            ...form,
            price: Number(form.price),
            imageUrl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMeals(
          meals.map((meal) =>
            meal._id === editingMealId
              ? { ...meal, ...form, imageUrl, price: Number(form.price) }
              : meal
          )
        );
        setIsEditing(false);
        setEditingMealId(null);
        toast.success("Meal updated successfully!");
      } else {
        const response = await axios.post(
          `https://mongobyte.vercel.app/api/v1/meals/${restaurantId}/create`,
          {
            ...form,
            per: form.per.toLowerCase(),
            price: Number(form.price),
            imageUrl,
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setMeals([...meals, response.data.meal]);
        toast.success("Meal added successfully!");
      }
      setForm({
        name: "",
        description: "",
        tag: "regular",
        price: "",
        per: "",
        imageUrl: "",
        availability: true,
        required: false,
      });
      setSelectedImage(null);
    } catch (error) {
      toast.error("Error saving meal!");
    }
    setIsLoading(false);
  };

  const toggleAvailability = async (meal) => {
    toast.info("Wait...");
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/meals/${meal.customId}`,
        { availability: !meal.availability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMeals(
        meals.map((m) =>
          m._id === meal._id ? { ...m, availability: !m.availability } : m
        )
      );
      toast.success(`Meal marked as ${meal.availability ? "Unavailable" : "Available"}!`);
    } catch (error) {
      toast.error("Failed to update availability!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-crust mb-2">
            Manage Your <span className="text-pepperoni">Menu</span>
          </h1>
          <p className="text-gray-600">Add, edit, and manage your restaurant's delicious offerings</p>
        </div>

        {/* Add New Meal Button */}
        <div className="mb-8 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-6 py-3 bg-pepperoni text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FaPlus className="mr-2" />
            {showAddForm ? "Cancel" : "Add New Meal"}
          </motion.button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || isEditing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-crust">
                  {isEditing ? "Update Meal" : "Add New Meal"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setIsEditing(false);
                    setForm({
                      name: "",
                      description: "",
                      tag: "regular",
                      price: "",
                      per: "",
                      imageUrl: "",
                      availability: true,
                      required: false,
                    });
                    setSelectedImage(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent transition-all duration-300"
                      placeholder="Enter meal name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (NGN) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent transition-all duration-300"
                    placeholder="Describe your meal..."
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="tag"
                      value={form.tag}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent transition-all duration-300"
                    >
                      <option value="regular">Regular</option>
                      <option value="combo">Combo</option>
                      <option value="add-on">Add-On</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <input
                      type="text"
                      name="per"
                      value={form.per}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent transition-all duration-300"
                      placeholder="slice, unit, pack"
                    />
                    <small className="text-gray-500 text-xs mt-1 block">
                      e.g., slice, 5 pieces, unit, pack, spoon, scoop, cup
                    </small>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={form.availability ? "true" : "false"}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          availability: e.target.value === "true",
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pepperoni focus:border-transparent transition-all duration-300"
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Item
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-xl flex items-center">
                      <input
                        type="checkbox"
                        id="required-checkbox"
                        name="required"
                        checked={form.required}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            required: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 text-pepperoni border-gray-300 rounded focus:ring-pepperoni"
                      />
                      <label htmlFor="required-checkbox" className="ml-2 block text-sm text-gray-700">
                        Mark as required item (e.g., takeaway containers)
                      </label>
                    </div>
                    <small className="text-gray-500 text-xs mt-1 block">
                      Required items will be automatically added to the customer's cart
                    </small>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-pepperoni transition-colors duration-300">
                    <div className="space-y-1 text-center">
                      <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-pepperoni hover:text-pepperoni/80">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  {(selectedImage || form.imageUrl) && (
                    <div className="mt-4">
                      <img 
                        src={selectedImage || form.imageUrl} 
                        alt="Meal preview" 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-pepperoni text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    isEditing ? "Update Meal" : "Add Meal"
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Meals List */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-crust">
              Your Menu <span className="text-pepperoni">({meals.length} items)</span>
            </h2>
          </div>

          {loadingMeals ? (
            <div className="flex justify-center py-12">
              <InlineLoader />
            </div>
          ) : meals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FaUtensils className="mx-auto text-gray-300 text-6xl mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No meals yet</h3>
              <p className="text-gray-500">Add your first meal to get started!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal, index) => (
                <motion.div
                  key={meal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <img 
                      src={meal.imageUrl || getBrandAssets().fallbackMealImage} 
                      alt={meal.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        meal.availability 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {meal.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-cheese text-crust text-xs font-medium rounded-full">
                        {meal.tag}
                      </span>
                    </div>
                    {meal.required && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                          Required
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-crust mb-2">{meal.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {meal.description || "No description provided"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-2xl font-bold text-pepperoni">
                          ₦{Number(meal.price).toLocaleString()}
                        </span>
                        {meal.per && (
                          <span className="text-gray-500 text-sm ml-1">per {meal.per}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleAvailability(meal)}
                        className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          meal.availability 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        <FaToggleOn className="inline mr-1" />
                        {meal.availability ? 'Disable' : 'Enable'}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(meal)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-300"
                      >
                        <FaEdit />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(meal.customId)}
                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300"
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealsPage;
