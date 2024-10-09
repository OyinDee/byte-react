import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HomeIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/cartContext";

const UserNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  const getLinkClassName = (path) =>
    location.pathname === path
      ? "text-cheese"
      : "hover:text-cheese transition-colors duration-200";

  const handleLogout = () => {
    if (window.confirm("Do you really want to log out?")) {
      alert("Aiit, calm... You have it!");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      alert("Thanks, I guess");
    }
  };

  return (
    <nav className="p-4 bg-olive">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        <Link to="/" className="text-2xl font-bold text-accentwhite">
          Byte!
        </Link>

        <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between p-4 bg-olive md:hidden">
          <ul className="flex justify-between w-full text-accentwhite">
            <li>
              <Link
                to="/user"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/user"
                )}`}
              >
                <HomeIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Home</span>
              </Link>
            </li>
            <li className="relative">
              <Link
                to="/user/cart"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/user/cart"
                )}`}
              >
                <ShoppingCartIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute px-2 py-1 text-xs rounded-full -top-2 left-4 text-cheese">
                    {itemCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/user/notifs"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/user/notifs"
                )}`}
              >
                <BellIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Notifs</span>
              </Link>
            </li>
            <li>
              <Link
                to="/user/profile"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/user/profile"
                )}`}
              >
                <UserIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Profile</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden space-x-8 md:flex text-accentwhite">
          <Link
            to="/user"
            className={`text-lg font-semibold ${getLinkClassName("/user")}`}
          >
            Home
          </Link>
          <Link
            to="/user/cart"
            className={`text-lg font-semibold ${getLinkClassName("/user/cart")}`}
          >
            Cart
            {itemCount > 0 && (
              <span className="px-2 py-1 text-xs rounded-full -top-2 left-4 text-cheese">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            to="/user/notifs"
            className={`text-lg font-semibold ${getLinkClassName("/user/notifs")}`}
          >
            Notifications
          </Link>
          <Link
            to="/user/profile"
            className={`text-lg font-semibold ${getLinkClassName(
              "/user/profile"
            )}`}
          >
            Profile
          </Link>
          <Link
            to="/login"
            className="text-lg font-semibold"
            onClick={handleLogout}
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
