import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { BRAND_NAME } from "../utils/brandAssets";

const Footer = () => {
  return (
    <footer className="bg-crust text-white py-16 mt-0 mb-12 lg:mb-0 border-t-4 border-pepperoni/50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4 text-cheese font-secondary">{BRAND_NAME}</h3>
            <p className="text-gray-300 mb-4 font-sans">
              Connecting hungry students with delicious food since 2023.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/bytechows" className="text-gray-300 hover:text-cheese transition-colors duration-200">
                <FaFacebook size={20} />
              </a>
              <a 
                href="https://www.instagram.com/byte.chows/profilecard/?igsh=MXBmb215emZ2OWNnOQ==" 
                className="text-gray-300 hover:text-cheese transition-colors duration-200"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="https://x.com/bytechows?t=g01iiJhi_07Jt0cdaT9siw&s=09" 
                className="text-gray-300 hover:text-cheese transition-colors duration-200"
              >
                <FaTwitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-cheese font-secondary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/login" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  Login
                </a>
              </li>
              <li>
                <a href="/signup" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  Sign Up
                </a>
              </li>
              <li>
                <a href="#restaurants" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  Restaurants
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  About Us
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-cheese font-secondary">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300 font-sans">
                <FaMapMarkerAlt className="mr-2 text-pepperoni" />
                Serving Universities Across Nigeria
              </li>
              <li className="flex items-center text-gray-300 font-sans">
                <FaPhone className="mr-2 text-pepperoni" />
                +234 808 632 1931
              </li>
              <li className="flex items-center text-gray-300 font-sans">
                <FaEnvelope className="mr-2 text-pepperoni" />
                byte.chows@gmail.com
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4 text-cheese font-secondary">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  Cookies Policy
                </a>
              </li>
              <li>
                <a href="/refunds" className="text-gray-300 hover:text-white transition-colors duration-200 font-sans">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p className="font-sans">&copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
