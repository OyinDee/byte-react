import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  BuildingStorefrontIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  UserIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import LoadingPage from "../../components/Loader";
import { toast } from "react-toastify";
import { FaUpload, FaCheckCircle } from "react-icons/fa";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState({
    name: "",
    email: "",
    description: "",
    location: "",
    contactNumber: "",
    isActive: true,
    university: "",
    bankName: "",
    accountNumber: "",
    accountHolder: ""
  });
  const [universities, setUniversities] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    withMenu: 0
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    email: "",
    university: "",
    location: "",
    description: "",
    contactNumber: "",
    imageUrl: "",
    bankName: "",
    accountNumber: "",
    accountHolder: ""
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsRestaurant, setDetailsRestaurant] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedCreateImage, setSelectedCreateImage] = useState(null);
  const [selectedEditImage, setSelectedEditImage] = useState(null);

  useEffect(() => {
    fetchRestaurants();
    fetchUniversities();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://mongobyte.vercel.app/api/v1/restaurants",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setRestaurants(response.data);
      
      // Calculate stats
      const stats = {
        total: response.data.length,
        active: response.data.filter(r => r.isActive).length,
        inactive: response.data.filter(r => !r.isActive).length,
        withMenu: response.data.filter(r => Array.isArray(r.meals) && r.meals.length > 0).length
      };
      
      setStats(stats);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axios.get("https://mongobyte.vercel.app/api/v1/universities");
      setUniversities(response.data.data);
    } catch (error) {
      console.error("Error fetching universities:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditedRestaurant({
      name: restaurant.name,
      email: restaurant.email,
      description: restaurant.description || "",
      location: restaurant.location || "",
      contactNumber: restaurant.contactNumber || "",
      isActive: restaurant.isActive,
      university: restaurant.university || "",
      bankName: restaurant.bankName || "",
      accountNumber: restaurant.accountNumber || "",
      accountHolder: restaurant.accountHolder || ""
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDeleteModalOpen(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedRestaurant({
      ...editedRestaurant,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedEditImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      let imageUrl = editedRestaurant.imageUrl;
      if (selectedEditImage) {
        imageUrl = await uploadImage(selectedEditImage);
      }
      await axios.put(
        `https://mongobyte.vercel.app/api/v1/restaurants/${selectedRestaurant._id}`,
        { ...editedRestaurant, imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      setRestaurants(restaurants.map(restaurant => 
        restaurant._id === selectedRestaurant._id 
          ? { ...restaurant, ...editedRestaurant, imageUrl } 
          : restaurant
      ));
      if (selectedRestaurant.isActive !== editedRestaurant.isActive) {
        setStats({
          ...stats,
          active: editedRestaurant.isActive 
            ? stats.active + 1 
            : stats.active - 1,
          inactive: editedRestaurant.isActive 
            ? stats.inactive - 1 
            : stats.inactive + 1
        });
      }
      setIsEditModalOpen(false);
      setSelectedEditImage(null);
      toast.success("Restaurant updated successfully");
    } catch (error) {
      toast.error("Failed to update restaurant");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://mongobyte.vercel.app/api/v1/restaurants/${selectedRestaurant._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update the restaurants list
      setRestaurants(restaurants.filter(restaurant => restaurant._id !== selectedRestaurant._id));
      
      // Update stats
      setStats({
        ...stats,
        total: stats.total - 1,
        active: selectedRestaurant.isActive ? stats.active - 1 : stats.active,
        inactive: selectedRestaurant.isActive ? stats.inactive : stats.inactive - 1,
        withMenu: (selectedRestaurant.menu && selectedRestaurant.menu.length > 0) 
          ? stats.withMenu - 1 
          : stats.withMenu
      });
      
      setIsDeleteModalOpen(false);
      toast.success("Restaurant deleted successfully");
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      toast.error("Failed to delete restaurant");
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant({
      ...newRestaurant,
      [name]: value
    });
  };

  const handleCreateImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedCreateImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateRestaurant = async () => {
    try {
      const token = localStorage.getItem("token");
      let imageUrl = newRestaurant.imageUrl;
      if (selectedCreateImage) {
        imageUrl = await uploadImage(selectedCreateImage);
      }
      await axios.post(
        "https://mongobyte.vercel.app/api/v1/restaurants/create",
        { ...newRestaurant, imageUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Restaurant created successfully");
      setIsCreateModalOpen(false);
      setNewRestaurant({
        name: "",
        email: "",
        university: "",
        location: "",
        description: "",
        contactNumber: "",
        imageUrl: "",
        bankName: "",
        accountNumber: "",
        accountHolder: ""
      });
      setSelectedCreateImage(null);
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to create restaurant");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://mongobyte.vercel.app/api/v1/restaurants/${id}/toggle-active`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Status updated");
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleViewDetails = async (id) => {
    setDetailsLoading(true);
    setIsDetailsModalOpen(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/restaurants/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDetailsRestaurant(response.data);
    } catch (error) {
      toast.error("Failed to fetch details");
      setDetailsRestaurant(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const uploadImage = async (imageData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://mongobyte.vercel.app/api/v1/users/upload",
        { image: imageData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data.url;
    } catch (error) {
      toast.error("Image upload failed");
      throw error;
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchLower) ||
      restaurant.email.toLowerCase().includes(searchLower) ||
      restaurant.location?.toLowerCase().includes(searchLower) ||
      restaurant.description?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all registered restaurants
            </p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <button 
              onClick={fetchRestaurants} 
              className="flex items-center gap-2 bg-cheese hover:bg-yellow-500 text-crust py-2 px-4 rounded-lg transition-colors shadow-md"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="flex items-center gap-2 bg-pepperoni hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors shadow-md"
            >
              <BuildingStorefrontIcon className="w-5 h-5" />
              Add New
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-cheese"
          >
            <div className="font-medium text-gray-500 text-sm">Total Restaurants</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-400"
          >
            <div className="font-medium text-gray-500 text-sm">Active</div>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-400"
          >
            <div className="font-medium text-gray-500 text-sm">Inactive</div>
            <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-md border-l-4 border-blue-400"
          >
            <div className="font-medium text-gray-500 text-sm">With Menu Items</div>
            <div className="text-2xl font-bold text-gray-900">{stats.withMenu}</div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cheese focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Restaurants List */}
        {filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No restaurants found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? "Try different search terms" : "There are no restaurants registered yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="flex">
                  <div className="w-1/3 bg-gray-100 p-4 flex items-center justify-center">
                    {restaurant.imageUrl ? (
                      <img 
                        src={restaurant.imageUrl} 
                        alt={restaurant.name} 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <BuildingStorefrontIcon className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="w-2/3 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {restaurant.name}
                          {restaurant.isActive ? (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-green-300 flex items-center gap-1">
                              <CheckCircleIcon className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full border border-red-300 flex items-center gap-1">
                              <XCircleIcon className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Joined: {format(new Date(restaurant.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => handleViewDetails(restaurant._id)}
                          className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                          title="View Details"
                        >
                          <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEditRestaurant(restaurant)}
                          className="p-1 text-gray-500 hover:text-pepperoni rounded-full hover:bg-gray-100"
                          title="Edit Restaurant"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteRestaurant(restaurant)}
                          className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                          title="Delete Restaurant"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(restaurant._id)}
                          className={`p-1 rounded-full ${restaurant.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                          title={restaurant.isActive ? "Deactivate" : "Activate"}
                        >
                          {restaurant.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      <p className="text-sm flex items-center gap-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{restaurant.email}</span>
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{restaurant.contactNumber || "No phone number"}</span>
                      </p>
                      <p className="text-sm flex items-start gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600">{restaurant.location || "No location specified"}</span>
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {universities.find(u => u._id === restaurant.university)?.name || "No university"}
                        </span>
                      </p>
                      <p className="text-sm flex items-center gap-2">
                        <BanknotesIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {restaurant.bankName && restaurant.accountNumber && restaurant.accountHolder ? (
                            <>
                              {restaurant.bankName} - {restaurant.accountNumber} ({restaurant.accountHolder})
                            </>
                          ) : "No bank details"}
                        </span>
                      </p>
                    </div>
                    
                    <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="text-xs text-gray-500">
                        {Array.isArray(restaurant.meals) ? restaurant.meals.length : 0} menu items
                      </span>
                      {Array.isArray(restaurant.orders) && restaurant.orders.length > 0 ? (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {restaurant.orders.length} orders processed
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                          No orders yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Restaurant Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 bg-cheese rounded-t-xl">
              <h3 className="text-xl font-bold text-crust">Edit Restaurant</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo/Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedEditImage || editedRestaurant.imageUrl || "https://res.cloudinary.com/dol47ucmj/image/upload/v1729928426/jm9dfybhu5pqqevrhyke.jpg"}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-cheese"
                    />
                    {selectedEditImage && (
                      <div className="absolute -top-2 -right-2 bg-pepperoni text-white p-1 rounded-full">
                        <FaCheckCircle className="text-xs" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                      id="restaurant-edit-upload"
                    />
                    <label
                      htmlFor="restaurant-edit-upload"
                      className="cursor-pointer bg-orange-50 hover:bg-orange-100 text-crust font-medium py-2 px-4 rounded-xl border-2 border-dashed border-cheese hover:border-pepperoni transition-all flex items-center justify-center gap-2"
                    >
                      <FaUpload />
                      Choose Logo
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  value={editedRestaurant.name}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedRestaurant.email}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editedRestaurant.description}
                  onChange={handleEditInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editedRestaurant.location}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={editedRestaurant.contactNumber}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <select
                  name="university"
                  value={editedRestaurant.university}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                >
                  <option value="">Select University</option>
                  {universities.map(university => (
                    <option key={university._id} value={university._id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={editedRestaurant.bankName || ''}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={editedRestaurant.accountNumber || ''}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                <input
                  type="text"
                  name="accountHolder"
                  value={editedRestaurant.accountHolder || ''}
                  onChange={handleEditInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={editedRestaurant.isActive}
                  onChange={handleEditInputChange}
                  className="h-4 w-4 text-cheese border-gray-300 rounded focus:ring-cheese"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active Status
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitEdit}
                  className="px-4 py-2 bg-cheese text-crust rounded-lg shadow-sm hover:bg-yellow-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 bg-red-500 rounded-t-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6" />
                Confirm Deletion
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the restaurant <span className="font-semibold">{selectedRestaurant?.name}</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600 transition-colors"
                >
                  Delete Restaurant
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Restaurant Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 bg-cheese rounded-t-xl">
              <h3 className="text-xl font-bold text-crust">Create Restaurant</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo/Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedCreateImage || newRestaurant.imageUrl || "https://res.cloudinary.com/dol47ucmj/image/upload/v1729928426/jm9dfybhu5pqqevrhyke.jpg"}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-cheese"
                    />
                    {selectedCreateImage && (
                      <div className="absolute -top-2 -right-2 bg-pepperoni text-white p-1 rounded-full">
                        <FaCheckCircle className="text-xs" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCreateImageChange}
                      className="hidden"
                      id="restaurant-create-upload"
                    />
                    <label
                      htmlFor="restaurant-create-upload"
                      className="cursor-pointer bg-orange-50 hover:bg-orange-100 text-crust font-medium py-2 px-4 rounded-xl border-2 border-dashed border-cheese hover:border-pepperoni transition-all flex items-center justify-center gap-2"
                    >
                      <FaUpload />
                      Choose Logo
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  name="name"
                  value={newRestaurant.name}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newRestaurant.email}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newRestaurant.description}
                  onChange={handleCreateInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newRestaurant.location}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={newRestaurant.contactNumber}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  value={newRestaurant.bankName || ''}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={newRestaurant.accountNumber || ''}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                <input
                  type="text"
                  name="accountHolder"
                  value={newRestaurant.accountHolder || ''}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <select
                  name="university"
                  value={newRestaurant.university}
                  onChange={handleCreateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cheese focus:border-transparent"
                >
                  <option value="">Select University</option>
                  {universities.map(university => (
                    <option key={university._id} value={university._id}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRestaurant}
                  className="px-4 py-2 bg-cheese text-crust rounded-lg shadow-sm hover:bg-yellow-500 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 bg-blue-400 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">Restaurant Details</h3>
            </div>
            <div className="p-6 space-y-4">
              {detailsLoading ? (
                <div className="text-center">Loading...</div>
              ) : detailsRestaurant ? (
                <div>
                  <div className="mb-2">
                    <strong>Name:</strong> {detailsRestaurant.name}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {detailsRestaurant.email}
                  </div>
                  <div className="mb-2">
                    <strong>Description:</strong> {detailsRestaurant.description}
                  </div>
                  <div className="mb-2">
                    <strong>Location:</strong> {detailsRestaurant.location}
                  </div>
                  <div className="mb-2">
                    <strong>Contact Number:</strong> {detailsRestaurant.contactNumber}
                  </div>
                  <div className="mb-2">
                    <strong>University:</strong> {universities.find(u => u._id === detailsRestaurant.university)?.name || "No university"}
                  </div>
                  <div className="mb-2">
                    <strong>Image:</strong> {detailsRestaurant.imageUrl ? <img src={detailsRestaurant.imageUrl} alt="Restaurant" className="w-32 h-20 object-cover rounded" /> : "No image"}
                  </div>
                  <div className="mb-2">
                    <strong>Active:</strong> {detailsRestaurant.isActive ? "Yes" : "No"}
                  </div>
                  <div className="mb-2">
                    <strong>Created At:</strong> {detailsRestaurant.createdAt ? format(new Date(detailsRestaurant.createdAt), "MMM d, yyyy") : "-"}
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-500">No details found.</div>
              )}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
