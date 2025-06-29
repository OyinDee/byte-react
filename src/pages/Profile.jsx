import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { RingLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import LoadingPage from "../components/Loader";
import { 
  FaEdit, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaWallet, 
  FaHistory, 
  FaSignOutAlt,
  FaCamera,
  FaQuoteLeft,
  FaCheckCircle,
  FaTimes,
  FaUpload,
  FaUser,
  FaCrown
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
  const [showSuccess, setShowSuccess] = useState(false);
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

      const data = await axios.put(
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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
    setSelectedImage(null);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 py-6 px-4 pt-20 md:pt-24 pb-24 md:pb-6">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <FaCheckCircle />
            <span>Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        {/* Profile Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-crust rounded-3xl overflow-hidden shadow-2xl mb-8"
        >
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Profile Image Section */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative group"
              >
                <div className="relative">
                  <img
                    src={user?.imageUrl || "https://res.cloudinary.com/dol47ucmj/image/upload/v1729928426/jm9dfybhu5pqqevrhyke.jpg"}
                    alt="Profile"
                    className="w-40 h-40 lg:w-48 lg:h-48 rounded-full object-cover border-4 border-cheese shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-pepperoni p-4 rounded-full shadow-lg border-2 border-white">
                    <FaCamera className="text-white text-lg" />
                  </div>
                  {user?.role === 'VIP' && (
                    <div className="absolute -top-2 -left-2 bg-cheese p-2 rounded-full shadow-lg border-2 border-white">
                      <FaCrown className="text-crust text-sm" />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Profile Info Section */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-cheese text-xl mb-2 font-secondary tracking-wider">Byte's Foodie Card</h2>
                  <h1 className="text-4xl lg:text-6xl font-bold mb-3 font-secondary text-cheese">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <div className="text-xl text-white/90 mb-4 flex items-center justify-center lg:justify-start gap-2">
                    <FaUser className="text-lg" />
                    @{user?.username}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6"
                >
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                    <FaQuoteLeft className="text-cheese" />
                    <span className="text-cheese font-semibold">Bio</span>
                  </div>
                  <p className="text-white/90 font-sans text-lg leading-relaxed">
                    {user?.bio || "Food enthusiast and taste explorer"}
                  </p>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6"
                >
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white">
                    <FaEnvelope className="text-cheese text-sm" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white">
                    <FaPhone className="text-cheese text-sm" />
                    <span className="text-sm font-medium">{user?.phoneNumber}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-cheese"
          >
            <div className="text-2xl font-bold text-crust mb-1">₦{user?.byteBalance}</div>
            <p className="text-sm font-secondary text-gray-600 font-bold">BALANCE</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 shadow-xl border-l-4 border-pepperoni"
          >
            <div className="text-2xl font-bold text-crust mb-1">{user?.orderHistory?.length || 0}</div>
            <p className="text-sm text-gray-600 font-secondary font-bold">ORDERS</p>
          </motion.div>

        </div>

        {/* Delivery Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 mb-8 shadow-xl"
        >
          <h3 className="text-2xl font-bold text-crust mb-6 text-center flex items-center justify-center gap-3">
            <FaMapMarkerAlt className="text-pepperoni" />
            Delivery Information
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-orange-50 rounded-2xl p-6 shadow-md border-l-4 border-cheese"
            >
              <h4 className="font-bold text-crust mb-3 flex items-center gap-2">
                Current Location
              </h4>
              <p className="text-gray-700 font-medium">
                {user?.location || "Please set your location"}
              </p>
              {!user?.location && (
                <p className="text-pepperoni text-sm mt-2">
                  Add location for faster delivery
                </p>
              )}
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-orange-50 rounded-2xl p-6 shadow-md border-l-4 border-cheese"
            >
              <h4 className="font-bold text-crust mb-3 flex items-center gap-2">
                Nearest Landmark
              </h4>
              <p className="text-gray-700 font-medium">
                {user?.nearestLandmark || "Add a landmark"}
              </p>
              {!user?.nearestLandmark && (
                <p className="text-pepperoni text-sm mt-2">
                  Help us locate you easily
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openModal}
            className="flex-1 bg-crust text-white font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-lg hover:bg-gray-900 transition-all"
          >
            <FaEdit className="text-cheese" />
            Edit Profile
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/user/fund')}
            className="flex-1 bg-cheese text-crust font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-lg hover:bg-yellow-400 transition-all"
          >
            <FaWallet />
            Add Funds
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/user/orderhistory')}
            className="flex-1 bg-pepperoni text-white font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-lg hover:bg-red-700 transition-all"
          >
            <FaHistory />
            Order History
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex-1 bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-lg hover:bg-gray-300 transition-all"
          >
            <FaSignOutAlt />
            Sign Out
          </motion.button>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-crust p-6 text-white relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                >
                  <FaTimes />
                </button>
                <h2 className="text-2xl font-bold text-cheese">Edit Profile</h2>
                <p className="text-white/80 text-sm">Update your information</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-semibold text-crust mb-3">Profile Picture</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={selectedImage || user?.imageUrl || "https://res.cloudinary.com/dol47ucmj/image/upload/v1729928426/jm9dfybhu5pqqevrhyke.jpg"}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-4 border-cheese"
                      />
                      {selectedImage && (
                        <div className="absolute -top-2 -right-2 bg-pepperoni text-white p-1 rounded-full">
                          <FaCheckCircle className="text-xs" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label
                        htmlFor="profile-upload"
                        className="cursor-pointer bg-orange-50 hover:bg-orange-100 text-crust font-medium py-3 px-4 rounded-xl border-2 border-dashed border-cheese hover:border-pepperoni transition-all flex items-center justify-center gap-2"
                      >
                        <FaUpload />
                        Choose Photo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-crust mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cheese focus:border-transparent resize-none hover:border-cheese transition-colors"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {bio.length}/200 characters
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-crust mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cheese focus:border-transparent hover:border-cheese transition-colors"
                    placeholder="Your delivery location..."
                  />
                </div>

                {/* Nearest Landmark */}
                <div>
                  <label className="block text-sm font-semibold text-crust mb-2">Nearest Landmark</label>
                  <input
                    type="text"
                    value={nearestLandmark}
                    onChange={(e) => setNearestLandmark(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cheese focus:border-transparent hover:border-cheese transition-colors"
                    placeholder="Nearby landmark..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {updateLoading ? (
                    <div className="flex-1 flex justify-center py-4">
                      <RingLoader color="#FCD34D" size={40} />
                    </div>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={updateUserProfile}
                        className="flex-1 bg-cheese text-crust font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                      >
                        <FaCheckCircle />
                        Save
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={closeModal}
                        className="px-6 py-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-semibold transition-all rounded-xl flex items-center gap-2"
                      >
                        <FaTimes />
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