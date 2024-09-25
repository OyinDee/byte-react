import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader"; 

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = [];

    if (!username.trim()) {
      newErrors.push("Username is required.");
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

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const fullPhoneNumber = `${phoneCode}${phoneNumber}`;

      await axios.post("https://mongobyte.vercel.app/api/v1/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password,
        phoneNumber: fullPhoneNumber,
      });
      navigate("/signupsuccess");
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
          src="/Images/burger.jpg" 
          alt="Burger Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {isLoading && <Loader />}

      <div
        className={`relative z-10 flex items-center justify-center min-h-screen ${
          isLoading ? "hidden" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-40 backdrop-blur-xs p-8 rounded-lg shadow-lg w-full max-w-md sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-accentwhite">
            Sign Up for Byte!
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
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-black p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your username..."
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black p-2 border border-gray-300 rounded mt-1"
              placeholder="Enter your email address..."
              required
            />
          </div>

          <div className="flex mb-4">
            <input
              type="text"
              id="phoneCode"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              className="w-1/3 p-2 border text-black border-gray-300 rounded-l mt-1"
              placeholder="Country code (e.g., +1)"
              required
            />
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-2/3 p-2 border text-black border-gray-300 rounded-r mt-1"
              placeholder="Phone number (10 digits)"
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded mt-1"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 text-black border border-gray-300 rounded mt-1"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Sign Up
          </button>

          <div className="mt-4 text-center">
            <p className="text-accentwhite">Already have an account?</p>
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-600 font-semibold mt-2 inline-block"
            >
              Log In Here!
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
