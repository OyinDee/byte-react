import { useLocation, useNavigate } from "react-router-dom";
import { PlusCircleIcon, UserIcon, AcademicCapIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BRAND_LOGO, BRAND_NAME } from "../utils/brandAssets";

const PublicNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getLinkClassName = (path) => {
    return location.pathname === path
      ? "text-cheese font-semibold"
      : "hover:text-cheese transition-all duration-300";
  };

  const getMobileLinkClassName = (path) => {
    return location.pathname === path
      ? "bg-pepperoni text-white"
      : "text-white hover:bg-pepperoni/10 transition-all duration-300";
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-crust shadow-lg fixed w-full top-0 z-50 hidden md:block">
        <div className="w-full px-8 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <Link
              to="/"
              className="flex items-center space-x-3 text-white hover:opacity-90 transition-opacity duration-300"
            >
              <motion.img 
                src={BRAND_LOGO} 
                alt="Byte Logo" 
                className="w-12 h-12"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-secondary">{BRAND_NAME}</span>
                <span className="text-sm text-cheese flex items-center font-sans">
                  <AcademicCapIcon className="w-4 h-4 mr-1" />
                  Campus Food Delivery
                </span>
              </div>
            </Link>

            <div className="bg-crust/30 backdrop-blur-sm rounded-2xl p-2 flex items-center space-x-2 shadow-lg">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 font-sans ${
                    location.pathname === "/signup"
                      ? "bg-cheese text-crust shadow-md"
                      : "bg-transparent border-2 border-cheese text-cheese hover:bg-cheese hover:text-crust"
                  }`}
                >
                  <UserIcon className="w-4 h-4 inline mr-2" />
                  Sign Up
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 font-sans ${
                    location.pathname === "/login"
                      ? "bg-pepperoni text-white shadow-md"
                      : "bg-transparent border-2 border-pepperoni text-pepperoni hover:bg-pepperoni hover:text-white"
                  }`}
                >
                  Login
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="bg-crust shadow-lg fixed w-full top-0 z-40 flex md:hidden">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white"
            >
              <img 
                src={BRAND_LOGO} 
                alt="Byte Logo" 
                className="w-10 h-10"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold font-secondary">{BRAND_NAME}</span>
                <span className="text-sm text-cheese flex items-center justify-center font-sans">
                  <AcademicCapIcon className="w-4 h-4 mr-1" />
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
        <div className="bg-crust rounded-t-2xl px-8 py-2 mx-2 mb-1 shadow-lg">
          <div className="flex justify-center items-center space-x-24">
            <Link
              to="/signup"
              className={`flex flex-col items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 font-sans ${
                location.pathname === "/signup"
                  ? "bg-cheese text-crust shadow-md"
                  : "text-white hover:bg-cheese/20 hover:text-cheese"
              }`}
            >
              <PlusCircleIcon className="h-6 w-6 mb-1 fill-current" />
              <span className="text-xs font-medium">Sign Up</span>
            </Link>
            
            <Link
              to="/login"
              className={`flex flex-col items-center justify-center px-6 py-3 rounded-xl transition-all duration-300 font-sans ${
                location.pathname === "/login"
                  ? "bg-pepperoni text-white shadow-md"
                  : "text-white hover:bg-pepperoni/20 hover:text-pepperoni"
              }`}
            >
              <UserIcon className="h-6 w-6 mb-1 fill-current" />
              <span className="text-xs font-medium">Login</span>
            </Link>
          </div>
        </div>
      </motion.nav>
      
      {/* Content padding to avoid navbar overlap only for non-landing pages */}
      <div className="hidden"></div>
    </>
  );
};

export default PublicNavbar;
