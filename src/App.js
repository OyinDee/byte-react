import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { CartProvider } from "./context/cartContext";
import { NotificationProvider } from "./context/notificationContext";
import { UniversitiesProvider } from "./context/universitiesContext";
import NavbarWrapper from "./components/NavbarWrapper";
import Home from "./pages/Home";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import UserDashboard from "./pages/UserDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminOrders from "./pages/superadmin/Orders";
import SuperAdminRestaurants from "./pages/superadmin/Restaurants";
import SuperAdminWithdrawals from "./pages/superadmin/Withdrawals";
import SignUpSuccess from "./pages/SignupSuccess";
import SignUp from "./components/Signup";
import ResetPassword from "./pages/ForgotPassword";
import Fund from "./pages/Fund";
import Profile from "./pages/Profile";
import CallbackPage from "./pages/FundCallback";
import CartPage from "./pages/CartPage";
import RestaurantPage from "./pages/CheckRestaurant";
import Notifications from "./pages/Notifications";
import RestaurantSignup from "./pages/RestaurantSignup";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import MealsPage from "./pages/MealsPage";
import OrderHistory from './pages/OrderHistory';
import AdminNotifs from "./pages/AdminNotifs";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
        <UniversitiesProvider>
          <NotificationProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <NavbarWrapper />
                <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signupsuccess" element={<SignUpSuccess />} />
              <Route path="/forgot-password" element={<ResetPassword />} />
              
              {/* User Routes */}
              <Route path="/user" element={<PrivateRoute element={<UserDashboard />} />} />
              <Route path="/user/notifs" element={<PrivateRoute element={<Notifications />} />} />
              <Route path="/user/profile" element={<PrivateRoute element={<Profile />} />} />
              <Route path="/user/cart" element={<PrivateRoute element={<CartPage />} />} />
              <Route path="/user/fund/callback" element={<PrivateRoute element={<CallbackPage />} />} />
              <Route path="/user/fund" element={<PrivateRoute element={<Fund />} />} />
              <Route path="/user/orderhistory" element={<PrivateRoute element={<OrderHistory />} />} />
              <Route path="/user/checkrestaurant/:id" element={<RestaurantPage />} />
              
              {/* Restaurant Routes */}
              <Route path="/restaurant/dashboard" element={<PrivateRoute element={<RestaurantDashboard />} />} />
              <Route path="/restaurant/notifications" element={<PrivateRoute element={<AdminNotifs />} />} />
              <Route path="/restaurant/menu" element={<PrivateRoute element={<MealsPage />} />} />
              <Route path="/restaurant/login" element={<AdminLogin />} />
              <Route path="/restaurant/signup" element={<PrivateRoute element={<RestaurantSignup />} allowedRoles={['superadmin']} />} />
              
              {/* SuperAdmin Routes */}
              <Route path="/superadmin/dashboard" element={<PrivateRoute element={<SuperAdminDashboard />} allowedRoles={['superadmin']} />} />
              <Route path="/superadmin/orders" element={<PrivateRoute element={<SuperAdminOrders />} allowedRoles={['superadmin']} />} />
              <Route path="/superadmin/restaurants" element={<PrivateRoute element={<SuperAdminRestaurants />} allowedRoles={['superadmin']} />} />
              <Route path="/superadmin/withdrawals" element={<PrivateRoute element={<SuperAdminWithdrawals />} allowedRoles={['superadmin']} />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer 
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />              </Router>
            </CartProvider>
          </NotificationProvider>
        </UniversitiesProvider>
      </SecurityProvider>
    </AuthProvider>
  );
}

export default App;
