import React, { useState } from 'react';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://mongobyte.onrender.com/api/v1/restaurants/login', {
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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      {/* Login Form */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-8 border border-gray-200">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-black">Restaurant Dashboard Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your restaurant profile and orders.
          </p>
        </div>

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md focus:ring-black focus:border-black text-gray-700 shadow-sm border border-gray-300"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-md focus:ring-black focus:border-black text-gray-700 shadow-sm border border-gray-300"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold text-white bg-black hover:bg-gray-800 shadow-md transition duration-200 ${
                loading ? 'cursor-not-allowed opacity-50' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Don't have a restaurant account?</p>
            <a
              href="/restaurant/signup"
              className="mt-2 inline-block text-sm font-medium text-black hover:underline"
            >
              Register your restaurant
            </a>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
