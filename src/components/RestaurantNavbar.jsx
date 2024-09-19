import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const RestaurantNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getLinkClassName = (path) =>
    location.pathname === path
      ? "text-cheese"
      : "hover:text-cheese transition-colors duration-200";

  const handleLogout = () => {
    if (window.confirm("Do you really want to log out?")) {
      alert("Aiit, calm... You have it!");
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <nav className="bg-olive p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/restaurant" className="text-accentwhite text-2xl font-bold">
          Byte!
        </Link>
        <div className="fixed bottom-0 inset-x-0 bg-olive p-4 md:hidden flex justify-between items-center z-50">
          <ul className="flex justify-between w-full text-accentwhite">
            <li>
              <Link
                to="/restaurant/dashboard"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/restaurant/dashboard"
                )}`}
              >
                <HomeIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/restaurant/menu"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/restaurant/menu"
                )}`}
              >
                <ShoppingBagIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Meals</span>
              </Link>
            </li>
            <li>
              <Link
                to="/restaurant/notifications"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/restaurant/notifications"
                )}`}
              >
                <BellIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Notifications</span>
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
          </ul>
        </div>

        <div className="hidden md:flex space-x-8 text-accentwhite">
          <Link
            to="/restaurant/dashboard"
            className={`text-lg font-semibold ${getLinkClassName(
              "/restaurant/dashboard"
            )}`}
          >
            Dashboard
          </Link>
          <Link
            to="/restaurant/menu"
            className={`text-lg font-semibold ${getLinkClassName(
              "/restaurant/menu"
            )}`}
          >
            Meals
          </Link>
          <Link
            to="/restaurant/notifications"
            className={`text-lg font-semibold ${getLinkClassName(
              "/restaurant/notifications"
            )}`}
          >
            Notifications
          </Link>
          <button
            onClick={handleLogout}
            className="text-lg font-semibold hover:text-cheese transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default RestaurantNavbar;
