import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

const SuperAdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPrimaryMenu, setShowPrimaryMenu] = useState(true);

  const getLinkClassName = (path) =>
    location.pathname === path
      ? "text-cheese"
      : "hover:text-cheese transition-colors duration-200";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
    <nav className="bg-black p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-yellow-500 text-2xl font-bold">
          SuperAdmin
        </Link>

        <div className="fixed bottom-0 inset-x-0 bg-black p-4 md:hidden flex justify-between items-center z-50">
          <ul className="flex justify-between w-full text-white relative">
            {showPrimaryMenu ? (
              <>
                <li>
                  <Link
                    to="/superadmin"
                    className={`flex flex-col items-center ${getLinkClassName(
                      "/superadmin"
                    )}`}
                  >
                    <HomeIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/superadmin/orders"
                    className={`flex flex-col items-center ${getLinkClassName(
                      "/superadmin/orders"
                    )}`}
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Orders</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/superadmin/restaurants"
                    className={`flex flex-col items-center ${getLinkClassName(
                      "/superadmin/restaurants"
                    )}`}
                  >
                    <BuildingStorefrontIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Restaurants</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/superadmin/withdrawals"
                    className={`flex flex-col items-center ${getLinkClassName(
                      "/superadmin/withdrawals"
                    )}`}
                  >
                    <CurrencyDollarIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">Withdrawals</span>
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

        <div className="hidden md:flex space-x-8 text-white">
          <Link
            to="/superadmin"
            className={`text-lg font-semibold ${getLinkClassName("/superadmin")}`}
          >
            Home
          </Link>
          <Link
            to="/superadmin/orders"
            className={`text-lg font-semibold ${getLinkClassName(
              "/superadmin/orders"
            )}`}
          >
            Orders
          </Link>
          <Link
            to="/superadmin/restaurants"
            className={`text-lg font-semibold ${getLinkClassName(
              "/superadmin/restaurants"
            )}`}
          >
            Restaurants
          </Link>
          <Link
            to="/superadmin/withdrawals"
            className={`text-lg font-semibold ${getLinkClassName(
              "/superadmin/withdrawals"
            )}`}
          >
            Withdrawals
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

export default SuperAdminNavbar;
