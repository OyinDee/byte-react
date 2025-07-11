import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUtensils, FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingPage from '../components/Loader';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://mongobyte.vercel.app/api/v1/restaurants/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, restaurant } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('byteUser', JSON.stringify(restaurant));

        window.location.href = '/restaurant/dashboard';
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-olive">
      <div className="absolute inset-0">
        <img
          src="/Images/fc.jpg"
          alt="Restaurant Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-65"></div>
      </div>

      {loading && <LoadingPage />}

      <div className={`relative z-10 flex items-center justify-center min-h-screen py-12 px-4 ${loading ? 'hidden' : ''}`}>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleLogin}
          className="bg-white bg-opacity-15 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white border-opacity-20"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="bg-cheese bg-opacity-20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FaUtensils className="text-cheese text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-accentwhite font-secondary">
              Restaurant Portal
            </h2>
            <p className="mt-2 text-accentwhite opacity-90 font-sans">
              Sign in to manage your restaurant and orders
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-pepperoni bg-opacity-90 text-white rounded-lg shadow-lg"
            >
              <p className="text-center text-sm font-sans">{error}</p>
            </motion.div>
          )}

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-accentwhite mb-2 font-sans">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-accentwhite placeholder-gray-300 focus:ring-2 focus:ring-cheese focus:border-transparent transition-all duration-300 font-sans"
                placeholder="Enter your restaurant email"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative"
            >
              <label htmlFor="password" className="block text-sm font-semibold text-accentwhite mb-2 font-sans">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-accentwhite placeholder-gray-300 focus:ring-2 focus:ring-cheese focus:border-transparent transition-all duration-300 font-sans"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-accentwhite transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className={`w-full py-3 rounded-xl font-semibold text-crust bg-cheese hover:bg-yellow-400 shadow-lg transition-all duration-300 font-sans ${
                loading ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            </motion.button>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 text-center space-y-4"
          >
            <div className="h-px bg-white bg-opacity-20"></div>
            <p className="text-accentwhite opacity-90 font-sans">New to our platform?</p>
            <Link
              to="/restaurant/signup"
              className="inline-block text-cheese hover:text-yellow-400 font-semibold font-sans transition-colors duration-300"
            >
              Register Your Restaurant →
            </Link>
            
            <div className="pt-4">
              <Link 
                to="/login" 
                className="text-xs text-gray-300 hover:text-accentwhite underline font-sans transition-colors"
              >
                Customer? Login here
              </Link>
            </div>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default AdminLogin;
