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
 const nk = data:image/jpeg;base64,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
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
          <RingLoader color="#ff860d" size={100} speedMultiplier={1.5} />
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
                src={user?.imageUrl || nk}
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
              className="w-full p-3 text-lg text-black transition-colors duration-200 bg-cheese rounded-md shadow-lg hover:bg-gray-800"
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
            className="w-full p-3 mt-2 text-lg text-black transition-colors duration-200 bg-cheese rounded-md shadow-lg"
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
                <RingLoader color="#ff860d" size={50} />
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
