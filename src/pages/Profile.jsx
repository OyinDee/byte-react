import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { RingLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, 
  FaEdit, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaWallet, 
  FaHistory, 
  FaSignOutAlt,
  FaCamera,
  FaQuoteLeft,
  FaCoins,
  FaShoppingBag
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
const Profile = () => {
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [nearestLandmark, setNearestLandmark] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false); 
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(
            "https://mongobyte.onrender.com/api/v1/users/getProfile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const decodedToken = jwtDecode(response.data.token);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("byteUser", JSON.stringify(decodedToken.user));
          setUser(decodedToken.user);
          setBio(decodedToken.user.bio || "");
          setLocation(decodedToken.user.location || "");
          setNearestLandmark(decodedToken.user.nearestLandmark || "");
          setLoading(false);
        } catch (error) {
          setError("Failed to load user data. Please try again later.");
          setLoading(false);
        }
      } else {
        setError("No user token found. Please log in.");
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("byteUser");
    navigate('/')
  };
  
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    try {
      const response = await axios.post(
        "https://mongobyte.onrender.com/api/v1/users/upload",
        { image: selectedImage }
      );
      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const updateUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUpdateLoading(true); 
    try {
      let imageUrl = user?.imageUrl;
      if (selectedImage) {
        imageUrl = await handleImageUpload();
      }

      const data = await axios.post(
        "https://mongobyte.onrender.com/api/v1/users/updateProfile",
        { imageUrl, bio, location, nearestLandmark },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem('token', data.data.token)
      setUser((prevUser) => ({
        ...prevUser,
        imageUrl,
        bio,
        location,
        nearestLandmark,
      }));
      setIsModalOpen(false);
      setUpdateLoading(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
      setUpdateLoading(false); 
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-crust to-crust/90">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center"
        >
          <RingLoader color="#FCD34D" size={100} speedMultiplier={1.5} />
          <p className="mt-6 text-cheese font-semibold text-lg">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-2xl shadow-lg"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-r from-crust to-crust/90 rounded-3xl overflow-hidden shadow-2xl mb-8"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative inline-block mb-6"
            >
              <img
                src={user?.imageUrl || "https://res.cloudinary.com/dol47ucmj/image/upload/v1729928426/jm9dfybhu5pqqevrhyke.jpg"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-cheese shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-cheese p-2 rounded-full shadow-lg">
                <FaCamera className="text-crust text-sm" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-2 font-secondary"
            >
              @{user?.username}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-cheese/90 text-lg mb-4 flex items-center justify-center gap-2"
            >
              <FaEnvelope className="text-sm" />
              {user?.email}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto"
            >
              <FaQuoteLeft className="text-cheese mb-2" />
              <p className="italic text-white/90 font-sans">
                "{user?.bio || "Life is uncertain. Eat dessert first!"}"
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <FaCoins className="text-3xl text-yellow-500 mx-auto mb-3" />
            <p className="text-2xl font-bold text-crust">₦{user?.byteBalance}</p>
            <p className="text-sm text-gray-600 font-sans">Balance</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <FaShoppingBag className="text-3xl text-pepperoni mx-auto mb-3" />
            <p className="text-2xl font-bold text-crust">{user?.orderHistory.length}</p>
            <p className="text-sm text-gray-600 font-sans">Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <FaPhone className="text-3xl text-green-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-crust">{user?.phoneNumber}</p>
            <p className="text-sm text-gray-600 font-sans">Phone</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-lg text-center border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <FaMapMarkerAlt className="text-3xl text-blue-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-crust truncate">{user?.location || "Not set"}</p>
            <p className="text-xs text-gray-600 font-sans">Location</p>
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-crust mb-4 flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-500" />
              Location Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 font-sans">Current Location</p>
                <p className="font-semibold text-crust">{user?.location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-sans">Nearest Landmark</p>
                <p className="font-semibold text-crust">{user?.nearestLandmark || "Not specified"}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-bold text-crust mb-4 flex items-center gap-3">
              <FaUser className="text-purple-500" />
              Account Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-600">Active Account</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-600">Verified User</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
            className="bg-gradient-to-r from-cheese to-yellow-400 text-crust font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <FaEdit />
            Edit Profile
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/user/orderhistory')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <FaHistory />
            Order History
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/user/fund')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <FaWallet />
            Fund Account
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          >
            <FaSignOutAlt />
            Logout
          </motion.button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-crust to-crust/90 p-6 text-white">
                <h2 className="text-2xl font-bold font-secondary">Edit Profile</h2>
                <p className="text-cheese/80 text-sm">Update your information</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-crust mb-2">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cheese focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-crust mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cheese focus:border-transparent resize-none font-sans"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-crust mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cheese focus:border-transparent font-sans"
                    placeholder="Your current location..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-crust mb-2">Nearest Landmark</label>
                  <input
                    type="text"
                    value={nearestLandmark}
                    onChange={(e) => setNearestLandmark(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cheese focus:border-transparent font-sans"
                    placeholder="Nearest landmark for delivery..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  {updateLoading ? (
                    <div className="flex-1 flex justify-center py-3">
                      <RingLoader color="#FCD34D" size={40} />
                    </div>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={updateUserProfile}
                        className="flex-1 bg-gradient-to-r from-cheese to-yellow-400 text-crust font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Save Changes
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeModal}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-200"
                      >
                        Cancel
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
