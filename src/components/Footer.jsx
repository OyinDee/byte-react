import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-olive text-accentwhite py-6 mb-6">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a href="#" className="hover:text-cheese transition">
            Terms of Service
          </a>
          <a href="#" className="hover:text-cheese transition">
            Privacy Policy
          </a>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Byte. All rights reserved.
        </p>
        <div className="flex justify-center mt-6">
          <a
            href="#"
            className="text-accentwhite mx-4 hover:text-cheese transition-colors duration-200"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="#"
            className="text-accentwhite mx-4 hover:text-cheese transition-colors duration-200"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="#"
            className="text-accentwhite mx-4 hover:text-cheese transition-colors duration-200"
          >
            <FaTwitter size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
