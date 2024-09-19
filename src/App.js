import React from "react";
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
import { ToastContainer } from "react-toastify";
import CartPage from "./pages/CartPage";
import RestaurantPage from "./pages/CheckRestaurant";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <NavbarWrapper />
          <Routes>
            <Route path="/user/notifs" element={<Notifications />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/user/cart" element={<CartPage />} />
            <Route path="/user/fund/callback" element={<CallbackPage />} />
            <Route path="/forgot-password" element={<ResetPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/user/fund" element={<Fund />} />
            <Route path="/signupsuccess" element={<SignUpSuccess />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/user"
              element={<PrivateRoute element={<UserDashboard />} />}
            />
            <Route
              path="/user/checkrestaurant/:id"
              element={<RestaurantPage />}
            />
            <Route
              path="/restaurant/dashboard"
              element={<PrivateRoute element={<RestaurantDashboard />} />}
            />
            <Route path="*" element={<NotFound />} />{" "}
          </Routes>
          <ToastContainer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
