import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingPage from "../components/Loader";
import { useUniversities } from "../context/universitiesContext";
import { BRAND_NAME } from "../utils/brandAssets";

const RestaurantSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [otherUniversity, setOtherUniversity] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { universities, loading: universitiesLoading } = useUniversities();

  const validateForm = () => {
    const newErrors = [];

    if (!name.trim()) {
      newErrors.push("Restaurant name is required.");
    }
    if (!email.trim()) {
      newErrors.push("Email is required.");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push("Email address is invalid.");
    }
    if (!password.trim()) {
      newErrors.push("Password is required.");
    }
    if (password !== confirmPassword) {
      newErrors.push("Passwords do not match.");
    }
    if (!phoneCode.trim()) {
      newErrors.push("Phone code is required.");
    }
    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      newErrors.push("Phone number must be 10 digits long.");
    }
    if (!description.trim()) {
      newErrors.push("Restaurant description is required.");
    }
    if (!otherUniversity && !universityId) {
      newErrors.push("Please select your university.");
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (otherUniversity) {
      toast.info("Byte! is reaching your university soon! Please contact us via byte.chows@gmail.com");
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const fullPhoneNumber = `${phoneCode}${phoneNumber}`;

      await axios.post("https://mongobyte.onrender.com/api/v1/restaurants/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        phoneNumber: fullPhoneNumber,
        description: description.trim(),
        university: universityId, // Send the university ID
        isActive: false // Restaurants start as inactive until approved
      });
      navigate("/restaurant/login");
      toast.success("Registration successful! Please wait for admin approval.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response) {
          const { data } = response;
          setErrors([data.message || "An error occurred. Please try again."]);
        } else {
          setErrors(["Network error. Please check your connection."]);
        }
      } else if (error instanceof Error) {
        setErrors([error.message || "An error occurred. Please try again."]);
      } else {
        setErrors(["An unexpected error occurred."]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-olive">
      <div className="absolute inset-0">
        <img
          src="/Images/1.jpg" 
          alt="Restaurant Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>

      {isLoading && <LoadingPage />}

      <div
        className={`relative z-10 flex items-center justify-center min-h-screen py-12 ${
          isLoading ? "hidden" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-40 backdrop-blur-sm p-8 rounded-lg shadow-lg w-full max-w-md mx-4"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-accentwhite font-secondary">
            Register Your Restaurant with {BRAND_NAME}
          </h2>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-pepperoni text-white rounded-lg">
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="mb-2">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-black p-3 border border-gray-300 rounded-lg font-sans"
              placeholder="Restaurant Name"
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black p-3 border border-gray-300 rounded-lg font-sans"
              placeholder="Email Address"
              required
            />
          </div>

          <div className="flex mb-4">
            <input
              type="text"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              className="w-1/3 p-3 border text-black border-gray-300 rounded-l-lg font-sans"
              placeholder="+234"
              required
            />
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-2/3 p-3 border text-black border-gray-300 rounded-r-lg font-sans"
              placeholder="80XXXXXXXX"
              required
            />
          </div>

          <div className="mb-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-black p-3 border border-gray-300 rounded-lg font-sans"
              placeholder="Restaurant Description"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <select
              value={universityId}
              onChange={(e) => {
                const value = e.target.value;
                setUniversityId(value);
                setOtherUniversity(value === "other");
              }}
              className="w-full p-3 border text-black border-gray-300 rounded-lg font-sans"
              required
              disabled={universitiesLoading}
            >
              <option value="">Select your university...</option>
              {universitiesLoading ? (
                <option value="" disabled>Loading universities...</option>
              ) : (
                universities.map((uni) => (
                  <option key={uni._id} value={uni._id}>
                    {uni.name}
                  </option>
                ))
              )}
              <option value="other">Other</option>
            </select>
          </div>

          {otherUniversity && (
            <div className="mb-4 p-4 bg-orange-100 rounded-lg">
              <p className="text-sm text-crust">
                We're working on reaching more universities! Please contact us at byte.chows@gmail.com
              </p>
            </div>
          )}

          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-black border border-gray-300 rounded-lg font-sans"
              placeholder="Password"
              required
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 text-black border border-gray-300 rounded-lg font-sans"
              placeholder="Confirm Password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition font-sans"
          >
            Register Restaurant
          </button>

          <div className="mt-4 text-center">
            <p className="text-accentwhite font-sans">Already registered?</p>
            <a
              href="/restaurant/login"
              className="text-blue-400 hover:text-blue-600 font-semibold mt-2 inline-block font-sans"
            >
              Login Here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantSignup;
