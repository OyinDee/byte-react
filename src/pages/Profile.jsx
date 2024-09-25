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
            "https://mongobyte.vercel.app/api/v1/users/getProfile",
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
        "https://mongobyte.vercel.app/api/v1/users/upload",
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
        "https://mongobyte.vercel.app/api/v1/users/updateProfile",
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
        <div className="flex flex-col items-center text-center z-10">
          <RingLoader color="#FFD700" size={100} speedMultiplier={1.5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-5 pb-20 bg-white text-black">
      <div className="relative z-10 flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <div className="flex flex-col items-center text-center relative">
            <div className="relative">
              <img
                src={user?.imageUrl || "/Images/nk.jpg"}
                alt="ProfilePicture"
                className="rounded-full border-4 border-black mb-4 object-cover"
                style={{ width: 150, height: 150 }}
              />
            </div>
            <h1 className="text-3xl font-bold mb-2 lg:text-4xl">
              @{user?.username.toLowerCase()}
            </h1>
            <p className="text-lg text-gray-700 mb-2 lg:text-xl">
              {user?.email}
            </p>

            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
              {user?.bio || "Life is uncertain. Eat dessert first!"}
            </blockquote>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h2 className="text-xl font-semibold mb-2">Phone Number</h2>
              <p className="text-lg">{user?.phoneNumber}</p>
            </div>
            <div className="mb-4 lg:mb-0">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-lg">{user?.location || "Unknown"}</p>
            </div>
            <div className="mb-4 lg:mb-0">
              <h2 className="text-xl font-semibold mb-2">Nearest Landmark</h2>
              <p className="text-lg">{user?.nearestLandmark || "N/A"}</p>
            </div>
            <div className="flex flex-col lg:flex-row lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-xl font-semibold mb-2">Total Bytes</h2>
                <p className="text-lg">{user?.orderHistory.length}</p>
              </div>
              <div className="mb-4 lg:mb-0">
                <h2 className="text-xl font-semibold mb-2">Byte Balance</h2>
                <p className="text-lg">{user?.byteBalance}</p>
              </div>
          </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={openModal}
              className="bg-black text-white w-full text-lg p-3 rounded-md shadow-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Edit Profile
            </button>
          </div>
      <button
            onClick={() => navigate('/user/orderhistory')}
            className="bg-yellow-500 text-black w-full text-lg p-3 mt-2  rounded-md shadow-lg  transition-colors duration-200"
          >
            Check Order History
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative z-60">
            <h2 className="text-2xl mb-4">Edit Profile</h2>
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
              className="border border-gray-300 p-2 w-full mb-4"
            />
            <input
              type="text"
              placeholder="Update your location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-gray-300 p-2 w-full mb-4"
            />
            <input
              type="text"
              placeholder="Nearest Landmark"
              value={nearestLandmark}
              onChange={(e) => setNearestLandmark(e.target.value)}
              className="border border-gray-300 p-2 w-full mb-4"
            />

            {/* Loader during update */}
            {updateLoading ? (
              <div className="flex justify-center">
                <RingLoader color="#FFD700" size={50} />
              </div>
            ) : (
              <button
                onClick={updateUserProfile}
                className="bg-black text-white p-2 rounded-sm hover:bg-gray-800 transition-colors duration-200 ml-3"
              >
                Save Changes
              </button>
            )}

            <button
              onClick={closeModal}
              className="text-red-500 mt-4 hover:text-red-700"
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
