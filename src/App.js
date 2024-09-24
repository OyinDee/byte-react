import React from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import NavbarWrapper from "./components/NavbarWrapper";
import Home from "./pages/Home";
import Login from "./components/Login";
import { CartProvider } from "./context/cartContext";
import PrivateRoute from "./components/PrivateRoute";
import UserDashboard from "./pages/UserDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import SignUpSuccess from "./pages/SignupSuccess";
import SignUp from "./components/Signup";
import ResetPassword from "./pages/ForgotPassword";
import Fund from "./pages/Fund";
import Profile from "./pages/Profile";
import CallbackPage from "./pages/FundCallback";
import CartPage from "./pages/CartPage";
import RestaurantPage from "./pages/CheckRestaurant";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import MealsPage from "./pages/MealsPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <NavbarWrapper />
          <Routes>

            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signupsuccess" element={<SignUpSuccess />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            

            <Route
              path="/user"
              element={<PrivateRoute element={<UserDashboard />} />}
            />
            <Route
              path="/user/notifs"
              element={<PrivateRoute element={<Notifications />} />}
            />
            <Route
              path="/user/profile"
              element={<PrivateRoute element={<Profile />} />}
            />
            <Route
              path="/user/cart"
              element={<PrivateRoute element={<CartPage />} />}
            />
            <Route
              path="/user/fund/callback"
              element={<PrivateRoute element={<CallbackPage />} />}
            />
            <Route
              path="/user/fund"
              element={<PrivateRoute element={<Fund />} />}
            />
            <Route
              path="/user/checkrestaurant/:id"
              element={<PrivateRoute element={<RestaurantPage />} />}
            />
            <Route
              path="/restaurant/dashboard"
              element={<PrivateRoute element={<RestaurantDashboard />} />}
            />
              <Route
              path="/restaurant/notifications"
              element={<PrivateRoute element={<Notifications />} />}
            />
            <Route
              path="/restaurant/menu"
              element={<PrivateRoute element={<MealsPage />} />}
            />
            <Route path="/restaurant/login" element={<AdminLogin />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
