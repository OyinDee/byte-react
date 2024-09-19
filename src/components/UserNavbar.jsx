import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HomeIcon,
  ShoppingCartIcon,
  BellIcon,
  UserIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "../context/cartContext";

const UserNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPrimaryMenu, setShowPrimaryMenu] = useState(true);
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
    <nav className="bg-olive p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-accentwhite text-2xl font-bold">
          Byte!
        </Link>

        <div className="fixed bottom-0 inset-x-0 bg-olive p-4 md:hidden flex justify-between items-center z-50">
          <ul className="flex justify-between w-full text-accentwhite relative">
            {showPrimaryMenu ? (
              <>
                <li>
                  <Link
                    to="/user"
                    className={`flex flex-col items-center ${getLinkClassName(
                      "/user"
                    )}`}
                  >
                    <HomeIcon className="h-5 w-5 mb-1" />
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
                    <ShoppingCartIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Cart</span>
                    {itemCount > 0 && (
                      <span className="absolute -top-2 left-4 text-xs text-cheese rounded-full px-2 py-1">
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
                    <BellIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Notifs</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowPrimaryMenu(false)}
                    className="flex flex-col items-center hover:text-cheese transition-colors duration-200"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">More</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/user/profile"
                    className={`flex flex-col items-center ${getLinkClassName(
                      "/user/profile"
                    )}`}
                  >
                    <UserIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Profile</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/user/fund"
                    className={`flex flex-col items-center ${getLinkClassName(
                      "/user/fund"
                    )}`}
                  >
                    <PlusCircleIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Fund</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center hover:text-cheese transition-colors duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Logout</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowPrimaryMenu(true)}
                    className="flex flex-col items-center hover:text-cheese transition-colors duration-200"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Main</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="hidden md:flex space-x-8 text-accentwhite">
          <Link
            to="/user"
            className={`text-lg font-semibold ${getLinkClassName("/user")}`}
          >
            Home
          </Link>
          <Link
            to="/user/cart"
            className={`flex flex-col items-center ${getLinkClassName(
              "/user/cart"
            )}`}
          >
            <ShoppingCartIcon className="h-5 w-5 mb-1" />
            <span className="text-xs">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 left-4 text-xs text-cheese rounded-full px-2 py-1">
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
            to="/user/notifs"
            className={`text-lg font-semibold ${getLinkClassName(
              "/user/fund"
            )}`}
          >
            Fund
          </Link>
          <Link
            to="/user/profile"
            className={`text-lg font-semibold ${getLinkClassName(
              "/user/profile"
            )}`}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
