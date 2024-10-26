import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Loader from './Loader'; 
import { Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const byteUser = localStorage.getItem('byteUser');
    if (token && byteUser) {
        navigate("/user");   
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = [];
    if (!username.trim()) {
      newErrors.push("Username is required.");
    }
    if (!password.trim()) {
      newErrors.push("Password is required.");
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
      const response = await axios.post('https://mongobyte.onrender.com/api/v1/auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        navigate('/signupsuccess');
      } else if (response.status === 202) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        localStorage.setItem('byteUser', JSON.stringify(decodedToken.user));
        window.location.reload()
      }
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
    <div className="relative min-h-screen bg-black">
      <div className="absolute inset-0">
        <img
          src="/Images/burger.jpg"
          alt="Burger Background"
          className="object-cover w-full h-full z-0"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {isLoading && <Loader />}

      <div className={`relative z-10 flex items-center justify-center min-h-screen ${isLoading ? 'hidden' : ''}`}>
        <form
          onSubmit={handleSubmit}
          className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-accentwhite">Login to Byte!</h2>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-crust text-accentwhite rounded-lg">
              <ul>
                {errors.map((error, index) => (
                  <li key={index} className="mb-2">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <input
              type="text"
              id="username"
              value={username.trim()}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border text-black border-gray-300 rounded mt-1"
              placeholder="Enter your username..."
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border text-black border-gray-300 rounded mt-1"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-crust text-accentwhite py-2 rounded-lg hover:bg-olive transition"
          >
            Byte IN!
          </button>

          <div className="mt-4 text-center">
            <Link to="/forgot-password">
              <span className="text-pepperoni hover:text-red-600 font-semibold mt-2 inline-block">
                Forgot Password?
              </span>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-accentwhite">Don’t have an account?</p>
            <Link to="/signup">
              <span className="text-pepperoni hover:text-red-600 font-semibold mt-2 inline-block">
                Sign Up Now!
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
