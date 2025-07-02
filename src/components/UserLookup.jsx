import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

const UserLookup = ({ onUserFound, onUserNotFound, onClear }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');

  const checkUser = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `https://mongobyte.vercel.app/api/v1/users/delivery-info/${username.trim()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const userData = response.data.user;
      setUserInfo(userData);
      if (typeof onUserFound === 'function') {
        onUserFound(userData);
      }
      
    } catch (error) {
      console.error('Error checking user:', error);
      if (error.response?.status === 404) {
        setError('User not found. Please check the username and try again.');
        if (typeof onUserNotFound === 'function') {
          onUserNotFound('User not found');
        }
      } else if (error.response?.status === 400) {
        setError('Username is required');
        if (typeof onUserNotFound === 'function') {
          onUserNotFound('Username is required');
        }
      } else {
        setError('Error checking user. Please try again.');
        if (typeof onUserNotFound === 'function') {
          onUserNotFound('Error checking user');
        }
      }
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setUsername('');
    setUserInfo(null);
    setError('');
    if (typeof onClear === 'function') {
      onClear();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 mb-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-crust mb-2 flex items-center gap-2">
          <FaUser className="text-blue-600" />
          Order for Someone Else? 🎁
        </h3>
        <p className="text-gray-600 text-sm">
          Enter their username to check if they're available for delivery
        </p>
      </div>

      <div className="space-y-4">
        {/* Username Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkUser()}
            placeholder="Enter username (e.g., john_doe)"
            className="block w-full pl-10 pr-20 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base font-sans"
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {userInfo ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearSelection}
                className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-all duration-200"
              >
                <FaTimes />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={checkUser}
                disabled={loading || !username.trim()}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  loading || !username.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Checking...
                  </div>
                ) : (
                  'Find User'
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-red-600">
              <FaExclamationTriangle />
              <span className="font-semibold">{error}</span>
            </div>
          </motion.div>
        )}

        {/* User Information Card */}
        {userInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-2xl" />
                  <div>
                    <h4 className="text-xl font-bold">User Found! ✅</h4>
                    <p className="text-green-100">@{userInfo.username}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  userInfo.hasDeliveryInfo 
                    ? 'bg-green-400 text-green-900' 
                    : 'bg-yellow-400 text-yellow-900'
                }`}>
                  {userInfo.hasDeliveryInfo ? 'Ready to Order' : 'Needs Info'}
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaMapMarkerAlt className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Location</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {userInfo.location || (
                      <span className="text-red-500 text-sm">Not saved - you'll need to provide</span>
                    )}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FaPhone className="text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Phone</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    {userInfo.phoneNumber || (
                      <span className="text-red-500 text-sm">Not saved - you'll need to provide</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FaBuilding className="text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Nearest Landmark</span>
                </div>
                <p className="text-gray-800 font-medium">
                  {userInfo.nearestLandmark || (
                    <span className="text-gray-500 text-sm">Not saved - optional</span>
                  )}
                </p>
              </div>

              {/* Status Information */}
              <div className={`rounded-lg p-4 border-2 ${
                userInfo.hasDeliveryInfo 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {userInfo.hasDeliveryInfo ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaExclamationTriangle className="text-yellow-600" />
                  )}
                  <span className={`font-bold ${
                    userInfo.hasDeliveryInfo ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {userInfo.hasDeliveryInfo 
                      ? 'Complete delivery information available!' 
                      : 'Missing delivery information'
                    }
                  </span>
                </div>
                <p className={`text-sm ${
                  userInfo.hasDeliveryInfo ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {userInfo.hasDeliveryInfo 
                    ? 'You can proceed with the order using their saved delivery details.'
                    : 'You\'ll need to provide the missing information when placing the order.'
                  }
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearSelection}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Choose Different User
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserLookup;
