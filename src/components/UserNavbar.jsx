import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/cartContext";
import { checkNotificationPermission, subscribeUserToPush } from "../utils/notificationUtil";
import { BRAND_LOGO, BRAND_NAME } from "../utils/brandAssets";

const UserNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkNotificationPermission();
      setIsNotificationsEnabled(hasPermission);
    };
    
    checkPermission();
  }, []);

  const getLinkClassName = (path) =>
    location.pathname === path
      ? "text-cheese font-bold"
      : "text-white hover:text-cheese transition-all duration-300";

  const getMobileLinkClassName = (path) =>
    location.pathname === path
      ? "bg-pepperoni text-white shadow-lg scale-105"
      : "text-white hover:bg-crust/20 transition-all duration-300";

  const handleLogout = () => {
    if (window.confirm("Do you really want to log out?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const handleEnableNotifications = async () => {
    const subscription = await subscribeUserToPush();
    if (subscription) {
      setIsNotificationsEnabled(true);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-crust shadow-lg fixed w-full top-0 z-50 hidden md:block">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/user" className="flex items-center space-x-3 text-white hover:opacity-90 transition-opacity duration-300">
              <motion.img 
                src={BRAND_LOGO} 
                alt="Byte Logo" 
                className="w-10 h-10"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{BRAND_NAME}</span>
                <span className="text-xs text-cheese flex items-center">
                  <AcademicCapIcon className="w-3 h-3 mr-1" />
                  Campus Food Delivery
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                to="/user"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${getLinkClassName("/user")}`}
              >
                <HomeIcon className="w-5 h-5" />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link
                to="/user/cart"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 relative ${getLinkClassName("/user/cart")}`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="font-medium">Cart</span>
                {itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-pepperoni rounded-full text-white text-xs font-bold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>
              
              <Link
                to="/user/notifs"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${getLinkClassName("/user/notifs")}`}
              >
                <BellIcon className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white hover:text-cheese transition-all duration-300"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
                
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white border border-gray-100 py-2 z-50"
                    >
                      <Link
                        to="/user/profile"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <UserIcon className="w-4 h-4 inline mr-2" />
                        View Profile
                      </Link>
                      <Link
                        to="/user/order-history"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <ShoppingCartIcon className="w-4 h-4 inline mr-2" />
                        Order History
                      </Link>
                      {!isNotificationsEnabled && (
                        <button
                          onClick={() => {
                            handleEnableNotifications();
                            setShowProfileMenu(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <BellIcon className="w-4 h-4 inline mr-2" />
                          Enable Notifications
                        </button>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="bg-crust shadow-lg fixed w-full top-0 z-40 flex md:hidden ps-3">
        <div className="w-full px-4 py-4">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white"
            >
              <img 
                src={BRAND_LOGO} 
                alt="Byte Logo" 
                className="w-9 h-9"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold">{BRAND_NAME}</span>
                <span className="text-xs text-cheese flex items-center">
                  <AcademicCapIcon className="w-2 h-2 mr-1" />
                  Campus Delivery
                </span>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <motion.nav 
        className="fixed inset-x-0 bottom-0 z-50 bg-crust md:hidden shadow-2xl border-t border-gray-800"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="px-2 py-1">
          <div className="flex justify-around items-center">
            <Link
              to="/user"
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ${getMobileLinkClassName("/user")}`}
            >
              <HomeIcon className="w-6 h-6 mb-1 text-current" />
              <span className="text-xs font-medium text-current">Home</span>
            </Link>
            
            <Link
              to="/user/cart"
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 relative ${getMobileLinkClassName("/user/cart")}`}
            >
              <ShoppingCartIcon className="w-6 h-6 mb-1 text-current" />
              <span className="text-xs font-medium text-current">Cart</span>
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-pepperoni rounded-full text-white text-xs font-bold"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>
            
            <Link
              to="/user/notifs"
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ${getMobileLinkClassName("/user/notifs")}`}
            >
              <BellIcon className="w-6 h-6 mb-1 text-current" />
              <span className="text-xs font-medium text-current">Notifs</span>
            </Link>
            
            <Link
              to="/user/profile"
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 ${getMobileLinkClassName("/user/profile")}`}
            >
              <UserIcon className="w-6 h-6 mb-1 text-current" />
              <span className="text-xs font-medium text-current">Profile</span>
            </Link>
          </div>
        </div>
      </motion.nav>
      
      {/* Content padding to avoid navbar overlap */}
      <div className="pt-12 pb-24 md:pt-20 md:pb-0"></div>
    </>
  );
};

export default UserNavbar;
