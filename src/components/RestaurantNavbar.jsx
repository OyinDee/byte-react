import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBagIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { BRAND_LOGO, BRAND_NAME } from "../utils/brandAssets";

const RestaurantNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-crust shadow-lg fixed w-full top-0 z-50 hidden md:block">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/restaurant/dashboard" className="flex items-center space-x-3 text-white hover:opacity-90 transition-opacity duration-300">
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
                  Restaurant Portal
                </span>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
              <Link
                to="/restaurant/dashboard"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${getLinkClassName("/restaurant/dashboard")}`}
              >
                <ChartBarIcon className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link
                to="/restaurant/menu"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${getLinkClassName("/restaurant/menu")}`}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="font-medium">Menu</span>
              </Link>
              
              <Link
                to="/restaurant/notifications"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${getLinkClassName("/restaurant/notifications")}`}
              >
                <BellIcon className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-pepperoni text-white rounded-xl hover:bg-pepperoni/80 transition-all duration-300"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="bg-crust shadow-lg fixed w-full top-0 z-40 flex md:hidden">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-center">
            <Link
              to="/restaurant/dashboard"
              className="flex items-center space-x-2 text-white"
            >
              <img 
                src={BRAND_LOGO} 
                alt="Byte Logo" 
                className="w-8 h-8"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold">{BRAND_NAME}</span>
                <span className="text-xs text-cheese flex items-center justify-center">
                  <AcademicCapIcon className="w-3 h-3 mr-1" />
                  Restaurant Portal
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
              to="/restaurant/dashboard"
              className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl transition-all duration-300 ${getMobileLinkClassName("/restaurant/dashboard")}`}
            >
              <ChartBarIcon className="w-6 h-6 mb-1 text-current" />
              <span className="text-xs font-medium text-current">Dashboard</span>
            </Link>
            
            <Link
              to="/restaurant/menu"
              className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl transition-all duration-300 ${getMobileLinkClassName("/restaurant/menu")}`}
            >
              <ShoppingBagIcon className="w-6 h-6 mb-1 text-current" />
              <span className="text-xs font-medium text-current">Menu</span>
            </Link>
            
            <Link
              to="/restaurant/notifications"
              className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl transition-all duration-300 ${getMobileLinkClassName("/restaurant/notifications")}`}
            >
              <BellIcon className="w-6 h-6 mb-1 text-current" />
              <span className="text-xs font-medium text-current">Notifications</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center px-3 py-3 rounded-xl text-pepperoni hover:bg-pepperoni/10 transition-all duration-300"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.nav>
      
      {/* Content padding to avoid navbar overlap */}
      <div className="pb-16 md:pb-0"></div>
    </>
  );
};

export default RestaurantNavbar;
