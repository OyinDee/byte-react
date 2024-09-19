import { useLocation, useNavigate } from "react-router-dom";
import { PlusCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const PublicNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getLinkClassName = (path) => {
    return location.pathname === path
      ? "text-cheese"
      : "hover:text-cheese transition-colors duration-200";
  };

  return (
    <nav className="bg-olive p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/restaurant/login"
          className="text-accentwhite text-2xl font-bold"
        >
          Byte!
        </Link>
        <div className="fixed bottom-0 inset-x-0 bg-olive p-4 md:hidden flex justify-between items-center z-50">
          <ul className="flex justify-between w-full px-10 text-accentwhite">
            <li>
              <Link
                to="/signup"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/signup"
                )}`}
              >
                <PlusCircleIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Sign Up</span>
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className={`flex flex-col items-center ${getLinkClassName(
                  "/login"
                )}`}
              >
                <UserIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Login</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="hidden md:flex space-x-8 text-accentwhite">
          <Link
            to="/signup"
            className={`text-lg font-semibold ${getLinkClassName("/signup")}`}
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className={`text-lg font-semibold ${getLinkClassName("/login")}`}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
