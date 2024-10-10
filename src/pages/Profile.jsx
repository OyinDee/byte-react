import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { RingLoader } from "react-spinners";
import {useNavigate} from 'react-router-dom'
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="z-10 flex flex-col items-center text-center">
          <RingLoader color="#FFD700" size={100} speedMultiplier={1.5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-5 pb-20 text-black bg-white">
      <div className="relative z-10 flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-4xl p-8 mx-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="relative flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={user?.imageUrl || "/Images/nk.jpg"}
                alt="ProfilePicture"
                className="object-cover mb-4 border-4 border-black rounded-full"
                style={{ width: 150, height: 150 }}
              />
            </div>
            <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
              @{user?.username.toLowerCase()}
            </h1>
            <p className="mb-2 text-lg text-gray-700 lg:text-xl">
              {user?.email}
            </p>

            <blockquote className="pl-4 italic text-gray-600 border-l-4 border-gray-300">
              {user?.bio || "Life is uncertain. Eat dessert first!"}
            </blockquote>
          </div>

          <div className="flex flex-col mt-6 lg:flex-row lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="mb-2 text-xl font-semibold">Phone Number</h2>
              <p className="text-lg">{user?.phoneNumber}</p>
            </div>
            <div className="mb-4 lg:mb-0">
              <h2 className="mb-2 text-xl font-semibold">Location</h2>
              <p className="text-lg">{user?.location || "Unknown"}</p>
            </div>
            <div className="mb-4 lg:mb-0">
              <h2 className="mb-2 text-xl font-semibold">Nearest Landmark</h2>
              <p className="text-lg">{user?.nearestLandmark || "N/A"}</p>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h2 className="mb-2 text-xl font-semibold">Total Bytes</h2>
                <p className="text-lg">{user?.orderHistory.length}</p>
              </div>
              <div className="mb-4 lg:mb-0">
                <h2 className="mb-2 text-xl font-semibold">Balance</h2>
                <p className="text-lg"> &#8358;{user?.byteBalance}</p>
              </div>
          </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={openModal}
              className="w-full p-3 text-lg text-black transition-colors duration-200 bg-yellow-500 rounded-md shadow-lg hover:bg-gray-800"
            >
              Edit Profile
            </button>
          </div>
      <button
            onClick={() => navigate('/user/orderhistory')}
            className="w-full p-3 mt-2 text-lg text-white transition-colors duration-200 bg-black rounded-md shadow-lg"
          >
            Check Order History
          </button>
          <button
            onClick={() => navigate('/user/fund')}
            className="w-full p-3 mt-2 text-lg text-black transition-colors duration-200 bg-yellow-500 rounded-md shadow-lg"
          >
            Fund
          </button>
          <button
            onClick={() => handleLogout()}
            className="w-full p-3 mt-2 text-lg text-white transition-colors duration-200 bg-black rounded-md shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-lg p-8 bg-white rounded-lg shadow-lg z-60">
            <h2 className="mb-4 text-2xl">Edit Profile</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-4"
            />
            <input
              type="text"
              placeholder="Update your bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300"
            />
            <input
              type="text"
              placeholder="Update your location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300"
            />
            <input
              type="text"
              placeholder="Nearest Landmark"
              value={nearestLandmark}
              onChange={(e) => setNearestLandmark(e.target.value)}
              className="w-full p-2 mb-4 border border-gray-300"
            />

            {/* Loader during update */}
            {updateLoading ? (
              <div className="flex justify-center">
                <RingLoader color="#FFD700" size={50} />
              </div>
            ) : (
              <button
                onClick={updateUserProfile}
                className="p-2 ml-3 text-white transition-colors duration-200 bg-black rounded-sm hover:bg-gray-800"
              >
                Save Changes
              </button>
            )}

            <button
              onClick={closeModal}
              className="mt-4 text-red-500 hover:text-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
